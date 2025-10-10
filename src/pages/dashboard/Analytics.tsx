import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { getAnalytics, Analytics as AnalyticsType } from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner@2.0.3';

export function Analytics() {
  const { accessToken } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [accessToken]);

  const loadAnalytics = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const data = await getAnalytics(accessToken);
      setAnalytics(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  const methodData = Object.entries(analytics.methodDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = {
    GET: '#3b82f6',
    POST: '#22c55e',
    PUT: '#eab308',
    PATCH: '#f97316',
    DELETE: '#ef4444',
  };

  return (
    <div className="p-8 space-y-6 container">
      {/* Header */}
      <div>
        <h1>Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Monitor API usage and performance metrics
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Requests (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{analytics.totalCalls.toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-1">Active monitoring</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{analytics.avgResponseTime}ms</p>
            <p className="text-sm text-green-600 mt-1">Optimal performance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{analytics.successRate}%</p>
            <p className="text-sm text-green-600 mt-1">Reliable service</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Requests Over Time</CardTitle>
          <CardDescription>Daily API calls for the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="calls" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Method Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Method Distribution</CardTitle>
            <CardDescription>Breakdown by HTTP method</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={methodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {methodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Error Rate</CardTitle>
            <CardDescription>Errors over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="errors" fill="hsl(var(--destructive))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Endpoint Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoint Statistics</CardTitle>
          <CardDescription>Overview of your mock API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Endpoints</p>
              <p className="text-2xl font-semibold mt-2">{analytics.totalEndpoints}</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Active Endpoints</p>
              <p className="text-2xl font-semibold mt-2">{analytics.activeEndpoints}</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Inactive Endpoints</p>
              <p className="text-2xl font-semibold mt-2">
                {analytics.totalEndpoints - analytics.activeEndpoints}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
