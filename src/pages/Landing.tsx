import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Zap, 
  Code2, 
  Shield, 
  Globe, 
  Clock, 
  Users,
  ArrowRight,
  Check
} from 'lucide-react';

export function Landing() {
  const features = [
    {
      icon: Zap,
      title: 'Instant API Generation',
      description: 'Create mock APIs in seconds with our intuitive interface. No configuration needed.',
    },
    {
      icon: Code2,
      title: 'Custom Responses',
      description: 'Define custom JSON responses, status codes, and headers for any endpoint.',
    },
    {
      icon: Shield,
      title: 'Auth Methods',
      description: 'Test different authentication methods including API keys, Bearer tokens, and OAuth.',
    },
    {
      icon: Globe,
      title: 'Public or Private',
      description: 'Control access to your mock APIs with public URLs or private authentication.',
    },
    {
      icon: Clock,
      title: 'Response Delays',
      description: 'Simulate real-world latency by adding custom delays to your endpoints.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Share mock APIs with your team and collaborate on API designs.',
    },
  ];

  const benefits = [
    'Unblock frontend development',
    'Test edge cases and error scenarios',
    'Prototype faster without backend',
    'Reduce development dependencies',
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <Badge variant="secondary" className="mb-4 shadow-sm">
              ⚡ Free during beta
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight">
              Mock APIs for
              <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mt-2">
                Rapid Development
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Create, manage, and deploy mock API endpoints instantly. 
              Stop waiting for backend development and start building today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link to="/signin">
                <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow text-lg px-8 py-6">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  View Features
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="pt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Unlimited endpoints</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Instant setup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="mb-4 text-4xl font-bold">Everything you need to mock APIs</h2>
            <p className="text-lg text-muted-foreground">
              Built for developers who want to move fast without sacrificing quality.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">Simple integration, powerful results</h2>
              <p className="text-lg text-muted-foreground">
                Your mock APIs work just like real ones. Drop them into your code 
                and switch to production when ready.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="bg-gradient-to-br from-muted/80 to-muted/40 border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Example Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm overflow-x-auto p-4 bg-background/50 rounded-lg">
                  <code className="text-foreground">{`// Your mock API endpoint
const response = await fetch(
  'https://api.mockapi.dev/abc123/users'
);

const users = await response.json();
console.log(users);

// Returns your custom data:
// [
//   { id: 1, name: "John Doe" },
//   { id: 2, name: "Jane Smith" }
// ]`}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-8 relative">
          <h2 className="text-4xl sm:text-5xl font-bold">Ready to accelerate your development?</h2>
          <p className="text-xl opacity-95 max-w-2xl mx-auto">
            Join thousands of developers who are building faster with MockAPI Platform.
          </p>
          <Link to="/signin">
            <Button size="lg" variant="secondary" className="gap-2 text-lg px-8 py-6 shadow-2xl hover:shadow-xl transition-shadow">
              Start Building Now
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
