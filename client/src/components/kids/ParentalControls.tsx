import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Lock, Unlock, Clock, BarChart3, Settings, Eye, EyeOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParentalControlsProps {
  userId: string;
  onClose: () => void;
}

interface UsageStats {
  totalMinutesToday: number;
  totalMinutesWeek: number;
  wordsLearned: number;
  storiesCompleted: number;
  gamesPlayed: number;
  lastActive: string;
}

const ParentalControls = ({ userId, onClose }: ParentalControlsProps) => {
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(30);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'settings' | 'stats'>('settings');
  const [stats, setStats] = useState<UsageStats>({
    totalMinutesToday: 0,
    totalMinutesWeek: 0,
    wordsLearned: 0,
    storiesCompleted: 0,
    gamesPlayed: 0,
    lastActive: new Date().toISOString()
  });

  useEffect(() => {
    // Load saved PIN and settings
    const savedPin = localStorage.getItem(`parent_pin_${userId}`);
    const savedLimit = localStorage.getItem(`daily_limit_${userId}`);
    const savedStats = localStorage.getItem(`usage_stats_${userId}`);

    if (!savedPin) {
      // First time setup - no PIN exists
      setIsLocked(false);
    }

    if (savedLimit) {
      setDailyLimit(parseInt(savedLimit));
    }

    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, [userId]);

  const handleUnlock = () => {
    const savedPin = localStorage.getItem(`parent_pin_${userId}`);
    
    if (pin === savedPin) {
      setIsLocked(false);
      setError('');
      setPin('');
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  const handleSetupPin = () => {
    if (newPin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    localStorage.setItem(`parent_pin_${userId}`, newPin);
    setNewPin('');
    setConfirmPin('');
    setError('');
    alert('✅ Parental PIN set successfully!');
  };

  const handleSaveSettings = () => {
    localStorage.setItem(`daily_limit_${userId}`, dailyLimit.toString());
    alert('✅ Settings saved successfully!');
  };

  const handleResetPin = () => {
    if (confirm('Are you sure you want to reset the parental PIN?')) {
      localStorage.removeItem(`parent_pin_${userId}`);
      setNewPin('');
      setConfirmPin('');
      alert('✅ PIN has been reset. You can set a new one.');
    }
  };

  const getRemainingTime = () => {
    const used = stats.totalMinutesToday;
    const remaining = Math.max(0, dailyLimit - used);
    return remaining;
  };

  const getUsagePercentage = () => {
    return Math.min(100, (stats.totalMinutesToday / dailyLimit) * 100);
  };

  if (isLocked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md border-2 border-purple-300 dark:border-purple-600">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-2xl">
              <span className="flex items-center gap-2">
                <Lock className="w-6 h-6 text-purple-500" />
                Parental Controls
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Enter Parental PIN to access controls
              </p>
              
              <div className="relative">
                <Input
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                  placeholder="Enter PIN"
                  className="text-center text-2xl tracking-widest font-mono h-14 pr-12"
                  maxLength={6}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>

              {error && (
                <p className="text-red-500 text-sm font-semibold">
                  {error}
                </p>
              )}

              <Button
                onClick={handleUnlock}
                disabled={pin.length < 4}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 h-12 text-lg font-bold rounded-xl"
              >
                <Unlock className="w-5 h-5 mr-2" />
                Unlock
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-auto overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b-2 border-purple-200 dark:border-purple-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Settings className="w-8 h-8 text-purple-500" />
              Parental Controls
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-full border-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex gap-2 px-6">
            <button
              onClick={() => setActiveTab('settings')}
              className={cn(
                "px-6 py-3 font-semibold transition-all relative",
                activeTab === 'settings'
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Settings
              {activeTab === 'settings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={cn(
                "px-6 py-3 font-semibold transition-all relative",
                activeTab === 'stats'
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Statistics
              {activeTab === 'stats' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Daily Time Limit */}
              <Card className="border-2 border-blue-300 dark:border-blue-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Daily Time Limit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Maximum minutes per day: {dailyLimit} minutes
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="120"
                      step="5"
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>10 min</span>
                      <span>120 min (2 hrs)</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      💡 Tip: The American Academy of Pediatrics recommends 1-2 hours of quality screen time per day for children ages 6+.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* PIN Management */}
              <Card className="border-2 border-purple-300 dark:border-purple-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Lock className="w-5 h-5 text-purple-500" />
                    PIN Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      New PIN (4-6 digits)
                    </label>
                    <Input
                      type="password"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter new PIN"
                      className="text-center text-xl tracking-widest font-mono"
                      maxLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Confirm PIN
                    </label>
                    <Input
                      type="password"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Confirm new PIN"
                      className="text-center text-xl tracking-widest font-mono"
                      maxLength={6}
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm font-semibold">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSetupPin}
                      disabled={!newPin || !confirmPin}
                      className="flex-1 bg-purple-500 hover:bg-purple-600"
                    >
                      Set New PIN
                    </Button>
                    <Button
                      onClick={handleResetPin}
                      variant="outline"
                      className="border-2 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Reset PIN
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <Button
                onClick={handleSaveSettings}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-emerald-500 hover:to-green-500 h-12 text-lg font-bold rounded-xl"
              >
                💾 Save All Settings
              </Button>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Usage Today */}
              <Card className="border-2 border-orange-300 dark:border-orange-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Today's Usage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.totalMinutesToday} <span className="text-lg text-gray-500">min</span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getRemainingTime()} minutes remaining
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">
                        {dailyLimit} <span className="text-sm text-gray-500">min limit</span>
                      </p>
                    </div>
                  </div>

                  <Progress value={getUsagePercentage()} className="h-4" />

                  {getUsagePercentage() >= 80 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                      <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                        ⚠️ Warning: Close to daily limit
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Learning Progress */}
              <Card className="border-2 border-green-300 dark:border-green-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.wordsLearned}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Words Learned</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                      <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {stats.storiesCompleted}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Stories Completed</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                      <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                        {stats.gamesPlayed}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Games Played</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {stats.totalMinutesWeek}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Minutes This Week</p>
                    </div>
                  </div>

                  <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Last Active: {new Date(stats.lastActive).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentalControls;

