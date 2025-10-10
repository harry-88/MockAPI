import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Helper function to verify user authentication
async function verifyUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return { user: null, error: 'No access token provided' };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (!user) {
    return { user: null, error: error?.message || 'Unauthorized' };
  }
  
  return { user, error: null };
}

// Sign up endpoint
app.post('/make-server-ade39ab0/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log('Sign up error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ data });
  } catch (error) {
    console.log('Sign up exception:', error);
    return c.json({ error: 'Internal server error during sign up' }, 500);
  }
});

// Get all endpoints for a user
app.get('/make-server-ade39ab0/endpoints', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error }, 401);
    }

    const endpointIds = await kv.get(`user:${user.id}:endpoints`) || [];
    const endpoints = await kv.mget(endpointIds.map((id: string) => `endpoint:${id}`));

    return c.json({ endpoints: endpoints.filter(Boolean) });
  } catch (error) {
    console.log('Get endpoints error:', error);
    return c.json({ error: 'Failed to fetch endpoints' }, 500);
  }
});

// Create a new endpoint
app.post('/make-server-ade39ab0/endpoints', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error }, 401);
    }

    const body = await c.req.json();
    const { name, method, path, responseData, statusCode, headers, description } = body;

    if (!name || !method || !path) {
      return c.json({ error: 'Name, method, and path are required' }, 400);
    }

    // Validate path format
    if (!path.startsWith('/')) {
      return c.json({ error: 'Path must start with /' }, 400);
    }

    // Check if path already exists
    const existingPath = await kv.get(`path:${path}`);
    if (existingPath) {
      return c.json({ error: 'Path already exists. Please use a unique path.' }, 400);
    }

    const endpointId = crypto.randomUUID();
    const endpoint = {
      id: endpointId,
      userId: user.id,
      name,
      method: method.toUpperCase(),
      path,
      responseData: responseData || {},
      statusCode: statusCode || 200,
      headers: headers || {},
      description: description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      callCount: 0,
    };

    // Save endpoint
    await kv.set(`endpoint:${endpointId}`, endpoint);

    // Create path index for quick lookup
    await kv.set(`path:${path}`, { endpointId, userId: user.id });

    // Add to user's endpoint list
    const userEndpoints = await kv.get(`user:${user.id}:endpoints`) || [];
    userEndpoints.push(endpointId);
    await kv.set(`user:${user.id}:endpoints`, userEndpoints);

    return c.json({ endpoint });
  } catch (error) {
    console.log('Create endpoint error:', error);
    return c.json({ error: 'Failed to create endpoint' }, 500);
  }
});

// Get endpoint details
app.get('/make-server-ade39ab0/endpoints/:id', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error }, 401);
    }

    const endpointId = c.req.param('id');
    const endpoint = await kv.get(`endpoint:${endpointId}`);

    if (!endpoint) {
      return c.json({ error: 'Endpoint not found' }, 404);
    }

    if (endpoint.userId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    return c.json({ endpoint });
  } catch (error) {
    console.log('Get endpoint error:', error);
    return c.json({ error: 'Failed to fetch endpoint' }, 500);
  }
});

// Update endpoint
app.put('/make-server-ade39ab0/endpoints/:id', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error }, 401);
    }

    const endpointId = c.req.param('id');
    const endpoint = await kv.get(`endpoint:${endpointId}`);

    if (!endpoint) {
      return c.json({ error: 'Endpoint not found' }, 404);
    }

    if (endpoint.userId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const body = await c.req.json();
    
    // If path is being changed, update the path index
    if (body.path && body.path !== endpoint.path) {
      // Check if new path already exists
      const existingPath = await kv.get(`path:${body.path}`);
      if (existingPath && existingPath.endpointId !== endpointId) {
        return c.json({ error: 'Path already exists. Please use a unique path.' }, 400);
      }
      
      // Delete old path index
      await kv.del(`path:${endpoint.path}`);
      
      // Create new path index
      await kv.set(`path:${body.path}`, { endpointId, userId: user.id });
    }
    
    const updatedEndpoint = {
      ...endpoint,
      ...body,
      id: endpointId,
      userId: user.id,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`endpoint:${endpointId}`, updatedEndpoint);

    return c.json({ endpoint: updatedEndpoint });
  } catch (error) {
    console.log('Update endpoint error:', error);
    return c.json({ error: 'Failed to update endpoint' }, 500);
  }
});

// Delete endpoint
app.delete('/make-server-ade39ab0/endpoints/:id', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error }, 401);
    }

    const endpointId = c.req.param('id');
    const endpoint = await kv.get(`endpoint:${endpointId}`);

    if (!endpoint) {
      return c.json({ error: 'Endpoint not found' }, 404);
    }

    if (endpoint.userId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Delete path index
    await kv.del(`path:${endpoint.path}`);

    // Remove from user's endpoint list
    const userEndpoints = await kv.get(`user:${user.id}:endpoints`) || [];
    const updatedEndpoints = userEndpoints.filter((id: string) => id !== endpointId);
    await kv.set(`user:${user.id}:endpoints`, updatedEndpoints);

    // Delete endpoint
    await kv.del(`endpoint:${endpointId}`);

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete endpoint error:', error);
    return c.json({ error: 'Failed to delete endpoint' }, 500);
  }
});

// Get analytics data
app.get('/make-server-ade39ab0/analytics', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error }, 401);
    }

    const endpointIds = await kv.get(`user:${user.id}:endpoints`) || [];
    const endpoints = await kv.mget(endpointIds.map((id: string) => `endpoint:${id}`));
    const validEndpoints = endpoints.filter(Boolean);

    const totalEndpoints = validEndpoints.length;
    const totalCalls = validEndpoints.reduce((sum: number, ep: any) => sum + (ep?.callCount || 0), 0);
    const activeEndpoints = validEndpoints.filter((ep: any) => ep?.callCount > 0).length;
    
    // Calculate method distribution based on actual endpoints and their call counts
    const methodCounts: Record<string, number> = {};
    let totalMethodCalls = 0;
    
    validEndpoints.forEach((ep: any) => {
      const method = ep.method || 'GET';
      const calls = ep.callCount || 0;
      methodCounts[method] = (methodCounts[method] || 0) + calls;
      totalMethodCalls += calls;
    });
    
    // Convert to percentages
    const methodDistribution: Record<string, number> = {};
    if (totalMethodCalls > 0) {
      Object.entries(methodCounts).forEach(([method, count]) => {
        methodDistribution[method] = Math.round((count / totalMethodCalls) * 100);
      });
    } else {
      // Default distribution if no calls yet
      methodDistribution['GET'] = 0;
      methodDistribution['POST'] = 0;
      methodDistribution['PUT'] = 0;
      methodDistribution['DELETE'] = 0;
    }
    
    // Get daily stats for the past 7 days
    const dailyStats = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Get calls for this date
      const dayKey = `analytics:${user.id}:daily:${dateStr}`;
      const dayData = await kv.get(dayKey) || { calls: 0, errors: 0 };
      
      dailyStats.push({
        date: dateStr,
        calls: dayData.calls || 0,
        errors: dayData.errors || 0,
      });
    }
    
    // Calculate success rate from daily stats
    const totalTrackedCalls = dailyStats.reduce((sum, day) => sum + day.calls, 0);
    const totalErrors = dailyStats.reduce((sum, day) => sum + day.errors, 0);
    const successRate = totalTrackedCalls > 0 
      ? Number(((totalTrackedCalls - totalErrors) / totalTrackedCalls * 100).toFixed(1))
      : 100;
    
    const analytics = {
      totalEndpoints,
      totalCalls,
      activeEndpoints,
      avgResponseTime: 45, // This would need request timing tracking
      successRate,
      dailyStats,
      methodDistribution,
    };

    return c.json({ analytics });
  } catch (error) {
    console.log('Get analytics error:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// Mock API endpoint handler - this handles actual API calls to the mock endpoints
// Routes by path, e.g., /make-server-ade39ab0/users, /make-server-ade39ab0/posts/:id
app.all('/make-server-ade39ab0/*', async (c) => {
  const startTime = Date.now();
  
  try {
    // Extract the path after /make-server-ade39ab0
    const fullPath = c.req.path;
    const path = '/' + fullPath.split('/make-server-ade39ab0/')[1];
    
    // Look up endpoint by path (single KV call)
    const pathIndex = await kv.get(`path:${path}`) || {};
    const endpointId = pathIndex.endpointId;
    const userId = pathIndex.userId;
    
    if (!endpointId) {
      return c.json({ error: 'Endpoint not found' }, 404);
    }
    
    const endpoint = await kv.get(`endpoint:${endpointId}`);

    if (!endpoint) {
      return c.json({ error: 'Endpoint not found' }, 404);
    }

    // Check authentication if required
    if (endpoint.requireAuth) {
      const authToken = c.req.header('X-Auth-Token');
      if (!authToken || authToken !== endpoint.authToken) {
        return c.json({ error: 'Unauthorized: Invalid or missing X-Auth-Token' }, 401);
      }
    }

    // Apply delay if configured (before analytics to not slow down tracking)
    if (endpoint.delay && endpoint.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, endpoint.delay));
    }

    // Asynchronously update analytics (don't wait for completion)
    Promise.all([
      // Increment call count
      kv.set(`endpoint:${endpointId}`, {
        ...endpoint,
        callCount: (endpoint.callCount || 0) + 1,
      }),
      // Track daily analytics
      (async () => {
        if (userId) {
          const today = new Date().toISOString().split('T')[0];
          const dayKey = `analytics:${userId}:daily:${today}`;
          const dayData = await kv.get(dayKey) || { calls: 0, errors: 0 };
          
          dayData.calls = (dayData.calls || 0) + 1;
          
          const statusCode = endpoint.statusCode || 200;
          if (statusCode >= 400) {
            dayData.errors = (dayData.errors || 0) + 1;
          }
          
          await kv.set(dayKey, dayData);
        }
      })()
    ]).catch(err => console.error('Analytics update error:', err));

    // Return configured response immediately
    const response = c.json(endpoint.responseData, endpoint.statusCode || 200);
    
    // Add custom headers if configured
    if (endpoint.headers) {
      Object.entries(endpoint.headers).forEach(([key, value]) => {
        response.headers.set(key, value as string);
      });
    }

    return response;
  } catch (error) {
    console.error('Mock API handler error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

Deno.serve(app.fetch);
