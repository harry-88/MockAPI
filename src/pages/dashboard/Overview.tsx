import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { getEndpoints, Endpoint } from '../../utils/api';
import { Activity, Boxes, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner@2.0.3';

export function Overview() {
  const { accessToken } = useAuth();
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEndpoints();
  }, [accessToken]);

  const loadEndpoints = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const data = await getEndpoints(accessToken);
      setEndpoints(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load endpoints');
    } finally {
      setLoading(false);
    }
  };

  const totalCalls = endpoints.reduce((sum, ep) => sum + (ep.callCount || 0), 0);
  const avgResponseTime = 145; // Mock data
  const successRate = 99.2; // Mock data

  const stats = [
    {
      title: 'Total Endpoints',
      value: endpoints.length,
      icon: Boxes,
      description: 'Active mock APIs',
    },
    {
      title: 'Total Requests',
      value: totalCalls.toLocaleString(),
      icon: Activity,
      description: 'All time',
    },
    {
      title: 'Avg Response Time',
      value: `${avgResponseTime}ms`,
      icon: Zap,
      description: 'Across all endpoints',
    },
    {
      title: 'Success Rate',
      value: `${successRate}%`,
      icon: TrendingUp,
      description: 'Successful responses',
    },
  ];

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-blue-500/10 text-blue-500',
      POST: 'bg-green-500/10 text-green-500',
      PUT: 'bg-yellow-500/10 text-yellow-500',
      PATCH: 'bg-orange-500/10 text-orange-500',
      DELETE: 'bg-red-500/10 text-red-500',
    };
    return colors[method] || 'bg-gray-500/10 text-gray-500';
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading overview...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 container">
      {/* Header */}
      <div>
        <h1>Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your mock API performance and usage
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Endpoints */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Endpoints</CardTitle>
              <CardDescription>Your most recently created mock APIs</CardDescription>
            </div>
            <Link to="/dashboard/endpoints">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {endpoints.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No endpoints yet</p>
              <Link to="/dashboard/create">
                <Button>Create Your First Endpoint</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {endpoints.slice(0, 5).map((endpoint) => (
                <Link
                  key={endpoint.id}
                  to={`/dashboard/endpoints/${endpoint.id}`}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Badge className={getMethodColor(endpoint.method)}>
                      {endpoint.method}
                    </Badge>
                    <div>
                      <p className="font-medium">{endpoint.name}</p>
                      <p className="text-sm text-muted-foreground">{endpoint.path}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {endpoint.callCount || 0} calls
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/dashboard/create">
              <Button variant="outline" className="w-full">
                Create New Endpoint
              </Button>
            </Link>
            <Link to="/dashboard/analytics">
              <Button variant="outline" className="w-full">
                View Analytics
              </Button>
            </Link>
            <Link to="/dashboard/settings">
              <Button variant="outline" className="w-full">
                Account Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
