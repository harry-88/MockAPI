import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getEndpoints,
  deleteEndpoint as deleteEndpointAPI,
  createEndpoint,
  getMockApiUrl,
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  Endpoint,
  Collection,
} from '../../utils/api';
import { cn } from '../../components/ui/utils';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Plus,
  Search,
  Copy,
  Trash,
  Box,
  Boxes,
  FolderPlus,
  Share2,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { FolderTree, buildTree } from '../../components/FolderTree';

type CreateCtx = { collectionId: string; path: string };

// Sentinel key for endpoints that belong to no collection.
const UNCATEGORIZED = '__uncategorized__';

// Postman-style colored method label.
const methodColor = (method: string) =>
  ({
    GET: 'text-green-500',
    POST: 'text-yellow-500',
    PUT: 'text-blue-500',
    PATCH: 'text-purple-500',
    DELETE: 'text-red-500',
  }[method] || 'text-gray-500');

export function Endpoints() {
  const { accessToken } = useAuth();
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createCtx, setCreateCtx] = useState<CreateCtx | null>(null);

  // Open the inline "new endpoint" builder in the right pane, scoped to a collection/folder.
  const startCreate = (collectionId: string, path = '') => {
    setSelectedId(null);
    setCreateCtx({ collectionId, path });
  };

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    Promise.all([getEndpoints(accessToken), getCollections(accessToken)])
      .then(([eps, cols]) => {
        setEndpoints(eps);
        setCollections(cols);
      })
      .catch((error: any) => toast.error(error.message || 'Failed to load endpoints'))
      .finally(() => setLoading(false));
  }, [accessToken]);

  const filteredEndpoints = endpoints.filter((endpoint) =>
    endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    endpoint.method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group endpoints by collection, in collection order, uncategorized last.
  const colById = new Map(collections.map((c) => [c.id, c]));
  const groups: { key: string; collection: Collection | null; items: Endpoint[] }[] = [
    ...collections.map((c) => ({ key: c.id, collection: c, items: [] as Endpoint[] })),
    { key: UNCATEGORIZED, collection: null, items: [] as Endpoint[] },
  ];
  const groupByKey = new Map(groups.map((g) => [g.key, g]));
  for (const ep of filteredEndpoints) {
    const key = ep.collectionId && colById.has(ep.collectionId) ? ep.collectionId : UNCATEGORIZED;
    groupByKey.get(key)!.items.push(ep);
  }
  const visibleGroups = groups.filter((g) => g.items.length > 0 || (!searchQuery && g.collection));

  const selected = endpoints.find((e) => e.id === selectedId) || null;

  const copyUrl = (endpoint: Endpoint) => {
    navigator.clipboard.writeText(getMockApiUrl(endpoint));
    toast.success('API URL copied to clipboard');
  };

  const handleDelete = async (id: string) => {
    if (!accessToken) return;
    if (!confirm('Are you sure you want to delete this endpoint?')) return;
    try {
      await deleteEndpointAPI(accessToken, id);
      setEndpoints(endpoints.filter((e) => e.id !== id));
      if (selectedId === id) setSelectedId(null);
      toast.success('Endpoint deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete endpoint');
    }
  };

  const handleCreateCollection = async () => {
    if (!accessToken) return;
    const name = prompt('Collection name (e.g. "QuickBooks Online API")');
    if (!name?.trim()) return;
    try {
      const col = await createCollection(accessToken, name.trim());
      setCollections([...collections, col]);
      toast.success('Collection created');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create collection');
    }
  };

  const handleShare = async (col: Collection) => {
    if (!accessToken) return;
    try {
      let shared = col;
      if (!col.isPublic) {
        shared = await updateCollection(accessToken, col.id, { isPublic: true });
        setCollections(collections.map((c) => (c.id === col.id ? shared : c)));
      }
      await navigator.clipboard.writeText(`${window.location.origin}/share/${shared.shareId}`);
      toast.success('Public share link copied to clipboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to share collection');
    }
  };

  const handleDeleteCollection = async (col: Collection) => {
    if (!accessToken) return;
    if (!confirm(`Delete collection "${col.name}"? Its endpoints will become uncategorized.`)) return;
    try {
      await deleteCollection(accessToken, col.id);
      setCollections(collections.filter((c) => c.id !== col.id));
      setEndpoints(endpoints.map((e) => (e.collectionId === col.id ? { ...e, collectionId: '' } : e)));
      toast.success('Collection deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete collection');
    }
  };

  // Compact, selectable tree row — the Postman request line.
  const renderRow = (endpoint: Endpoint) => (
    <button
      onClick={() => { setCreateCtx(null); setSelectedId(endpoint.id); }}
      className={cn('tree-row', selectedId === endpoint.id && 'selected')}
    >
      <span className={cn('tree-method', `m-${endpoint.method}`)}>{endpoint.method}</span>
      <span className="tree-label">{endpoint.name}</span>
    </button>
  );

  if (loading) {
    return <div className="p-8"><p className="text-muted-foreground">Loading endpoints...</p></div>;
  }

  return (
    <div className="flex h-full">
      {/* Sidebar: collections → folders → endpoints */}
      <aside className="w-80 border-r border-border flex flex-col">
        <div className="p-3 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Collections
            </span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" title="New collection" onClick={handleCreateCollection}>
                <FolderPlus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="New endpoint" onClick={() => startCreate('')}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search endpoints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {endpoints.length === 0 && collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <Box className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No endpoints yet</p>
              <Button size="sm" className="gap-2" onClick={() => startCreate('')}>
                <Plus className="h-4 w-4" /> Create Endpoint
              </Button>
            </div>
          ) : (
            <div>
              {visibleGroups.map((group) => {
                const col = group.collection;
                const addInFolder = (folderPath: string) =>
                  startCreate(col?.id || '', `/${folderPath}/`);
                return (
                  <details key={group.key} open>
                    <summary className="tree-row">
                      <ChevronRight className="tree-chevron tree-icon" />
                      <Boxes className={cn('tree-icon', col && 'tree-collection-icon')} />
                      <span className="tree-label tree-collection-label">
                        {col ? col.name : 'Uncategorized'}
                      </span>
                      {col?.isPublic && <span className="tree-badge">Public</span>}
                      {col && (
                        <span className="tree-actions">
                          <span role="button" className="tree-action" title="Add endpoint to this collection"
                            onClick={(e) => { e.preventDefault(); startCreate(col.id); }}>
                            <Plus style={{ width: 14, height: 14 }} />
                          </span>
                          <span role="button" className="tree-action" title="Copy share link"
                            onClick={(e) => { e.preventDefault(); handleShare(col); }}>
                            <Share2 style={{ width: 14, height: 14 }} />
                          </span>
                          <span role="button" className="tree-action danger" title="Delete collection"
                            onClick={(e) => { e.preventDefault(); handleDeleteCollection(col); }}>
                            <Trash style={{ width: 14, height: 14 }} />
                          </span>
                        </span>
                      )}
                    </summary>
                    <div className="tree-children">
                      {group.items.length === 0 ? (
                        <button onClick={() => startCreate(col?.id || '')} className="tree-row" style={{ color: 'var(--muted-foreground)' }}>
                          <Plus className="tree-icon" />
                          <span className="tree-label">Add an endpoint here</span>
                        </button>
                      ) : (
                        <FolderTree
                          node={buildTree(group.items)}
                          renderEndpoint={renderRow}
                          onAddInFolder={col ? addInFolder : undefined}
                        />
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Detail / create pane */}
      <section className="flex-1 overflow-y-auto">
        {createCtx ? (
          <CreatePane
            key={`${createCtx.collectionId}|${createCtx.path}`}
            ctx={createCtx}
            collections={collections}
            accessToken={accessToken}
            onCancel={() => setCreateCtx(null)}
            onCreated={(ep) => {
              setEndpoints((prev) => [...prev, ep]);
              setCreateCtx(null);
              setSelectedId(ep.id);
            }}
          />
        ) : selected ? (
          <DetailPane
            endpoint={selected}
            collectionName={selected.collectionId ? colById.get(selected.collectionId)?.name : undefined}
            onCopy={() => copyUrl(selected)}
            onDelete={() => handleDelete(selected.id)}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
            <Box className="h-12 w-12 mb-4" />
            <p>Select an endpoint, or hit + to create one</p>
          </div>
        )}
      </section>
    </div>
  );
}

function DetailPane({
  endpoint,
  collectionName,
  onCopy,
  onDelete,
}: {
  endpoint: Endpoint;
  collectionName?: string;
  onCopy: () => void;
  onDelete: () => void;
}) {
  const apiUrl = getMockApiUrl(endpoint);
  // Breadcrumb: collection > folder segments > endpoint name.
  const folders = endpoint.path.split('/').map((s) => s.trim()).filter(Boolean).slice(0, -1);
  const crumbs = [collectionName || 'Uncategorized', ...folders, endpoint.name];

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-8 py-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
            {crumbs.map((c, i) => (
              <span key={i} className="truncate">
                {i > 0 && <span className="mx-1 opacity-50">/</span>}
                <span className={i === crumbs.length - 1 ? 'text-foreground font-medium' : ''}>{c}</span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-bold', methodColor(endpoint.method))}>{endpoint.method}</span>
            <h1 className="text-lg font-semibold truncate">{endpoint.name}</h1>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link to={`/dashboard/endpoints/${endpoint.id}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" /> Full details
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="gap-2 text-destructive" onClick={onDelete}>
            <Trash className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="p-8 max-w-3xl space-y-6">
        {endpoint.description && <p className="text-muted-foreground -mt-2">{endpoint.description}</p>}

        {/* URL bar */}
        <div className="flex items-stretch rounded-lg border border-border bg-muted/50 overflow-hidden">
          <span className={cn('flex items-center px-4 font-bold text-sm shrink-0', methodColor(endpoint.method))}>
            {endpoint.method}
          </span>
          <div className="w-px bg-border" />
          <code className="flex-1 px-4 py-2.5 font-mono text-sm overflow-x-auto break-all flex items-center">
            {apiUrl}
          </code>
          <Button variant="ghost" size="icon" className="rounded-none border-l border-border" onClick={onCopy}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          <p className="text-sm">
            {endpoint.requireAuth ? (
              <>Requires an <code className="px-1 py-0.5 bg-muted rounded">X-Auth-Token</code> header with your configured token.</>
            ) : (
              <><strong>Public endpoint:</strong> open, no API key needed. Call it from your frontend, scripts, or tests.</>
            )}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            ['Total Calls', endpoint.callCount || 0],
            ['Status Code', endpoint.statusCode],
            ['Created', new Date(endpoint.createdAt).toLocaleDateString()],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        {/* Response */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium mb-3">Response Body</p>
          <pre className="p-4 bg-muted/50 rounded-lg overflow-x-auto max-h-96 border border-border">
            <code className="text-sm font-mono">{JSON.stringify(endpoint.responseData, null, 2)}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

// Inline "new request" builder shown in the right pane, Postman-style.
function CreatePane({
  ctx,
  collections,
  accessToken,
  onCreated,
  onCancel,
}: {
  ctx: CreateCtx;
  collections: Collection[];
  accessToken: string | null;
  onCreated: (endpoint: Endpoint) => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    method: 'GET',
    path: ctx.path,
    description: '',
    statusCode: 200,
    responseData: '{\n  "message": "Success",\n  "data": {}\n}',
    delay: 0,
    requireAuth: false,
    authToken: '',
    collectionId: ctx.collectionId,
  });
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  // Collection is already chosen when you add from inside one — lock it, don't re-ask.
  const lockedCol = ctx.collectionId ? collections.find((c) => c.id === ctx.collectionId) : null;
  const folderCrumbs = ctx.path.split('/').map((s) => s.trim()).filter(Boolean);
  const target = [lockedCol?.name || (ctx.collectionId ? '' : 'No collection'), ...folderCrumbs].filter(Boolean);

  const save = async () => {
    if (!accessToken) return toast.error('You must be signed in');
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.path.startsWith('/')) return toast.error('Path must start with /');
    let parsed;
    try {
      parsed = JSON.parse(form.responseData);
    } catch {
      return toast.error('Invalid JSON in response body');
    }
    setSaving(true);
    try {
      const ep = await createEndpoint(accessToken, {
        name: form.name,
        method: form.method,
        path: form.path,
        description: form.description,
        responseData: parsed,
        statusCode: form.statusCode,
        headers: { 'Content-Type': 'application/json' },
        delay: form.delay,
        requireAuth: form.requireAuth,
        authToken: form.requireAuth ? form.authToken : undefined,
        collectionId: form.collectionId,
      });
      toast.success('Endpoint created');
      onCreated(ep);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create endpoint');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-8 py-4 flex items-center justify-between">
        <div>
          {target.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Boxes className="h-3.5 w-3.5" />
              {target.map((t, i) => (
                <span key={i}>{i > 0 && <span className="mx-1 opacity-50">/</span>}{t}</span>
              ))}
            </div>
          )}
          <h1 className="text-lg font-semibold">New Endpoint</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" onClick={save} disabled={saving} className="px-6">
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="p-8 max-w-3xl space-y-6">
        {/* URL bar */}
        <div>
          <div className="flex items-stretch rounded-lg border border-border bg-muted/50 overflow-hidden">
            <Select value={form.method} onValueChange={(v) => set('method', v)}>
              <SelectTrigger className="w-28 shrink-0 border-0 bg-transparent rounded-none font-bold focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    <span className={cn('font-bold', methodColor(m))}>{m}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-px bg-border" />
            <Input
              placeholder="/finance/salary"
              value={form.path}
              onChange={(e) => set('path', e.target.value)}
              className="flex-1 font-mono border-0 bg-transparent rounded-none focus-visible:ring-0"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Nest into folders with /, e.g. <code className="px-1 py-0.5 bg-muted rounded">/finance/salary</code> puts this in a "finance" folder.
          </p>
        </div>

        {/* Grouped fields */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="c-name">Name *</Label>
              <Input id="c-name" placeholder="e.g. Get Salary" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-status">Status Code</Label>
              <Input id="c-status" type="number" value={form.statusCode} onChange={(e) => set('statusCode', parseInt(e.target.value) || 200)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!lockedCol && (
              <div className="space-y-2">
                <Label>Collection</Label>
                <Select value={form.collectionId || 'none'} onValueChange={(v) => set('collectionId', v === 'none' ? '' : v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No collection</SelectItem>
                    {collections.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className={cn('space-y-2', lockedCol && 'md:col-span-2')}>
              <Label htmlFor="c-desc">Description</Label>
              <Input id="c-desc" placeholder="Optional" value={form.description} onChange={(e) => set('description', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Response */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-2 shadow-sm">
          <Label htmlFor="c-resp">Response Body (JSON) *</Label>
          <Textarea id="c-resp" rows={10} className="font-mono text-sm bg-muted/50" value={form.responseData} onChange={(e) => set('responseData', e.target.value)} />
        </div>

        {/* Behavior */}
        <div className="rounded-xl border border-border bg-card p-6 grid grid-cols-1 md:grid-cols-2 gap-5 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="c-delay">Response Delay (ms)</Label>
            <Input id="c-delay" type="number" min="0" max="10000" value={form.delay} onChange={(e) => set('delay', parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="c-auth">Require X-Auth-Token</Label>
              <Switch id="c-auth" checked={form.requireAuth} onCheckedChange={(v) => set('requireAuth', v)} />
            </div>
            {form.requireAuth && (
              <Input placeholder="expected token" value={form.authToken} onChange={(e) => set('authToken', e.target.value)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
