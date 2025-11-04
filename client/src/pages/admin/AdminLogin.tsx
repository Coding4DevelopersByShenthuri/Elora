import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Mail, Shield } from 'lucide-react';
import { API } from '@/services/ApiService';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.auth.login({ email, password });
      
      console.log('🔍 Login response:', response);
      
      if (response.success && 'data' in response && response.data) {
        // The API service wraps the response: { success: true, data: {...}, message: "..." }
        // The server returns: { user: {...}, token: "...", refresh: "...", message: "..." }
        const loginData = response.data;
        
        // Extract user and token directly from the response data
        const user = loginData.user;
        const token = loginData.token;
        
        console.log('🔍 Extracted user:', user);
        console.log('🔍 Extracted token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
        
        if (!user) {
          setError('Login successful but user data not received.');
          setLoading(false);
          return;
        }
        
        // Verify token exists - API service should have stored it, but double-check
        const storedToken = localStorage.getItem('speakbee_auth_token');
        if (!storedToken || storedToken === 'local-token') {
          if (token) {
            localStorage.setItem('speakbee_auth_token', token);
            console.log('✅ Auth token stored from response');
          } else {
            setError('Authentication token not received. Please check the server response.');
            setLoading(false);
            return;
          }
        } else {
          console.log('✅ Token already stored by API service');
        }
        
        // Check if user is admin/staff
        if (!user.is_staff && !user.is_superuser) {
          setError('Access denied. Admin privileges required.\n\nPlease make sure your user account has admin privileges. If you need admin access, contact the system administrator.');
          setLoading(false);
          API.auth.logout();
          return;
        }

        // Store admin flag and user data
        localStorage.setItem('speakbee_is_admin', 'true');
        localStorage.setItem('speakbee_current_user', JSON.stringify(user));
        
        // Verify token one more time before redirecting
        const finalToken = localStorage.getItem('speakbee_auth_token');
        if (!finalToken || finalToken === 'local-token') {
          setError('Token not stored properly. Please try logging in again.');
          setLoading(false);
          return;
        }
        
        console.log('✅ Login successful, redirecting to dashboard');
        console.log('✅ User is_staff:', user.is_staff, 'is_superuser:', user.is_superuser);
        
        // Small delay to ensure everything is stored
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 100);
      } else {
        // Check if it's a server connection error
        const status = (response as any).status;
        if (response.message?.includes('Server not reachable') || response.message?.includes('offline mode') || status === 0) {
          setError('⚠️ Backend server not running! Please start the Django server:\n\n1. Open a new terminal\n2. Run: cd server\n3. Run: python manage.py runserver\n\nThen try logging in again.');
        } else {
          setError(response.message || 'Login failed. Please check your credentials.');
        }
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      const errorMsg = err?.message || err?.response?.data?.message || 'An error occurred during login';
      if (errorMsg.includes('Server not reachable') || errorMsg.includes('offline mode') || err?.response?.status === 0) {
        setError('⚠️ Backend server not running! Please start the Django server:\n\n1. Open a new terminal\n2. Run: cd server\n3. Run: python manage.py runserver\n\nThen try logging in again.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen admin-theme flex items-center justify-center p-4" style={{ backgroundColor: '#f0fdf4' }}>
      <Card className="w-full max-w-md shadow-lg soft-card">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

