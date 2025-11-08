import { AnimatedTransition } from '@/components/common/AnimatedTransition';
import { useAnimateIn } from '@/lib/animations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { verifyOnlineOnlyMode } from "@/services/OfflinePrefetch";
import { useNavigate } from 'react-router-dom';
import { Lock, ChevronRight } from 'lucide-react';

const Settings = () => {
  const showContent = useAnimateIn(false, 300);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [connectivityMessage, setConnectivityMessage] = useState<string | null>(null);
  const [connectionResult, setConnectionResult] = useState<'healthy' | 'error' | null>(null);
  const navigate = useNavigate();

  const handleConnectivityCheck = async () => {
    setConnectivityMessage(null);
    setConnectionResult(null);
    setIsCheckingConnection(true);
    try {
      await verifyOnlineOnlyMode();
      setConnectivityMessage('Connection looks good! The backend responded successfully.');
      setConnectionResult('healthy');
    } catch (error) {
      setConnectivityMessage(
        error instanceof Error
          ? error.message
          : 'Unable to verify the connection. Please ensure the backend is reachable.'
      );
      setConnectionResult('error');
    } finally {
      setIsCheckingConnection(false);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 pb-12 md:pb-16">
      <AnimatedTransition show={showContent} animation="slide-up">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Customize your digital second brain
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 md:mb-8">
              <TabsTrigger value="general" className="text-xs sm:text-sm">General</TabsTrigger>
              <TabsTrigger value="appearance" className="text-xs sm:text-sm">Appearance</TabsTrigger>
              <TabsTrigger value="integrations" className="text-xs sm:text-sm">Integrations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-save" className="text-base">Auto-save</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save changes as you work
                      </p>
                    </div>
                    <Switch id="auto-save" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications" className="text-base">Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about updates and activity
                      </p>
                    </div>
                    <Switch id="notifications" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="ai-suggestions" className="text-base">AI Suggestions</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow AI to provide content suggestions
                      </p>
                    </div>
                    <Switch id="ai-suggestions" defaultChecked />
                  </div>

                  <div className="h-px bg-border" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Connectivity Health Check</Label>
                      <p className="text-sm text-muted-foreground">
                        Verify that Elora can reach the online services required for real-time learning
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={handleConnectivityCheck}
                      disabled={isCheckingConnection}
                    >
                      {isCheckingConnection ? 'Checking…' : 'Run Check'}
                    </Button>
                  </div>

                  {connectivityMessage && (
                    <div
                      className={`rounded-lg border px-4 py-3 text-sm ${
                        connectionResult === 'healthy'
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}
                    >
                      {connectivityMessage}
                    </div>
                  )}

                  <div className="h-px bg-border" />

                  <div>
                    <h3 className="text-base font-semibold mb-4">Kids Learning Settings</h3>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-between h-auto py-4 px-4 border-2 border-purple-300 dark:border-purple-600 bg-purple-50/40 dark:bg-purple-900/10 hover:bg-purple-100/60 dark:hover:bg-purple-900/20 transition-colors"
                        onClick={() => navigate('/parental-controls')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-gray-900 dark:text-white">Parental Controls</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Manage screen time and content filters</div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize how your second brain looks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Toggle between light and dark themes
                      </p>
                    </div>
                    <Switch id="dark-mode" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="animations" className="text-base">Animations</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable smooth transitions and animations
                      </p>
                    </div>
                    <Switch id="animations" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compact-view" className="text-base">Compact View</Label>
                      <p className="text-sm text-muted-foreground">
                        Display more content with less spacing
                      </p>
                    </div>
                    <Switch id="compact-view" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="integrations">
              <Card>
                <CardHeader>
                  <CardTitle>Integrations</CardTitle>
                  <CardDescription>
                    Connect your second brain with external services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="google-drive" className="text-base">Google Drive</Label>
                      <p className="text-sm text-muted-foreground">
                        Import and sync files from Google Drive
                      </p>
                    </div>
                    <Switch id="google-drive" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notion" className="text-base">Notion</Label>
                      <p className="text-sm text-muted-foreground">
                        Sync with your Notion workspaces
                      </p>
                    </div>
                    <Switch id="notion" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="github" className="text-base">GitHub</Label>
                      <p className="text-sm text-muted-foreground">
                        Connect to your GitHub repositories
                      </p>
                    </div>
                    <Switch id="github" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AnimatedTransition>
    </div>
  );
};

export default Settings;
