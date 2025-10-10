import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

export function Settings() {
  const { user } = useAuth();
  const [corsEnabled, setCorsEnabled] = useState(true);
  const [cacheEnabled, setCacheEnabled] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSaveProfile = () => {
    toast.success('Profile settings saved (demo)');
  };

  const handleSaveApiSettings = () => {
    toast.success('API settings saved (demo)');
  };

  return (
    <div className="p-8  container">
      {/* Header */}
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
            />
            <p className="text-sm text-muted-foreground">
              Email cannot be changed
            </p>
          </div>
          <Button onClick={handleSaveProfile}>Save Changes</Button>
        </CardContent>
      </Card>

      {/* API Settings */}
      <Card>
        <CardHeader>
          <CardTitle>API Settings</CardTitle>
          <CardDescription>Configure default API behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>CORS Enabled</Label>
              <p className="text-sm text-muted-foreground">
                Allow cross-origin requests to your APIs
              </p>
            </div>
            <Switch 
              checked={corsEnabled} 
              onCheckedChange={setCorsEnabled}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Response Caching</Label>
              <p className="text-sm text-muted-foreground">
                Cache responses for faster performance
              </p>
            </div>
            <Switch 
              checked={cacheEnabled} 
              onCheckedChange={setCacheEnabled}
            />
          </div>
          <Button onClick={handleSaveApiSettings}>Save API Settings</Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2">Delete Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. All your endpoints and data will be permanently deleted.
            </p>
            <Button 
              variant="destructive"
              onClick={() => toast.error('Account deletion is disabled in demo mode')}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
