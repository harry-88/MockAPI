import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Code2, 
  Zap, 
  Shield, 
  Database, 
  Globe, 
  Clock,
  GitBranch,
  LineChart,
  Settings,
  Copy,
  Lock,
  Webhook
} from 'lucide-react';

export function Features() {
  const featureCategories = [
    {
      category: 'Core Features',
      items: [
        {
          icon: Zap,
          title: 'Instant Mock APIs',
          description: 'Generate working API endpoints in seconds. Define your response data and start using your mock API immediately.',
        },
        {
          icon: Code2,
          title: 'Custom Responses',
          description: 'Full control over response data, status codes, headers, and content types. Support for JSON, XML, and plain text.',
        },
        {
          icon: Database,
          title: 'Dynamic Data',
          description: 'Use variables, templates, and faker functions to generate realistic mock data automatically.',
        },
        {
          icon: Clock,
          title: 'Response Delays',
          description: 'Simulate network latency by adding custom delays. Test loading states and timeout handling.',
        },
      ],
    },
    {
      category: 'Security & Access',
      items: [
        {
          icon: Shield,
          title: 'Authentication Methods',
          description: 'Test multiple auth methods including API keys, Bearer tokens, Basic Auth, and custom headers.',
        },
        {
          icon: Lock,
          title: 'Access Control',
          description: 'Make endpoints public or private. Control who can access your mock APIs with granular permissions.',
        },
        {
          icon: Globe,
          title: 'CORS Configuration',
          description: 'Configure Cross-Origin Resource Sharing (CORS) settings to match your development needs.',
        },
      ],
    },
    {
      category: 'Developer Tools',
      items: [
        {
          icon: GitBranch,
          title: 'Version Control',
          description: 'Create multiple versions of the same endpoint. Test different API versions simultaneously.',
        },
        {
          icon: LineChart,
          title: 'Request Analytics',
          description: 'Monitor API usage, response times, and error rates. Understand how your frontend uses APIs.',
        },
        {
          icon: Webhook,
          title: 'Webhooks',
          description: 'Trigger mock webhooks to test event-driven architectures and real-time updates.',
        },
        {
          icon: Copy,
          title: 'Code Snippets',
          description: 'Get ready-to-use code examples in multiple languages and frameworks for quick integration.',
        },
        {
          icon: Settings,
          title: 'Advanced Configuration',
          description: 'Fine-tune request matching, conditional responses, and response transformations.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="mb-4">Powerful Features for Modern Development</h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to create, test, and manage mock APIs efficiently.
          </p>
        </div>

        {/* Feature Categories */}
        <div className="space-y-16">
          {featureCategories.map((category) => (
            <div key={category.category}>
              <h2 className="mb-8">{category.category}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((feature) => (
                  <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <feature.icon className="h-10 w-10 mb-4 text-primary" />
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Use Cases */}
        <div className="mt-20 bg-muted/30 rounded-lg p-8 md:p-12">
          <h2 className="mb-8 text-center">Perfect for Every Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="mb-3">Frontend Developers</h3>
              <p className="text-muted-foreground">
                Build UI components without waiting for backend APIs. Test edge cases and error states easily.
              </p>
            </div>
            <div>
              <h3 className="mb-3">Full Stack Teams</h3>
              <p className="text-muted-foreground">
                Parallelize development. Frontend and backend teams can work independently with clear contracts.
              </p>
            </div>
            <div>
              <h3 className="mb-3">QA & Testing</h3>
              <p className="text-muted-foreground">
                Create specific test scenarios. Simulate failures, slow responses, and various data states.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
