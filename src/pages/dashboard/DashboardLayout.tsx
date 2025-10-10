import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Boxes, 
  Plus, 
  Settings, 
  BarChart3,
  User
} from 'lucide-react';
import { cn } from '../../components/ui/utils';
import { useAuth } from '../../contexts/AuthContext';

export function DashboardLayout() {
  const location = useLocation();
  const { user, loading } = useAuth();
  
  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Endpoints', href: '/dashboard/endpoints', icon: Boxes },
    { name: 'Create Endpoint', href: '/dashboard/create', icon: Plus },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-muted/30 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{user.name || 'User'}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                  isActive(item.href, item.exact)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
}
