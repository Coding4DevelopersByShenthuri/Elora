import { useState, useEffect } from 'react';
import { Target, CheckCircle, Plus, X, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AdultsAPI } from '@/services/ApiService';
import { useAuth } from '@/contexts/AuthContext';

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

interface DailyGoalsWidgetProps {
  onClose: () => void;
}

const GOAL_TYPES = [
  { value: 'vocabulary', label: 'Learn Vocabulary', unit: 'words', icon: '📚' },
  { value: 'practice', label: 'Practice Time', unit: 'minutes', icon: '⏱️' },
  { value: 'lessons', label: 'Complete Lessons', unit: 'lessons', icon: '📖' },
  { value: 'pronunciation', label: 'Pronunciation Practice', unit: 'words', icon: '🎤' },
];

export default function DailyGoalsWidget({ onClose }: DailyGoalsWidgetProps) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goal_type: 'vocabulary',
    target_value: 10,
  });

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const result = await AdultsAPI.getDailyGoals();
      if (result.success && 'data' in result) {
        setGoals(result.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to load daily goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    try {
      const result = await AdultsAPI.createDailyGoal(newGoal);
      if (result.success) {
        loadGoals();
        setShowAddForm(false);
        setNewGoal({ goal_type: 'vocabulary', target_value: 10 });
      }
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const handleUpdateGoal = async (goalId: number, currentValue: number) => {
    try {
      const result = await AdultsAPI.updateDailyGoal(goalId, { current_value: currentValue });
      if (result.success) {
        loadGoals();
      }
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  const getGoalTypeInfo = (goalType: string) => {
    return GOAL_TYPES.find(gt => gt.value === goalType) || GOAL_TYPES[0];
  };

  const totalProgress = goals.length > 0
    ? goals.reduce((sum, goal) => sum + goal.progress_percentage, 0) / goals.length
    : 0;

  const completedCount = goals.filter(g => g.completed).length;

  return (
    <Card className="bg-slate-900/95 backdrop-blur-xl border-purple-500/30 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
      <CardHeader className="border-b border-purple-500/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-green-400" />
            Daily Goals
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Summary */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-cyan-100/70">Overall Progress</span>
              <span className="text-white font-semibold">{Math.round(totalProgress)}%</span>
            </div>
            <Progress value={totalProgress} className="h-2 bg-slate-700/50">
              <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />
            </Progress>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{completedCount}</div>
            <div className="text-xs text-cyan-100/70">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{goals.length}</div>
            <div className="text-xs text-cyan-100/70">Total</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0">
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="text-center text-cyan-300/70 py-8">Loading goals...</div>
          ) : goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-cyan-300/50 mx-auto mb-4" />
              <p className="text-cyan-300/70 mb-4">No goals set for today</p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </div>
          ) : (
            <>
              {goals.map((goal) => {
                const typeInfo = getGoalTypeInfo(goal.goal_type);
                const isCompleted = goal.completed;
                
                return (
                  <Card
                    key={goal.id}
                    className={cn(
                      'border transition-all',
                      isCompleted
                        ? 'bg-green-500/10 border-green-400/30'
                        : 'bg-slate-800/30 border-purple-500/20'
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{typeInfo.icon}</span>
                            <h4 className="font-semibold text-white">{typeInfo.label}</h4>
                            {isCompleted && (
                              <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-cyan-100/70 mt-2">
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
                          isCompleted ? 'bg-green-500/20' : 'bg-slate-700/50'
                        )}
                      >
                        <div
                          className={cn(
                            'h-full rounded-full',
                            isCompleted
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : 'bg-gradient-to-r from-blue-500 to-purple-500'
                          )}
                        />
                      </Progress>

                      {!isCompleted && (
                        <div className="flex items-center gap-2">
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
                              handleUpdateGoal(goal.id, newValue);
                            }}
                            className="flex-1 bg-slate-700/50 border-purple-500/30 text-white"
                            placeholder="Update progress"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleUpdateGoal(goal.id, goal.target_value)}
                          >
                            Mark Complete
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </>
          )}

          {/* Add Goal Form */}
          {showAddForm && (
            <Card className="border-purple-500/30 bg-slate-800/50">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">Create New Goal</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-cyan-100/80">Goal Type</Label>
                    <Select
                      value={newGoal.goal_type}
                      onValueChange={(value) => setNewGoal({ ...newGoal, goal_type: value })}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GOAL_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="mr-2">{type.icon}</span>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-cyan-100/80">
                      Target ({getGoalTypeInfo(newGoal.goal_type).unit})
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={newGoal.target_value}
                      onChange={(e) =>
                        setNewGoal({
                          ...newGoal,
                          target_value: parseInt(e.target.value) || 1,
                        })
                      }
                      className="bg-slate-700/50 border-purple-500/30 text-white"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateGoal}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Goal
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!showAddForm && goals.length > 0 && (
            <Button
              variant="outline"
              className="w-full border-purple-500/30"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Goal
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

