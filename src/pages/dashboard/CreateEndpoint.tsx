import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createEndpoint } from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner@2.0.3';
import { ArrowLeft } from 'lucide-react';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export function CreateEndpoint() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    method: 'GET' as HttpMethod,
    path: '',
    description: '',
    responseData: '{\n  "message": "Success",\n  "data": {}\n}',
    statusCode: 200,
    delay: 0,
    requireAuth: false,
    authToken: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessToken) {
      toast.error('You must be signed in to create an endpoint');
      return;
    }

    // Validate JSON response
    try {
      JSON.parse(formData.responseData);
    } catch (error) {
      toast.error('Invalid JSON in response body');
      return;
    }

    // Validate path starts with /
    if (!formData.path.startsWith('/')) {
      toast.error('Path must start with /');
      return;
    }

    setLoading(true);

    try {
      const endpoint = await createEndpoint(accessToken, {
        name: formData.name,
        method: formData.method,
        path: formData.path,
        description: formData.description,
        responseData: JSON.parse(formData.responseData),
        statusCode: formData.statusCode,
        headers: { 'Content-Type': 'application/json' },
        delay: formData.delay,
        requireAuth: formData.requireAuth,
        authToken: formData.requireAuth ? formData.authToken : undefined,
      });

      toast.success('Endpoint created successfully');
      navigate(`/dashboard/endpoints/${endpoint.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create endpoint');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          className="gap-2 mb-6"
          onClick={() => navigate('/dashboard/endpoints')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Endpoints
        </Button>
        <h1>Create New Endpoint</h1>
        <p className="text-muted-foreground mt-3">
          Define your mock API endpoint configuration
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Name and describe your endpoint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Endpoint Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Get Users"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of what this endpoint does"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Request Configuration */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Request Configuration</CardTitle>
            <CardDescription>Define the HTTP method and path</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="method">HTTP Method *</Label>
                <Select
                  value={formData.method}
                  onValueChange={(value) => updateField('method', value)}
                >
                  <SelectTrigger id="method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="statusCode">Status Code *</Label>
                <Input
                  id="statusCode"
                  type="number"
                  placeholder="200"
                  value={formData.statusCode}
                  onChange={(e) => updateField('statusCode', parseInt(e.target.value))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="path">API Path *</Label>
              <Input
                id="path"
                placeholder="/users"
                value={formData.path}
                onChange={(e) => updateField('path', e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Path must start with /
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Response Configuration */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Response Configuration</CardTitle>
            <CardDescription>Define the response data and behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="response">Response Body (JSON) *</Label>
              <Textarea
                id="response"
                placeholder='{"message": "Success"}'
                value={formData.responseData}
                onChange={(e) => updateField('responseData', e.target.value)}
                rows={10}
                className="font-mono text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delay">Response Delay (ms)</Label>
              <Input
                id="delay"
                type="number"
                min="0"
                max="10000"
                value={formData.delay}
                onChange={(e) => updateField('delay', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Simulate network latency (0-10000ms)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Authentication */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Authentication (Optional)</CardTitle>
            <CardDescription>Require token authentication for this endpoint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="requireAuth">Require Authentication</Label>
                <p className="text-xs text-muted-foreground">
                  Endpoint will verify X-Auth-Token header
                </p>
              </div>
              <Switch
                id="requireAuth"
                checked={formData.requireAuth}
                onCheckedChange={(checked) => updateField('requireAuth', checked)}
              />
            </div>

            {formData.requireAuth && (
              <div className="space-y-2">
                <Label htmlFor="authToken">Expected Auth Token</Label>
                <Input
                  id="authToken"
                  type="text"
                  value={formData.authToken}
                  onChange={(e) => updateField('authToken', e.target.value)}
                  placeholder="your-secret-token-123"
                />
                <p className="text-xs text-muted-foreground">
                  Requests must include: X-Auth-Token: {formData.authToken || 'your-token'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/dashboard/endpoints')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="px-8">
            {loading ? 'Creating...' : 'Create Endpoint'}
          </Button>
        </div>
      </form>
    </div>
  );
}
