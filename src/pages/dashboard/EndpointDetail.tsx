import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getEndpoint, Endpoint, getMockApiUrl } from '../../utils/api';
import { publicAnonKey } from '../../utils/supabase/info';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function EndpointDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [endpoint, setEndpoint] = useState<Endpoint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEndpoint();
  }, [id, accessToken]);

  const loadEndpoint = async () => {
    if (!accessToken || !id) return;

    try {
      setLoading(true);
      const data = await getEndpoint(accessToken, id);
      setEndpoint(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load endpoint');
      navigate('/dashboard/endpoints');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading endpoint...</p>
      </div>
    );
  }

  if (!endpoint) {
    return (
      <div className="p-8">
        <p>Endpoint not found</p>
        <Button onClick={() => navigate('/dashboard/endpoints')} className="mt-4">
          Back to Endpoints
        </Button>
      </div>
    );
  }

  const apiUrl = getMockApiUrl(endpoint);
  const baseUrl = apiUrl.split(endpoint.path)[0];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const authHeader = endpoint.requireAuth ? `\n    'X-Auth-Token': 'your-auth-token',` : '';
  const curlAuthHeader = endpoint.requireAuth ? ` \\\n  -H 'X-Auth-Token: your-auth-token'` : '';
  const pythonAuthHeader = endpoint.requireAuth ? `\n    'X-Auth-Token': 'your-auth-token',` : '';

  const codeExamples = {
    javascript: `// JavaScript (Fetch API)
fetch('${apiUrl}', {
  method: '${endpoint.method}',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${publicAnonKey}'${authHeader}
  }${endpoint.method !== 'GET' && endpoint.method !== 'DELETE' ? `,\n  body: JSON.stringify({\n    // Your request body\n  })` : ''}
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,

    curl: `# cURL
curl -X ${endpoint.method} '${apiUrl}' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer ${publicAnonKey}'${curlAuthHeader}${endpoint.method !== 'GET' && endpoint.method !== 'DELETE' ? ` \\\n  -d '{"key":"value"}'` : ''}`,

    python: `# Python (requests)
import requests

url = '${apiUrl}'
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${publicAnonKey}'${pythonAuthHeader}
}${endpoint.method !== 'GET' && endpoint.method !== 'DELETE' ? `\ndata = {\n    # Your request body\n}` : ''}

response = requests.${endpoint.method.toLowerCase()}(url, headers=headers${endpoint.method !== 'GET' && endpoint.method !== 'DELETE' ? ', json=data' : ''})
print(response.json())`,
  };

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="gap-2 mb-4"
          onClick={() => navigate('/dashboard/endpoints')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Endpoints
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge>{endpoint.method}</Badge>
            </div>
            <h1>{endpoint.name}</h1>
            <p className="text-muted-foreground mt-2">{endpoint.description || 'No description'}</p>
          </div>
        </div>
      </div>

      {/* API URL */}
      <Card className="mb-6 border-2">
        <CardHeader>
          <CardTitle>API Endpoint URL</CardTitle>
          <CardDescription>Use this URL in your applications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm mb-2">Endpoint URL:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-3 bg-muted rounded-lg font-mono text-sm overflow-x-auto border">
                  {apiUrl}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(apiUrl, 'URL')}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm mb-2">Public Anon Key (required for all requests):</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-3 bg-muted rounded-lg font-mono text-sm overflow-x-auto  border">
                  {publicAnonKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(publicAnonKey, 'API Key')}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm ">
                  <strong>Safe to Share:</strong> This public anon key is designed to be shared freely. Include it in your frontend code, documentation, and share it with your team.
                </p>
                <p className="text-xs text-muted-foreground break-all">
                  All requests must include this in the Authorization header: <code className="px-1.5 py-0.5 bg-muted rounded">Authorization: Bearer {publicAnonKey}</code>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{endpoint.callCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Status Code</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{endpoint.statusCode}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{new Date(endpoint.createdAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Configuration */}
      {(endpoint.delay || endpoint.requireAuth) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Additional Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {endpoint.delay !== undefined && endpoint.delay > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Response Delay</p>
                <Badge variant="secondary">{endpoint.delay}ms</Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  This endpoint will wait {endpoint.delay}ms before responding
                </p>
              </div>
            )}
            {endpoint.requireAuth && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Authentication Required</p>
                <Badge variant="secondary">X-Auth-Token</Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Requests must include the X-Auth-Token header with the correct token
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
          <CardDescription>Copy and paste these examples into your application</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="javascript">
            <TabsList>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            {Object.entries(codeExamples).map(([lang, code]) => (
              <TabsContent key={lang} value={lang}>
                <div className="relative">
                  <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                    <code className="text-sm font-mono">{code}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(code, 'Code')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Response Configuration */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Response Configuration</CardTitle>
          <CardDescription>The configured response for this endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
            <code className="text-sm font-mono">
              {JSON.stringify(endpoint.responseData, null, 2)}
            </code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
