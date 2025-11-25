import { useState, useEffect } from 'react';
import {
  Sparkles, X, Check, ArrowRight, Lightbulb, BookOpen,
  Play, Target, TrendingUp, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AdultsAPI } from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Recommendation {
  id: number;
  recommendation_type: string;
  title: string;
  description: string;
  priority: number;
  target_id?: string;
  target_type?: string;
  action_url?: string;
  reason?: string;
  confidence_score: number;
  viewed: boolean;
  accepted: boolean;
  dismissed: boolean;
}

export default function PersonalizedRecommendations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const result = await AdultsAPI.getRecommendations();
      if (result.success) {
        setRecommendations(result.data?.recommendations || []);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (recommendationId: number) => {
    try {
      await AdultsAPI.viewRecommendation(recommendationId);
      loadRecommendations();
    } catch (error) {
      console.error('Failed to mark as viewed:', error);
    }
  };

  const handleAccept = async (recommendationId: number, actionUrl?: string) => {
    try {
      await AdultsAPI.acceptRecommendation(recommendationId);
      if (actionUrl) {
        navigate(actionUrl);
      }
      loadRecommendations();
    } catch (error) {
      console.error('Failed to accept recommendation:', error);
    }
  };

  const handleDismiss = async (recommendationId: number) => {
    try {
      await AdultsAPI.dismissRecommendation(recommendationId);
      loadRecommendations();
    } catch (error) {
      console.error('Failed to dismiss recommendation:', error);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return <BookOpen className="h-5 w-5" />;
      case 'practice':
        return <Play className="h-5 w-5" />;
      case 'video':
        return <Play className="h-5 w-5" />;
      case 'challenge':
        return <Target className="h-5 w-5" />;
      case 'review':
        return <TrendingUp className="h-5 w-5" />;
      case 'path':
        return <ArrowRight className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getRecommendationColor = (priority: number) => {
    if (priority >= 8) return 'from-amber-500 to-orange-600';
    if (priority >= 6) return 'from-purple-500 to-pink-600';
    return 'from-cyan-500 to-blue-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30">
        <CardContent className="p-12 text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-cyan-300/50" />
          <p className="text-cyan-100/70">No recommendations at the moment. Keep learning!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Personalized Recommendations</h2>
          <p className="text-sm text-cyan-100/70">
            AI-powered suggestions based on your learning progress
          </p>
        </div>
        <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
          <Sparkles className="h-3 w-3 mr-1" />
          {recommendations.length} Suggestions
        </Badge>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const priorityColor = getRecommendationColor(rec.priority);

          return (
            <Card
              key={rec.id}
              className={cn(
                "group bg-slate-900/60 backdrop-blur-xl border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20",
                !rec.viewed && "ring-2 ring-cyan-500/50"
              )}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={cn(
                    "p-3 rounded-xl text-white bg-gradient-to-r flex-shrink-0",
                    priorityColor
                  )}>
                    {getRecommendationIcon(rec.recommendation_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {rec.title}
                        </h3>
                        <p className="text-sm text-cyan-100/70 mb-3">
                          {rec.description}
                        </p>
                        {rec.reason && (
                          <div className="bg-slate-800/40 rounded-lg p-2 mb-3">
                            <p className="text-xs text-cyan-200/80 flex items-center gap-1">
                              <Lightbulb className="h-3 w-3" />
                              {rec.reason}
                            </p>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-cyan-300/50 hover:text-cyan-300 hover:bg-transparent p-1 h-auto"
                        onClick={() => handleDismiss(rec.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-400/30">
                        {rec.recommendation_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-slate-700/50 text-cyan-200 border-cyan-500/30">
                        <Star className="h-3 w-3 mr-1" />
                        {(rec.confidence_score * 100).toFixed(0)}% confidence
                      </Badge>
                      {rec.priority >= 8 && (
                        <Badge variant="outline" className="text-xs bg-amber-500/20 text-amber-300 border-amber-400/30">
                          High Priority
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white"
                        onClick={() => {
                          handleView(rec.id);
                          handleAccept(rec.id, rec.action_url || undefined);
                        }}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accept
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-purple-400/30 text-purple-300 hover:bg-purple-500/20"
                        onClick={() => handleDismiss(rec.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

