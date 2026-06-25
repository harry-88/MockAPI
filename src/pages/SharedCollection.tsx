import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSharedCollection, getMockApiUrl, Endpoint } from '../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Copy, Box } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { FolderTree, buildTree } from '../components/FolderTree';

const methodColor = (method: string) =>
  ({
    GET: 'bg-blue-500/10 text-blue-500',
    POST: 'bg-green-500/10 text-green-500',
    PUT: 'bg-yellow-500/10 text-yellow-500',
    PATCH: 'bg-orange-500/10 text-orange-500',
    DELETE: 'bg-red-500/10 text-red-500',
  }[method] || 'bg-gray-500/10 text-gray-500');

export function SharedCollection() {
  const { shareId } = useParams<{ shareId: string }>();
  const [name, setName] = useState('');
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shareId) return;
    getSharedCollection(shareId)
      .then(({ collection, endpoints }) => {
        setName(collection.name);
        setEndpoints(endpoints);
      })
      .catch((e: any) => setError(e.message || 'Collection not found'))
      .finally(() => setLoading(false));
  }, [shareId]);

  const copyUrl = (endpoint: Endpoint) => {
    navigator.clipboard.writeText(getMockApiUrl(endpoint));
    toast.success('API URL copied to clipboard');
  };

  if (loading) {
    return <div className="p-8 container"><p className="text-muted-foreground">Loading…</p></div>;
  }

  if (error) {
    return (
      <div className="p-8 container flex flex-col items-center justify-center py-24 text-center">
        <Box className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="mb-2">{error}</h2>
        <p className="text-muted-foreground">This share link may be private or no longer exist.</p>
      </div>
    );
  }

  return (
    <div className="p-8 container max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Shared collection</p>
        <h1>{name}</h1>
        <p className="text-muted-foreground mt-2">
          {endpoints.length} endpoint{endpoints.length === 1 ? '' : 's'} — read-only
        </p>
      </div>

      <FolderTree
        node={buildTree(endpoints)}
        renderEndpoint={(endpoint) => (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <Badge className={methodColor(endpoint.method)}>{endpoint.method}</Badge>
                  <CardTitle className="mt-2 mb-1">{endpoint.name}</CardTitle>
                  <CardDescription>{endpoint.description || 'No description'}</CardDescription>
                  <code className="text-sm text-muted-foreground mt-2 block break-all">
                    {getMockApiUrl(endpoint)}
                  </code>
                </div>
                <Button variant="ghost" size="sm" onClick={() => copyUrl(endpoint)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted rounded-md p-3 overflow-auto max-h-64">
                {JSON.stringify(endpoint.responseData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      />
    </div>
  );
}
