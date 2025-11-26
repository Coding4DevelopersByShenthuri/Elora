import { useState, useEffect } from 'react';
import { Globe, BookOpen, Play, CheckCircle, X, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { AdultsAPI } from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';

interface CulturalModule {
  id: number;
  title: string;
  description: string;
  slug: string;
  category: string;
  region: string;
  content: any;
  estimated_time_minutes: number;
  views: number;
  completion_count: number;
  order: number;
}

interface CulturalProgress {
  id: number;
  module: CulturalModule;
  score: number;
  quiz_score?: number;
  time_spent_minutes: number;
  completed: boolean;
  completed_at?: string;
  started_at: string;
}

interface CulturalIntelligenceProps {
  onClose: () => void;
}

export default function CulturalIntelligence({ onClose }: CulturalIntelligenceProps) {
  const { user } = useAuth();
  const [modules, setModules] = useState<CulturalModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<CulturalModule | null>(null);
  const [progress, setProgress] = useState<CulturalProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadModules();
      loadProgress();
    }
  }, [user, categoryFilter]);

  const loadModules = async () => {
    try {
      setLoading(true);
      const result = await AdultsAPI.getCulturalModules(
        categoryFilter !== 'all' ? categoryFilter : undefined
      );
      if (result.success && 'data' in result) {
        setModules(result.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to load modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const result = await AdultsAPI.getCulturalProgress();
      if (result.success && 'data' in result) {
        setProgress(result.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const handleModuleSelect = async (slug: string) => {
    try {
      const result = await AdultsAPI.getCulturalModuleDetail(slug);
      if (result.success && 'data' in result) {
        setSelectedModule(result.data?.data);
      }
    } catch (error) {
      console.error('Failed to load module:', error);
    }
  };

  const handleCompleteModule = async () => {
    if (!selectedModule) return;

    try {
      const result = await AdultsAPI.updateCulturalProgress({
        module_id: selectedModule.id,
        completed: true,
        score: 100,
        quiz_score: 85,
        time_spent_minutes: selectedModule.estimated_time_minutes,
      });

      if (result.success) {
        loadProgress();
        handleModuleSelect(selectedModule.slug);
      }
    } catch (error) {
      console.error('Failed to complete module:', error);
    }
  };

  const getModuleProgress = (moduleId: number) => {
    return progress.find(p => p.module.id === moduleId);
  };

  const categories = Array.from(new Set(modules.map(m => m.category))).filter(Boolean);

  const showCloseButton = onClose && typeof onClose === 'function';
  
  return (
    <Card className={cn(
      "bg-slate-900/95 backdrop-blur-xl border-purple-500/30 shadow-2xl w-full flex flex-col mx-auto",
      showCloseButton ? "max-w-5xl max-h-[90vh]" : ""
    )}>
      <CardHeader className="border-b border-purple-500/30">
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-pink-400" />
            Cultural Intelligence
          </span>
          {showCloseButton && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
        {!selectedModule ? (
          <Tabs defaultValue="modules" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full bg-slate-800/50 border-b border-purple-500/30 rounded-none">
              <TabsTrigger value="modules" className="flex-1">Modules</TabsTrigger>
              <TabsTrigger value="progress" className="flex-1">Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="modules" className="flex-1 overflow-y-auto p-6">
              {categories.length > 0 && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  <Button
                    variant={categoryFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter('all')}
                    className={categoryFilter === 'all' ? 'bg-purple-500/20' : ''}
                  >
                    All
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={categoryFilter === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCategoryFilter(cat)}
                      className={categoryFilter === cat ? 'bg-purple-500/20' : ''}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              )}

              {loading ? (
                <div className="text-center py-8 text-cyan-100/70">Loading modules...</div>
              ) : modules.length === 0 ? (
                <div className="text-center py-8 text-cyan-100/70">
                  No cultural modules available yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modules.map((module) => {
                    const moduleProgress = getModuleProgress(module.id);
                    const isCompleted = moduleProgress?.completed || false;

                    return (
                      <Card
                        key={module.id}
                        className={cn(
                          'cursor-pointer transition-all border-purple-500/30',
                          isCompleted
                            ? 'bg-green-500/10 border-green-400/30'
                            : 'bg-slate-800/30 hover:bg-slate-800/50'
                        )}
                        onClick={() => handleModuleSelect(module.slug)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-white">{module.title}</h4>
                                {isCompleted && (
                                  <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              {module.region && (
                                <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs mb-2">
                                  {module.region}
                                </Badge>
                              )}
                              <p className="text-sm text-cyan-100/70 line-clamp-2 mb-3">
                                {module.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-cyan-300/60">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {module.estimated_time_minutes} min
                            </span>
                            <span>{module.views} views</span>
                          </div>

                          {moduleProgress && (
                            <div className="mt-3">
                              <Progress
                                value={moduleProgress.score}
                                className="h-2 bg-slate-700/50"
                              />
                              <div className="text-xs text-cyan-100/70 mt-1">
                                Score: {Math.round(moduleProgress.score)}%
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="progress" className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {progress.length === 0 ? (
                  <div className="text-center py-8 text-cyan-100/70">
                    No progress yet. Start learning about different cultures!
                  </div>
                ) : (
                  progress.map((p) => (
                    <Card key={p.id} className="border-purple-500/30 bg-slate-800/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-2">{p.module.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-cyan-100/70">
                              <span>Score: {Math.round(p.score)}%</span>
                              {p.quiz_score && <span>Quiz: {Math.round(p.quiz_score)}%</span>}
                              <span>{p.time_spent_minutes} min</span>
                            </div>
                          </div>
                          {p.completed && (
                            <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedModule(null)}
                  className="text-cyan-300"
                >
                  ← Back to Modules
                </Button>
                {!getModuleProgress(selectedModule.id)?.completed && (
                  <Button onClick={handleCompleteModule}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                )}
              </div>

              <Card className="border-purple-500/30 bg-slate-800/30">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-white text-2xl">{selectedModule.title}</CardTitle>
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                      {selectedModule.region}
                    </Badge>
                  </div>
                  <p className="text-cyan-100/80">{selectedModule.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none">
                    {selectedModule.content && (
                      <div className="text-cyan-100/90 space-y-4">
                        {typeof selectedModule.content === 'string' ? (
                          <div dangerouslySetInnerHTML={{ __html: selectedModule.content }} />
                        ) : (
                          <p>Module content will be displayed here...</p>
                        )}
                      </div>
                    )}
                    {!selectedModule.content && (
                      <div className="text-center py-12 text-cyan-100/70">
                        <BookOpen className="h-16 w-16 mx-auto mb-4 text-cyan-300/50" />
                        <p>Module content is being prepared. Check back soon!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

