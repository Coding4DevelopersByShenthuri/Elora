import { useState, useEffect } from 'react';
import {
  BookOpen, Target, FileText, Mic,
  ChevronUp, ChevronDown, Settings, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AdultsAPI } from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';

interface ToolbarPreferences {
  enabled_tools: string[];
  tool_order: string[];
  toolbar_position: 'left' | 'right' | 'bottom';
  is_collapsed: boolean;
}

const TOOLS = {
  dictionary: { icon: BookOpen, label: 'Dictionary', color: 'text-emerald-400' },
  flashcards: { icon: FileText, label: 'Flashcards', color: 'text-green-400' },
};

interface QuickAccessToolbarProps {
  onToolClick: (tool: string) => void;
}

export default function QuickAccessToolbar({ onToolClick }: QuickAccessToolbarProps) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<ToolbarPreferences>({
    enabled_tools: ['dictionary', 'flashcards'],
    tool_order: ['dictionary', 'flashcards'],
    toolbar_position: 'bottom',
    is_collapsed: false,
  });
  const [isExpanded, setIsExpanded] = useState(!preferences.is_collapsed);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    try {
      const result = await AdultsAPI.getToolbarPreferences();
      if (result.success && 'data' in result && result.data) {
        setPreferences({
          enabled_tools: result.data.enabled_tools || ['dictionary', 'flashcards'],
          tool_order: result.data.tool_order || Object.keys(TOOLS),
          toolbar_position: (result.data.toolbar_position as 'left' | 'right' | 'bottom') || 'bottom',
          is_collapsed: result.data.is_collapsed || false,
        });
        setIsExpanded(!(result.data.is_collapsed || false));
      }
    } catch (error) {
      console.error('Failed to load toolbar preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    
    if (user) {
      try {
        await AdultsAPI.updateToolbarPreferences({
          enabled_tools: preferences.enabled_tools,
          tool_order: preferences.tool_order,
          toolbar_position: preferences.toolbar_position,
        });
        setPreferences({ ...preferences, is_collapsed: !newState });
      } catch (error) {
        console.error('Failed to update preferences:', error);
      }
    }
  };

  const availableTools = preferences.tool_order
    .filter(tool => preferences.enabled_tools.includes(tool))
    .slice(0, isExpanded ? 10 : 3);

  if (loading || !user) return null;

  // Desktop: Right side vertical, Mobile: Bottom right corner compact
  return (
    <>
      {/* Desktop View - Right Side Vertical */}
      <div className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-40 transition-all duration-300">
        <Card className={cn(
          'bg-card/95 backdrop-blur-xl border-primary/30 shadow-2xl',
          'dark:bg-slate-900/95 dark:border-emerald-500/30',
          'transition-all duration-300'
        )}>
          <CardContent className="p-2">
            <div className="flex flex-col gap-2 items-center">
              {availableTools.map((tool) => {
                const toolConfig = TOOLS[tool as keyof typeof TOOLS];
                if (!toolConfig) return null;
                
                const Icon = toolConfig.icon;
                return (
                  <Button
                    key={tool}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-11 w-11 rounded-lg transition-all duration-200',
                      'hover:bg-primary/20 hover:border-primary/50',
                      'dark:hover:bg-emerald-500/20 dark:hover:border-emerald-400/50',
                      toolConfig.color
                    )}
                    onClick={() => onToolClick(tool)}
                    title={toolConfig.label}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                );
              })}

              <div className="border-t border-primary/30 dark:border-emerald-500/30 my-1 w-8" />

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg hover:bg-primary/20 dark:hover:bg-emerald-500/20"
                onClick={toggleExpand}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-primary dark:text-emerald-300" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-primary dark:text-emerald-300" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile View - Bottom Right Corner Compact */}
      <div className="md:hidden fixed bottom-4 right-4 z-40 transition-all duration-300">
        <Card className={cn(
          'bg-card/95 backdrop-blur-xl border-primary/30 shadow-2xl',
          'dark:bg-slate-900/95 dark:border-emerald-500/30',
          'transition-all duration-300'
        )}>
          <CardContent className="p-2">
            <div className="flex flex-row gap-1.5 items-center">
              {isExpanded && availableTools.map((tool) => {
                const toolConfig = TOOLS[tool as keyof typeof TOOLS];
                if (!toolConfig) return null;
                
                const Icon = toolConfig.icon;
                return (
                  <Button
                    key={tool}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-10 w-10 rounded-lg transition-all duration-200',
                      'hover:bg-primary/20 hover:border-primary/50',
                      'dark:hover:bg-emerald-500/20 dark:hover:border-emerald-400/50',
                      toolConfig.color
                    )}
                    onClick={() => onToolClick(tool)}
                    title={toolConfig.label}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                );
              })}

              {isExpanded && (
                <div className="border-l border-primary/30 dark:border-emerald-500/30 mx-1 h-6" />
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-lg hover:bg-primary/20 bg-primary/10 dark:hover:bg-emerald-500/20 dark:bg-emerald-500/10"
                onClick={toggleExpand}
                title={isExpanded ? 'Collapse' : 'Expand Tools'}
              >
                {isExpanded ? (
                  <X className="h-4 w-4 text-primary dark:text-emerald-300" />
                ) : (
                  <FileText className="h-4 w-4 text-primary dark:text-emerald-300" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Modal - Can be implemented later */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="bg-card border-primary/30 dark:bg-slate-900 dark:border-emerald-500/30 w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Toolbar Settings</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-cyan-100/70">Settings panel coming soon...</p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

