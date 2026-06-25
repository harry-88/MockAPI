import { functionsBaseUrl } from './firebase';

const API_BASE = functionsBaseUrl;

export interface Endpoint {
  id: string;
  userId: string;
  name: string;
  method: string;
  path: string;
  responseData: any;
  statusCode: number;
  headers: Record<string, string>;
  description: string;
  delay?: number; // Response delay in milliseconds
  requireAuth?: boolean; // Whether authentication is required
  authToken?: string; // Expected auth token if requireAuth is true
  collectionId?: string; // Empty string means uncategorized
  createdAt: string;
  updatedAt: string;
  callCount: number;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  isPublic: boolean;
  shareId: string;
  createdAt: string;
}

export interface Analytics {
  totalEndpoints: number;
  totalCalls: number;
  activeEndpoints: number;
  avgResponseTime: number;
  successRate: number;
  dailyStats: Array<{ date: string; calls: number; errors: number }>;
  methodDistribution: Record<string, number>;
}

async function fetchAPI(endpoint: string, options: RequestInit = {}, accessToken?: string) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`API error on ${endpoint}:`, data);
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

export async function getEndpoints(accessToken: string): Promise<Endpoint[]> {
  const { endpoints } = await fetchAPI('/endpoints', {}, accessToken);
  return endpoints;
}

export async function createEndpoint(
  accessToken: string,
  endpointData: Omit<Endpoint, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'callCount'>
): Promise<Endpoint> {
  const { endpoint } = await fetchAPI(
    '/endpoints',
    {
      method: 'POST',
      body: JSON.stringify(endpointData),
    },
    accessToken
  );
  return endpoint;
}

export async function getEndpoint(accessToken: string, id: string): Promise<Endpoint> {
  const { endpoint } = await fetchAPI(`/endpoints/${id}`, {}, accessToken);
  return endpoint;
}

export async function updateEndpoint(
  accessToken: string,
  id: string,
  endpointData: Partial<Endpoint>
): Promise<Endpoint> {
  const { endpoint } = await fetchAPI(
    `/endpoints/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(endpointData),
    },
    accessToken
  );
  return endpoint;
}

export async function deleteEndpoint(accessToken: string, id: string): Promise<void> {
  await fetchAPI(
    `/endpoints/${id}`,
    {
      method: 'DELETE',
    },
    accessToken
  );
}

export async function getAnalytics(accessToken: string): Promise<Analytics> {
  const { analytics } = await fetchAPI('/analytics', {}, accessToken);
  return analytics;
}

export function getMockApiUrl(endpoint: Pick<Endpoint, 'path'>): string {
  return `${API_BASE}${endpoint.path}`;
}

// --- Collections ---

export async function getCollections(accessToken: string): Promise<Collection[]> {
  const { collections } = await fetchAPI('/collections', {}, accessToken);
  return collections;
}

export async function createCollection(accessToken: string, name: string): Promise<Collection> {
  const { collection } = await fetchAPI(
    '/collections',
    { method: 'POST', body: JSON.stringify({ name }) },
    accessToken
  );
  return collection;
}

export async function updateCollection(
  accessToken: string,
  id: string,
  patch: Partial<Pick<Collection, 'name' | 'isPublic'>>
): Promise<Collection> {
  const { collection } = await fetchAPI(
    `/collections/${id}`,
    { method: 'PUT', body: JSON.stringify(patch) },
    accessToken
  );
  return collection;
}

export async function deleteCollection(accessToken: string, id: string): Promise<void> {
  await fetchAPI(`/collections/${id}`, { method: 'DELETE' }, accessToken);
}

// Public — no auth. Returns the collection name and its endpoints (secrets stripped).
export async function getSharedCollection(
  shareId: string
): Promise<{ collection: { name: string; shareId: string }; endpoints: Endpoint[] }> {
  return fetchAPI(`/share/${shareId}`);
}
