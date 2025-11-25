import { useState, useEffect } from 'react';
import {
  Target, Plus, CheckCircle, Calendar, TrendingUp, Edit2,
  Trash2, Clock, Award, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AdultsAPI } from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';

interface LearningGoal {
  id: number;
  goal_type: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  start_date: string;
  target_date: string;
  completed_at?: string;
  completed: boolean;
  is_active: boolean;
  progress_percentage: number;
}

export default function LearningGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<LearningGoal | null>(null);
  const [formData, setFormData] = useState({
    goal_type: 'daily_practice',
    title: '',
    description: '',
    target_value: 30,
    unit: 'minutes',
    start_date: new Date().toISOString().split('T')[0],
    target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const result = await AdultsAPI.getLearningGoals(true);
      if (result.success) {
        setGoals(result.data?.goals || []);
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    try {
      const result = await AdultsAPI.createLearningGoal(formData);
      if (result.success) {
        setIsDialogOpen(false);
        resetForm();
        loadGoals();
      }
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const handleUpdateGoal = async (goalId: number) => {
    try {
      const result = await AdultsAPI.updateLearningGoal(goalId, {
        current_value: formData.target_value,
      });
      if (result.success) {
        setIsDialogOpen(false);
        setEditingGoal(null);
        resetForm();
        loadGoals();
      }
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      goal_type: 'daily_practice',
      title: '',
      description: '',
      target_value: 30,
      unit: 'minutes',
      start_date: new Date().toISOString().split('T')[0],
      target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  };

  const getGoalTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      daily_practice: 'Daily Practice Time',
      weekly_lessons: 'Weekly Lessons',
      vocabulary: 'Vocabulary Words',
      streak: 'Learning Streak',
      score: 'Average Score',
      custom: 'Custom Goal',
    };
    return labels[type] || type;
  };

  const getGoalTypeIcon = (type: string) => {
    switch (type) {
      case 'daily_practice':
        return '⏱️';
      case 'weekly_lessons':
        return '📚';
      case 'vocabulary':
        return '📖';
      case 'streak':
        return '🔥';
      case 'score':
        return '⭐';
      default:
        return '🎯';
    }
  };

  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Learning Goals</h2>
          <p className="text-sm text-cyan-100/70">
            Set and track your learning objectives
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white"
              onClick={() => {
                setEditingGoal(null);
                resetForm();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-purple-500/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-cyan-200">Goal Type</Label>
                <Select
                  value={formData.goal_type}
                  onValueChange={(value) => setFormData({ ...formData, goal_type: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-purple-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily_practice">Daily Practice Time</SelectItem>
                    <SelectItem value="weekly_lessons">Weekly Lessons Completed</SelectItem>
                    <SelectItem value="vocabulary">Vocabulary Words Learned</SelectItem>
                    <SelectItem value="streak">Learning Streak</SelectItem>
                    <SelectItem value="score">Average Score Target</SelectItem>
                    <SelectItem value="custom">Custom Goal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-cyan-200">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-slate-800 border-purple-500/30 text-white"
                  placeholder="e.g., Practice 30 minutes daily"
                />
              </div>
              <div>
                <Label className="text-cyan-200">Description (Optional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-800 border-purple-500/30 text-white"
                  placeholder="Add more details about your goal..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-cyan-200">Target Value</Label>
                  <Input
                    type="number"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: parseInt(e.target.value) || 0 })}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-cyan-200">Unit</Label>
                  <Input
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="bg-slate-800 border-purple-500/30 text-white"
                    placeholder="minutes, lessons, words..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-cyan-200">Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-cyan-200">Target Date</Label>
                  <Input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                </div>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white"
                onClick={editingGoal ? () => handleUpdateGoal(editingGoal.id) : handleCreateGoal}
              >
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30">
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-cyan-300/50" />
            <p className="text-cyan-100/70 mb-4">No active goals yet. Create your first goal to get started!</p>
            <Button
              className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {goals.map((goal) => {
            const daysRemaining = getDaysRemaining(goal.target_date);
            const progress = goal.progress_percentage;

            return (
              <Card
                key={goal.id}
                className={cn(
                  "group bg-slate-900/60 backdrop-blur-xl border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden",
                  goal.completed && "ring-2 ring-emerald-500/50"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{getGoalTypeIcon(goal.goal_type)}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-white mb-1">
                          {goal.title}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-400/30">
                          {getGoalTypeLabel(goal.goal_type)}
                        </Badge>
                      </div>
                    </div>
                    {goal.completed && (
                      <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {goal.description && (
                    <p className="text-sm text-cyan-100/70 mb-4">{goal.description}</p>
                  )}

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-cyan-100/80">
                        {goal.current_value} / {goal.target_value} {goal.unit}
                      </span>
                      <span className="text-white font-semibold">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress
                      value={progress}
                      className="h-3 bg-slate-700/50"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex items-center justify-between text-xs text-cyan-100/60 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {daysRemaining} days left
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {goal.completed ? 'Achieved!' : 'In Progress'}
                    </span>
                  </div>

                  {/* Actions */}
                  {!goal.completed && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-purple-400/30 text-purple-300 hover:bg-purple-500/20"
                        onClick={() => {
                          setEditingGoal(goal);
                          setFormData({
                            goal_type: goal.goal_type,
                            title: goal.title,
                            description: goal.description,
                            target_value: goal.target_value,
                            unit: goal.unit,
                            start_date: goal.start_date,
                            target_date: goal.target_date,
                          });
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

