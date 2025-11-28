import { useState, useEffect } from 'react';
import {
  Target, Plus, CheckCircle, Calendar, TrendingUp, Edit2,
  Trash2, Clock, Award, ArrowRight, BookOpen, FileText, Mic
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface DailyGoal {
  id: number;
  goal_type: string;
  target_value: number;
  current_value: number;
  unit: string;
  goal_date: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  progress_percentage: number;
}

const GOAL_TYPES = [
  { value: 'vocabulary', label: 'Learn Vocabulary', unit: 'words', icon: BookOpen },
  { value: 'practice', label: 'Practice Time', unit: 'minutes', icon: Clock },
  { value: 'lessons', label: 'Complete Lessons', unit: 'lessons', icon: FileText },
  { value: 'flashcards', label: 'Review Flashcards', unit: 'cards', icon: FileText },
  { value: 'pronunciation', label: 'Pronunciation Practice', unit: 'words', icon: Mic },
];

export default function LearningGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyGoalsLoading, setDailyGoalsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDailyGoalDialogOpen, setIsDailyGoalDialogOpen] = useState(false);
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
  const [dailyGoalForm, setDailyGoalForm] = useState({
    goal_type: 'vocabulary',
    target_value: 10,
  });

  useEffect(() => {
    loadGoals();
    loadDailyGoals();
  }, [user]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const result = await AdultsAPI.getLearningGoals(true);
      if (result.success && 'data' in result) {
        setGoals(result.data?.goals || []);
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyGoals = async () => {
    if (!user) return;
    try {
      setDailyGoalsLoading(true);
      const result = await AdultsAPI.getDailyGoals();
      if (result.success && 'data' in result) {
        setDailyGoals(result.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to load daily goals:', error);
    } finally {
      setDailyGoalsLoading(false);
    }
  };

  const handleCreateDailyGoal = async () => {
    try {
      const result = await AdultsAPI.createDailyGoal(dailyGoalForm);
      if (result.success) {
        setIsDailyGoalDialogOpen(false);
        setDailyGoalForm({ goal_type: 'vocabulary', target_value: 10 });
        loadDailyGoals();
      }
    } catch (error) {
      console.error('Failed to create daily goal:', error);
    }
  };

  const handleUpdateDailyGoal = async (goalId: number, currentValue: number) => {
    try {
      const result = await AdultsAPI.updateDailyGoal(goalId, { current_value: currentValue });
      if (result.success) {
        loadDailyGoals();
      }
    } catch (error) {
      console.error('Failed to update daily goal:', error);
    }
  };

  const getDailyGoalTypeInfo = (goalType: string) => {
    return GOAL_TYPES.find(gt => gt.value === goalType) || GOAL_TYPES[0];
  };

  const totalDailyProgress = dailyGoals.length > 0
    ? dailyGoals.reduce((sum, goal) => sum + goal.progress_percentage, 0) / dailyGoals.length
    : 0;

  const completedDailyCount = dailyGoals.filter(g => g.completed).length;

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-2">Learning Goals</h2>
        <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70 mb-4 sm:mb-6">Set and track your learning objectives</p>
      </div>

      <Tabs defaultValue="long-term" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/80 border-primary/30 mb-6 h-auto dark:bg-slate-900/60 dark:border-emerald-500/30">
          <TabsTrigger value="long-term" className="text-xs sm:text-sm data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-2 sm:py-3 dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300">
            Long-Term Goals
          </TabsTrigger>
          <TabsTrigger value="daily" className="text-xs sm:text-sm data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-2 sm:py-3 dark:data-[state=active]:bg-emerald-500/20 dark:data-[state=active]:text-emerald-300">
            Daily Goals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="long-term" className="space-y-6">
          {/* Create Goal Button */}
          <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
              onClick={() => {
                setEditingGoal(null);
                resetForm();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-primary/30 dark:bg-slate-900 dark:border-emerald-500/30 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground dark:text-white">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-foreground dark:text-cyan-200">Goal Type</Label>
                <Select
                  value={formData.goal_type}
                  onValueChange={(value) => setFormData({ ...formData, goal_type: value })}
                >
                  <SelectTrigger className="bg-card/60 backdrop-blur-xl border-primary/30 text-foreground dark:bg-slate-800 dark:border-emerald-500/30 dark:text-white">
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
                <Label className="text-foreground dark:text-cyan-200">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-card/60 backdrop-blur-xl border-primary/30 text-foreground dark:bg-slate-800 dark:border-emerald-500/30 dark:text-white"
                  placeholder="e.g., Practice 30 minutes daily"
                />
              </div>
              <div>
                <Label className="text-foreground dark:text-cyan-200">Description (Optional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-card/60 backdrop-blur-xl border-primary/30 text-foreground dark:bg-slate-800 dark:border-emerald-500/30 dark:text-white"
                  placeholder="Add more details about your goal..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground dark:text-cyan-200">Target Value</Label>
                  <Input
                    type="number"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: parseInt(e.target.value) || 0 })}
                    className="bg-card/60 backdrop-blur-xl border-primary/30 text-foreground dark:bg-slate-800 dark:border-emerald-500/30 dark:text-white"
                  />
                </div>
                <div>
                  <Label className="text-foreground dark:text-cyan-200">Unit</Label>
                  <Input
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="bg-card/60 backdrop-blur-xl border-primary/30 text-foreground dark:bg-slate-800 dark:border-emerald-500/30 dark:text-white"
                    placeholder="minutes, lessons, words..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground dark:text-cyan-200">Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="bg-card/60 backdrop-blur-xl border-primary/30 text-foreground dark:bg-slate-800 dark:border-emerald-500/30 dark:text-white"
                  />
                </div>
                <div>
                  <Label className="text-foreground dark:text-cyan-200">Target Date</Label>
                  <Input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    className="bg-card/60 backdrop-blur-xl border-primary/30 text-foreground dark:bg-slate-800 dark:border-emerald-500/30 dark:text-white"
                  />
                </div>
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
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
        <Card className="bg-card/60 backdrop-blur-xl border-primary/30 dark:bg-slate-900/60 dark:border-emerald-500/30">
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-primary dark:text-emerald-300" />
            <p className="text-muted-foreground dark:text-cyan-100/70 mb-4">No active goals yet. Create your first goal to get started!</p>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
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
                  "group bg-card/80 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden dark:bg-slate-900/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/50",
                  goal.completed && "ring-2 ring-emerald-500/50"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{getGoalTypeIcon(goal.goal_type)}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-foreground dark:text-white mb-1">
                          {goal.title}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30">
                          {getGoalTypeLabel(goal.goal_type)}
                        </Badge>
                      </div>
                    </div>
                    {goal.completed && (
                      <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {goal.description && (
                    <p className="text-sm text-muted-foreground dark:text-cyan-100/70 mb-4">{goal.description}</p>
                  )}

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground dark:text-cyan-100/80">
                        {goal.current_value} / {goal.target_value} {goal.unit}
                      </span>
                      <span className="text-foreground dark:text-white font-semibold">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress
                      value={progress}
                      className="h-3 bg-muted dark:bg-slate-700/50"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-cyan-100/60 mb-4">
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
                        className="flex-1 border-primary/30 text-primary hover:bg-primary/20 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
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
        </TabsContent>

        <TabsContent value="daily" className="space-y-6">
          {/* Daily Goals Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-2">Daily Goals</h2>
              <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70">
                Set daily targets to maintain consistent progress
              </p>
            </div>
            <Dialog open={isDailyGoalDialogOpen} onOpenChange={setIsDailyGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
                  onClick={() => setDailyGoalForm({ goal_type: 'vocabulary', target_value: 10 })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Daily Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-primary/30 dark:bg-slate-900 dark:border-emerald-500/30 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-foreground dark:text-white">Create Daily Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-foreground dark:text-cyan-200">Goal Type</Label>
                    <Select
                      value={dailyGoalForm.goal_type}
                      onValueChange={(value) => setDailyGoalForm({ ...dailyGoalForm, goal_type: value })}
                    >
                      <SelectTrigger className="bg-card/60 backdrop-blur-xl border-primary/30 text-foreground dark:bg-slate-800 dark:border-emerald-500/30 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GOAL_TYPES.map((type) => {
                          const Icon = type.icon;
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>{type.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-foreground dark:text-cyan-200">
                      Target ({getDailyGoalTypeInfo(dailyGoalForm.goal_type).unit})
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={dailyGoalForm.target_value}
                      onChange={(e) =>
                        setDailyGoalForm({
                          ...dailyGoalForm,
                          target_value: parseInt(e.target.value) || 1,
                        })
                      }
                      className="bg-card/60 backdrop-blur-xl border-primary/30 text-foreground dark:bg-slate-800 dark:border-emerald-500/30 dark:text-white"
                    />
                  </div>
                  <Button
                    onClick={handleCreateDailyGoal}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Daily Goals Summary */}
          {dailyGoals.length > 0 && (
            <Card className="bg-card/80 backdrop-blur-xl border-primary/30 dark:bg-slate-900/60 dark:border-emerald-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground dark:text-cyan-100/70">Overall Progress</span>
                      <span className="text-foreground dark:text-white font-semibold">{Math.round(totalDailyProgress)}%</span>
                    </div>
                    <Progress value={totalDailyProgress} className="h-2 bg-muted dark:bg-slate-700/50">
                      <div className="h-full rounded-full bg-primary dark:bg-emerald-500" />
                    </Progress>
                  </div>
                  <div className="text-center ml-6">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completedDailyCount}</div>
                    <div className="text-xs text-muted-foreground dark:text-cyan-100/70">Completed</div>
                  </div>
                  <div className="text-center ml-4">
                    <div className="text-2xl font-bold text-foreground dark:text-white">{dailyGoals.length}</div>
                    <div className="text-xs text-muted-foreground dark:text-cyan-100/70">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Daily Goals List */}
          {dailyGoalsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-emerald-400"></div>
            </div>
          ) : dailyGoals.length === 0 ? (
            <Card className="bg-card/60 backdrop-blur-xl border-primary/30 dark:bg-slate-900/60 dark:border-emerald-500/30">
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-primary dark:text-emerald-300" />
                <p className="text-muted-foreground dark:text-cyan-100/70 mb-4">No daily goals set for today</p>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
                  onClick={() => setIsDailyGoalDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Daily Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailyGoals.map((goal) => {
                const typeInfo = getDailyGoalTypeInfo(goal.goal_type);
                const Icon = typeInfo.icon;
                const isCompleted = goal.completed;

                return (
                  <Card
                    key={goal.id}
                    className={cn(
                      'border transition-all bg-card/80 backdrop-blur-xl dark:bg-slate-900/60',
                      isCompleted
                        ? 'bg-emerald-500/10 border-emerald-400/30 dark:bg-emerald-500/10 dark:border-emerald-400/30'
                        : 'border-primary/30 dark:border-emerald-500/20'
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            <h4 className="font-semibold text-foreground dark:text-white">{typeInfo.label}</h4>
                            {isCompleted && (
                              <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-400/30 dark:text-emerald-300 dark:border-emerald-400/30">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-cyan-100/70 mt-2">
                            <span>
                              {goal.current_value} / {goal.target_value} {typeInfo.unit}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(goal.goal_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Progress
                        value={goal.progress_percentage}
                        className={cn(
                          'h-2 mb-3',
                          isCompleted ? 'bg-emerald-500/20 dark:bg-emerald-500/20' : 'bg-muted dark:bg-slate-700/50'
                        )}
                      >
                        <div
                          className={cn(
                            'h-full rounded-full',
                            isCompleted
                              ? 'bg-emerald-600 dark:bg-emerald-500'
                              : 'bg-primary dark:bg-emerald-500'
                          )}
                        />
                      </Progress>

                      {!isCompleted && (
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min={0}
                            max={goal.target_value}
                            value={goal.current_value}
                            onChange={(e) => {
                              const newValue = Math.min(
                                Math.max(0, parseInt(e.target.value) || 0),
                                goal.target_value
                              );
                              handleUpdateDailyGoal(goal.id, newValue);
                            }}
                            className="flex-1 bg-card/60 backdrop-blur-xl border-primary/30 text-foreground text-sm dark:bg-slate-700/50 dark:border-emerald-500/30 dark:text-white"
                            placeholder="Update progress"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleUpdateDailyGoal(goal.id, goal.target_value)}
                            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                          >
                            Complete
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

