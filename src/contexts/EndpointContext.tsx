import { createContext, useContext, useState, ReactNode } from 'react';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type AuthType = 'none' | 'api-key' | 'bearer' | 'basic';

export interface Endpoint {
  id: string;
  name: string;
  method: HttpMethod;
  path: string;
  response: string;
  statusCode: number;
  headers: Record<string, string>;
  authType: AuthType;
  authValue?: string;
  delay: number;
  description: string;
  createdAt: string;
  calls: number;
}

interface EndpointContextType {
  endpoints: Endpoint[];
  addEndpoint: (endpoint: Omit<Endpoint, 'id' | 'createdAt' | 'calls'>) => void;
  updateEndpoint: (id: string, endpoint: Partial<Endpoint>) => void;
  deleteEndpoint: (id: string) => void;
  getEndpoint: (id: string) => Endpoint | undefined;
}

const EndpointContext = createContext<EndpointContextType | undefined>(undefined);

export function EndpointProvider({ children }: { children: ReactNode }) {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([
    {
      id: '1',
      name: 'Get Users',
      method: 'GET',
      path: '/users',
      response: JSON.stringify([
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ], null, 2),
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      authType: 'none',
      delay: 0,
      description: 'Returns a list of users',
      createdAt: new Date().toISOString(),
      calls: 127
    },
    {
      id: '2',
      name: 'Create User',
      method: 'POST',
      path: '/users',
      response: JSON.stringify({
        id: 3,
        name: 'New User',
        email: 'new@example.com',
        message: 'User created successfully'
      }, null, 2),
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      authType: 'api-key',
      authValue: 'sk_test_abc123',
      delay: 0,
      description: 'Creates a new user',
      createdAt: new Date().toISOString(),
      calls: 43
    },
  ]);

  const addEndpoint = (endpointData: Omit<Endpoint, 'id' | 'createdAt' | 'calls'>) => {
    const newEndpoint: Endpoint = {
      ...endpointData,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
      calls: 0
    };
    setEndpoints([...endpoints, newEndpoint]);
  };

  const updateEndpoint = (id: string, endpointData: Partial<Endpoint>) => {
    setEndpoints(endpoints.map(ep => 
      ep.id === id ? { ...ep, ...endpointData } : ep
    ));
  };

  const deleteEndpoint = (id: string) => {
    setEndpoints(endpoints.filter(ep => ep.id !== id));
  };

  const getEndpoint = (id: string) => {
    return endpoints.find(ep => ep.id === id);
  };

  return (
    <EndpointContext.Provider value={{
      endpoints,
      addEndpoint,
      updateEndpoint,
      deleteEndpoint,
      getEndpoint
    }}>
      {children}
    </EndpointContext.Provider>
  );
}

export function useEndpoints() {
  const context = useContext(EndpointContext);
  if (!context) {
    throw new Error('useEndpoints must be used within EndpointProvider');
  }
  return context;
}
