import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Code2, Rocket, Shield, Zap, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { publicAnonKey } from "../utils/supabase/info";

export function Documentation() {
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Code2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-6">Documentation</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Everything you need to know to get started with MockAPI Platform
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/signin">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <a href="#quickstart">
              <Button size="lg" variant="outline">
                Quick Start Guide
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section id="quickstart" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Quick Start</h2>
            <p className="text-xl text-muted-foreground">
              Get your first mock API up and running in under 5 minutes
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-12">
            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Create your free account with email or social login
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <CardTitle>Create Endpoint</CardTitle>
                <CardDescription>
                  Define your API endpoint, method, and response
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <CardTitle>Start Using</CardTitle>
                <CardDescription>
                  Copy the URL and use it in your application
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Creating Endpoints */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            Creating Your First Endpoint
          </h2>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Navigate to Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  After signing in, go to your dashboard and click the "Create
                  New Endpoint" button.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 2: Configure Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Fill in the basic details about your endpoint:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    <strong>Name:</strong> A descriptive name for your endpoint
                    (e.g., "Get Users")
                  </li>
                  <li>
                    <strong>Description:</strong> Optional description of what
                    the endpoint does
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 3: Set Request Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Define how your API endpoint should behave:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    <strong>HTTP Method:</strong> GET, POST, PUT, PATCH, or
                    DELETE
                  </li>
                  <li>
                    <strong>Path:</strong> The endpoint path (must start with /)
                  </li>
                  <li>
                    <strong>Status Code:</strong> The HTTP status code to return
                    (default: 200)
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 4: Define Response Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Enter the JSON response that will be returned when your
                  endpoint is called:
                </p>
                <div className="relative">
                  <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                    <code className="text-sm font-mono">{`{
  "message": "Success",
  "data": {
    "users": [
      { "id": 1, "name": "John Doe" },
      { "id": 2, "name": "Jane Smith" }
    ]
  }
}`}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() =>
                      copyCode(`{
  "message": "Success",
  "data": {
    "users": [
      { "id": 1, "name": "John Doe" },
      { "id": 2, "name": "Jane Smith" }
    ]
  }
}`)
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Using Your Endpoints */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="mb-8 text-center">Using Your Mock Endpoints</h2>

          {/* API Key Notice */}
          {/* <Card className="mb-8 border-green-500/50 bg-green-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                Public Anon Key - Safe to Share
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                All requests to your mock API endpoints must include the{" "}
                <strong>Authorization header with your public anon key</strong>.
                This key is safe to share publicly and should be included in
                your frontend code.
              </p>
              <div className="space-y-2">
                <p className="text-sm">Your Public Anon Key:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-3 bg-muted rounded-lg font-mono text-sm overflow-x-auto border">
                    {publicAnonKey}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyCode(publicAnonKey)}
                    className="flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm mb-2">
                  Include this header in every request:
                </p>
                <code className="text-sm">
                  Authorization: Bearer {publicAnonKey}
                </code>
              </div>
              <p className="text-sm text-muted-foreground">
                ✓ Safe to commit to Git &nbsp;&nbsp; ✓ Safe to share with your
                team &nbsp;&nbsp; ✓ Safe to use in frontend code
              </p>
            </CardContent>
          </Card> */}

          <Tabs defaultValue="javascript" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
            </TabsList>

            <TabsContent value="javascript">
              <Card>
                <CardHeader>
                  <CardTitle>JavaScript (Fetch API)</CardTitle>
                  <CardDescription>Using the native Fetch API</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                      <code className="text-sm font-mono">{`// Basic GET request
fetch('YOUR_MOCK_API_URL', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${publicAnonKey}'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// POST request with body
fetch('YOUR_MOCK_API_URL', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_PUBLIC_ANON_KEY'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com'
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() =>
                        copyCode(`// Basic GET request
fetch('YOUR_MOCK_API_URL', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`)
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="curl">
              <Card>
                <CardHeader>
                  <CardTitle>cURL</CardTitle>
                  <CardDescription>Command line HTTP requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                      <code className="text-sm font-mono">{`# Basic GET request
curl -X GET 'YOUR_MOCK_API_URL' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer ${publicAnonKey}'

# POST request with data
curl -X POST 'YOUR_MOCK_API_URL' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer ${publicAnonKey}' \\
  -d '{"name": "John Doe", "email": "john@example.com"}'`}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() =>
                        copyCode(`curl -X GET 'YOUR_MOCK_API_URL' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer ${publicAnonKey}'`)
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="python">
              <Card>
                <CardHeader>
                  <CardTitle>Python (requests)</CardTitle>
                  <CardDescription>Using the requests library</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                      <code className="text-sm font-mono">{`import requests

# Basic GET request
url = 'YOUR_MOCK_API_URL'
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${publicAnonKey}'
}
response = requests.get(url, headers=headers)
print(response.json())

# POST request with data
data = {
    'name': 'John Doe',
    'email': 'john@example.com'
}
response = requests.post(url, headers=headers, json=data)
print(response.json())`}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() =>
                        copyCode(`import requests

url = 'YOUR_MOCK_API_URL'
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${publicAnonKey}'
}
response = requests.get(url, headers=headers)
print(response.json())`)
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="react">
              <Card>
                <CardHeader>
                  <CardTitle>React Hook Example</CardTitle>
                  <CardDescription>
                    Custom hook for fetching data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                      <code className="text-sm font-mono">{`import { useState, useEffect } from 'react';

// Your public anon key (safe to include in frontend code)
const PUBLIC_ANON_KEY = '${publicAnonKey}';

function useApi(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${PUBLIC_ANON_KEY}\`
      }
    })
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}

// Usage in component
function UserList() {
  const { data, loading, error } = useApi('YOUR_MOCK_API_URL');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}`}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() =>
                        copyCode(`import { useState, useEffect } from 'react';

function useApi(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}`)
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Authentication Methods */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            Authentication Methods
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>No Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Your endpoint is publicly accessible without any
                  authentication. Perfect for testing and public APIs.
                </p>
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-sm">authType: 'none'</code>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Bearer Token</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Requires an Authorization header with a Bearer token. Client
                  must include the token in requests.
                </p>
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-sm break-all">
                    Authorization: Bearer YOUR_TOKEN
                  </code>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>API Key</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Requires a custom X-API-Key header. Client must include the
                  API key in requests.
                </p>
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-sm break-all">
                    X-API-Key: YOUR_API_KEY
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            Best Practices
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Rocket className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Use Realistic Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Create responses that closely match your actual API structure.
                  This helps catch integration issues early.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Match HTTP Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Use GET for retrieving data, POST for creating, PUT for
                  updating, and DELETE for removing resources.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Code2 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Consistent Naming</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Use clear, descriptive names for your endpoints that indicate
                  their purpose and resource type.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Test Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  If your real API requires authentication, configure the same
                  auth type in your mock endpoint to test error handling.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How many endpoints can I create?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  There's no limit on the number of endpoints you can create.
                  Feel free to create as many as you need for your projects.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Can I modify an endpoint after creation?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can edit any endpoint at any time. Changes take
                  effect immediately and the URL remains the same.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Are my mock endpoints public?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  By default, yes. Endpoints with "None" authentication are
                  publicly accessible via their URL. You can add authentication
                  requirements to restrict access.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How do I test my mock endpoints?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You can test your endpoints using any HTTP client like cURL,
                  Postman, Insomnia, or directly in your application code. The
                  endpoint detail page provides code examples for various
                  languages.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Can I see how many times my endpoint was called?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! Each endpoint tracks the number of times it's been
                  called. You can view this metric in the endpoint details page
                  and in your analytics dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Create your free account and start building mock APIs in minutes
          </p>
          <Link to="/signin">
            <Button size="lg">Create Free Account</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
