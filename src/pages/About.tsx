import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Target, Heart, Rocket } from 'lucide-react';

export function About() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="mb-4">About MockAPI</h1>
          <p className="text-xl text-muted-foreground">
            Empowering developers to build faster and better
          </p>
        </div>

        {/* Mission */}
        <div className="mb-16">
          <h2 className="mb-6">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            We believe frontend developers shouldn't be blocked waiting for backend APIs. 
            MockAPI was created to eliminate this bottleneck and enable teams to work in parallel, 
            iterate faster, and deliver better products.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our platform provides instant mock API endpoints that behave just like real APIs, 
            allowing you to develop, test, and prototype with confidence.
          </p>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="mb-8">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Rocket className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Speed</CardTitle>
                <CardDescription>
                  We're obsessed with developer velocity. Every feature is designed to save you time.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Heart className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Simplicity</CardTitle>
                <CardDescription>
                  Complex problems, simple solutions. Our interface is intuitive and our APIs are straightforward.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Target className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Reliability</CardTitle>
                <CardDescription>
                  Your mock APIs should just work. We maintain 99.9% uptime so you can focus on building.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Story */}
        <div className="bg-muted/30 rounded-lg p-8 mb-16">
          <h2 className="mb-6">The Story</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              MockAPI started when our team was building a complex frontend application. 
              We kept hitting the same problem: the backend APIs weren't ready yet, 
              but we needed to keep building.
            </p>
            <p>
              We tried various solutions—hardcoded data, complex mock servers, random JSON generators—but 
              nothing felt quite right. So we built MockAPI: a simple platform that generates real, 
              usable API endpoints in seconds.
            </p>
            <p>
              What started as an internal tool quickly became something we knew other developers needed. 
              Today, thousands of teams use MockAPI to accelerate their development process.
            </p>
          </div>
        </div>

        {/* Team */}
        <div className="text-center">
          <h2 className="mb-6">Built by Developers, for Developers</h2>
          <p className="text-lg text-muted-foreground mb-8">
            We're a small team of developers passionate about improving the development experience. 
            We use MockAPI ourselves every day, and we're constantly working to make it better.
          </p>
          <p className="text-muted-foreground">
            Have feedback or suggestions? We'd love to hear from you at{' '}
            <a href="mailto:hello@mockapi.dev" className="text-primary hover:underline">
              hello@mockapi.dev
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
