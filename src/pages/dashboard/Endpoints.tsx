import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getEndpoints, deleteEndpoint as deleteEndpointAPI, getMockApiUrl, Endpoint } from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Plus, 
  Search, 
  Copy, 
  Trash,
  ExternalLink,
  Box
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function Endpoints() {
  const { accessToken } = useAuth();
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredEndpoints = endpoints.filter(endpoint => 
    endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    endpoint.method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyUrl = (endpoint: Endpoint) => {
    navigator.clipboard.writeText(getMockApiUrl(endpoint));
    toast.success('API URL copied to clipboard');
  };

  const handleDelete = async (id: string) => {
    if (!accessToken) return;
    
    if (!confirm('Are you sure you want to delete this endpoint?')) return;

    try {
      await deleteEndpointAPI(accessToken, id);
      setEndpoints(endpoints.filter(e => e.id !== id));
      toast.success('Endpoint deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete endpoint');
    }
  };

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
        <p className="text-muted-foreground">Loading endpoints...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>API Endpoints</h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor your mock API endpoints
          </p>
        </div>
        <Link to="/dashboard/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Endpoint
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search endpoints..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Endpoints List */}
      {filteredEndpoints.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Box className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="mb-2">No endpoints found</h3>
            <p className="text-muted-foreground text-center mb-6">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Create your first mock API endpoint to get started'}
            </p>
            {!searchQuery && (
              <Link to="/dashboard/create">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Endpoint
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredEndpoints.map((endpoint) => (
            <Card key={endpoint.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getMethodColor(endpoint.method)}>
                        {endpoint.method}
                      </Badge>
                    </div>
                    <CardTitle className="mb-2">{endpoint.name}</CardTitle>
                    <CardDescription>
                      {endpoint.description || 'No description'}
                    </CardDescription>
                    <code className="text-sm text-muted-foreground mt-2 block">
                      {endpoint.path}
                    </code>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => copyUrl(endpoint)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </DropdownMenuItem>
                      <Link to={`/dashboard/endpoints/${endpoint.id}`}>
                        <DropdownMenuItem>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        onClick={() => handleDelete(endpoint.id)}
                        className="text-destructive"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">{endpoint.callCount || 0}</span> calls
                  </div>
                  <div>Status: <span className="font-medium">{endpoint.statusCode}</span></div>
                  <div>Created: {new Date(endpoint.createdAt).toLocaleDateString()}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
