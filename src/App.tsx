import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Pages
import { Landing } from './pages/Landing';
import { Features } from './pages/Features';
import { About } from './pages/About';
import { Documentation } from './pages/Documentation';
import { Contact } from './pages/Contact';
import { SignIn } from './pages/SignIn';
import { SharedCollection } from './pages/SharedCollection';

// Dashboard Pages
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import { Overview } from './pages/dashboard/Overview';
import { Endpoints } from './pages/dashboard/Endpoints';
import { CreateEndpoint } from './pages/dashboard/CreateEndpoint';
import { EndpointDetail } from './pages/dashboard/EndpointDetail';
import { Analytics } from './pages/dashboard/Analytics';
import { Settings } from './pages/dashboard/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/features" element={<Features />} />
              <Route path="/about" element={<About />} />
              <Route path="/docs" element={<Documentation />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/share/:shareId" element={<SharedCollection />} />

              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Overview />} />
                <Route path="endpoints" element={<Endpoints />} />
                <Route path="endpoints/:id" element={<EndpointDetail />} />
                <Route path="create" element={<CreateEndpoint />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
            <Footer />
            <Toaster />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
