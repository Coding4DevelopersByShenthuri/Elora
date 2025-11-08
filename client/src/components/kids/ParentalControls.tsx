import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Eye, EyeOff, Lock, Settings, Sparkles, Unlock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ParentalControlsAPI } from '@/services/ApiService';

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

const INITIAL_STATS: UsageStats = {
  totalMinutesToday: 0,
  totalMinutesWeek: 0,
  wordsLearned: 0,
  storiesCompleted: 0,
  gamesPlayed: 0,
  lastActive: new Date().toISOString(),
};

const ParentalControls = ({ userId, onClose }: ParentalControlsProps) => {
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(30);
  const [pinError, setPinError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'settings' | 'stats'>('settings');
  const [stats, setStats] = useState<UsageStats>(INITIAL_STATS);
  const [hasPin, setHasPin] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);

  const heroStyles = useMemo(
    () => ({
      background:
        'linear-gradient(135deg, hsl(var(--brunswick-green)) 0%, hsl(var(--primary-deep)) 55%, hsl(var(--dartmouth-green)) 100%)',
      borderColor: 'hsl(var(--primary-deep))',
    }),
    [],
  );

  const normalizeErrorMessage = useCallback((message?: string) => {
    if (!message) {
      return 'Unable to load parental controls right now. Please try again.';
    }

    const trimmed = message.trim();
    if (!trimmed) {
      return 'Unable to load parental controls right now. Please try again.';
    }

    if (trimmed.toLowerCase() === 'an error occurred') {
      return 'Unable to load parental controls right now. Please try again.';
    }

    return trimmed;
  }, []);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setGlobalError('');
    setSuccessMessage('');
    try {
      const authToken =
        typeof window !== 'undefined' ? window.localStorage.getItem('speakbee_auth_token') : null;

      if (!authToken || authToken === 'local-token') {
        setGlobalError('Parental controls require an online Elora account. Please sign in to continue.');
        setHasPin(false);
        setIsLocked(true);
        setStats(INITIAL_STATS);
        setIsLoading(false);
        return;
      }

      const response = await ParentalControlsAPI.getOverview();
      if (!response.success || !('data' in response)) {
        const fallbackMessage =
          ('message' in response && response.message) || 'Unable to connect to parental controls right now.';
        setGlobalError(normalizeErrorMessage(fallbackMessage));
        setHasPin(false);
        setIsLocked(false);
        setStats(INITIAL_STATS);
        return;
      }

      const settings = response.data?.settings ?? {};
      const remoteStats = response.data?.stats ?? {};

      const nextDailyLimit = Number(settings.daily_limit_minutes) || 30;
      setDailyLimit(nextDailyLimit);

      const nextHasPin = Boolean(settings.has_pin);
      setHasPin(nextHasPin);
      setIsLocked(nextHasPin);

      setStats({
        totalMinutesToday: remoteStats.totalMinutesToday ?? 0,
        totalMinutesWeek: remoteStats.totalMinutesWeek ?? 0,
        wordsLearned: remoteStats.wordsLearned ?? 0,
        storiesCompleted: remoteStats.storiesCompleted ?? 0,
        gamesPlayed: remoteStats.gamesPlayed ?? 0,
        lastActive: remoteStats.lastActive ?? new Date().toISOString(),
      });

      setPin('');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setPinError('');
    } catch (err) {
      if (!navigator.onLine) {
        setGlobalError('Internet connection required to manage parental controls. Please reconnect and try again.');
      } else {
        setGlobalError('Unable to load parental controls. Please check your connection and try again.');
      }
      setHasPin(false);
      setIsLocked(false);
      setStats(INITIAL_STATS);
    } finally {
      setIsLoading(false);
    }
  }, [normalizeErrorMessage]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview, userId]);

  const handleUnlock = async () => {
    if (!hasPin) {
      setIsLocked(false);
      setSuccessMessage('Parental controls are open.');
      return;
    }

    if (pin.length < 4) {
      setPinError('Please enter your 4-digit PIN.');
      return;
    }

    setPinError('');
    setGlobalError('');
    setSuccessMessage('');
    setIsUnlocking(true);

    try {
      const response = await ParentalControlsAPI.unlock(pin);
      if (!response.success || !('data' in response)) {
        const fallbackMessage =
          ('message' in response && response.message) || 'Unable to unlock controls. Please try again.';
        setPinError(normalizeErrorMessage(fallbackMessage));
        setPin('');
        return;
      }

      if (response.data?.unlocked) {
        setIsLocked(false);
        setSuccessMessage(
          (typeof response.data?.message === 'string' && response.data.message) || 'Controls unlocked.',
        );
        setCurrentPin(pin);
        setPin('');
      } else {
        setPinError(
          (typeof response.data?.message === 'string' && response.data.message) || 'Incorrect PIN. Please try again.',
        );
        setPin('');
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleSetupPin = async () => {
    if (newPin.length < 4) {
      setPinError('PIN must be at least 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }

    setPinError('');
    setGlobalError('');
    setSuccessMessage('');
    setIsUpdatingPin(true);

    try {
      const payload: {
        current_pin?: string;
        new_pin: string;
        confirm_pin: string;
        action: 'set';
      } = {
        new_pin: newPin,
        confirm_pin: confirmPin,
        action: 'set',
      };

      if (hasPin) {
        payload.current_pin = currentPin || pin;
      }

      const response = await ParentalControlsAPI.updatePin(payload);
      if (!response.success || !('data' in response)) {
        const fallbackMessage =
          ('message' in response && response.message) || 'Unable to save PIN. Please try again.';
        setPinError(normalizeErrorMessage(fallbackMessage));
        return;
      }

      const updatedSettings = response.data?.settings;
      const updatedHasPin = Boolean(updatedSettings?.has_pin ?? true);
      setHasPin(updatedHasPin);
      setIsLocked(false);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setPin('');
      setSuccessMessage(
        (typeof response.data?.message === 'string' && response.data.message) ||
          '✅ Parental PIN set successfully!',
      );
    } finally {
      setIsUpdatingPin(false);
    }
  };

  const handleSaveSettings = async () => {
    setGlobalError('');
    setPinError('');
    setSuccessMessage('');
    setIsSavingSettings(true);

    try {
      const response = await ParentalControlsAPI.updateSettings({
        daily_limit_minutes: dailyLimit,
      });

      if (!response.success || !('data' in response)) {
        const fallbackMessage =
          ('message' in response && response.message) || 'Unable to save settings. Please try again.';
        setGlobalError(normalizeErrorMessage(fallbackMessage));
        return;
      }

      const updatedSettings = response.data?.settings;
      if (updatedSettings?.daily_limit_minutes) {
        setDailyLimit(updatedSettings.daily_limit_minutes);
      }

      if (response.data?.settings?.has_pin !== undefined) {
        setHasPin(Boolean(response.data.settings.has_pin));
      }

      setSuccessMessage('✅ Settings saved successfully!');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleResetPin = async () => {
    if (!hasPin) {
      setSuccessMessage('No PIN is currently configured.');
      return;
    }

    const confirmReset = window.confirm('Are you sure you want to reset the parental PIN?');
    if (!confirmReset) {
      return;
    }

    setPinError('');
    setGlobalError('');
    setSuccessMessage('');
    setIsUpdatingPin(true);

    try {
      const response = await ParentalControlsAPI.updatePin({
        action: 'reset',
        current_pin: currentPin || pin,
      });

      if (!response.success || !('data' in response)) {
        const fallbackMessage =
          ('message' in response && response.message) || 'Unable to reset PIN. Please try again.';
        setPinError(normalizeErrorMessage(fallbackMessage));
        return;
      }

      setHasPin(false);
      setIsLocked(false);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setPin('');
      setSuccessMessage(
        (typeof response.data?.message === 'string' && response.data.message) ||
          '✅ PIN has been reset. You can set a new one.',
      );
    } finally {
      setIsUpdatingPin(false);
    }
  };

  const getRemainingTime = () => Math.max(0, dailyLimit - stats.totalMinutesToday);

  const usagePercentage = useMemo(() => {
    if (dailyLimit === 0) return 0;
    return Math.min(100, (stats.totalMinutesToday / dailyLimit) * 100);
  }, [stats.totalMinutesToday, dailyLimit]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="loader" aria-label="Loading parental controls" />
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-200/50 via-tertiary/40 to-sky-100/40 p-6 dark:from-slate-900 dark:via-slate-950 dark:to-emerald-950">
        <Card className="relative w-full max-w-lg overflow-hidden border border-primary/20 bg-card/80 text-slate-900 shadow-xl ring-1 ring-primary/20 backdrop-blur-xl dark:border-emerald-500/20 dark:bg-slate-900/70 dark:text-slate-50 dark:ring-emerald-400/20">
          <div className="absolute -top-32 right-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/20" />
          <div className="absolute -bottom-24 left-6 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl dark:bg-sky-500/15" />
          <CardHeader className="relative space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner dark:bg-emerald-500/20 dark:text-emerald-300">
                  <Lock className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Family mode
                  </p>
                  <CardTitle className="text-2xl font-semibold">Unlock Parental Controls</CardTitle>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-10 w-10 rounded-full border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-white hover:text-slate-700 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              Enter your secure PIN to review screen time, adjust limits, and celebrate learning wins. This
              keeps young explorers focused and families in control.
            </p>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <div className="relative">
              <Input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={(event) => event.key === 'Enter' && handleUnlock()}
                placeholder="••••"
                className="h-14 rounded-2xl border-none bg-slate-100 text-center text-2xl tracking-[0.6em] text-slate-900 shadow-inner focus-visible:ring-2 focus-visible:ring-emerald-400 dark:bg-slate-800 dark:text-slate-100"
                maxLength={6}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPin((prev) => !prev)}
                className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-white text-slate-500 shadow-sm transition hover:text-emerald-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-emerald-400"
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {globalError && (
              <div className="rounded-2xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
                ⚠️ {globalError}
              </div>
            )}
            {pinError && (
              <div className="rounded-2xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
                ⚠️ {pinError}
              </div>
            )}
            <Button
              onClick={handleUnlock}
              disabled={isUnlocking || pin.length < 4}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent text-base font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Unlock className={cn('h-4 w-4 transition-transform group-hover:scale-110', isUnlocking && 'animate-spin')} />
              {isUnlocking ? 'Unlocking…' : 'Unlock controls'}
            </Button>
            <p className="text-center text-xs text-slate-400">First time here? Set a new PIN after unlocking.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {globalError && (
        <div className="rounded-3xl border border-red-200/70 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-600 shadow-sm dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
          ⚠️ {globalError}
        </div>
      )}
      {!globalError && successMessage && (
        <div className="rounded-3xl border border-emerald-200/70 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
          {successMessage}
        </div>
      )}
      <section
        className="relative overflow-hidden rounded-3xl border p-6 text-primary-foreground shadow-xl backdrop-blur-lg"
        style={heroStyles}
      >
        <div className="absolute -top-12 right-12 hidden h-40 w-40 rounded-full bg-white/20 blur-3xl md:block" />
        <div className="absolute -bottom-16 left-10 hidden h-44 w-44 rounded-full bg-emerald-200/40 blur-3xl md:block" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
              <Sparkles className="h-3.5 w-3.5" />
              Guided oversight
            </div>
            <div>
              <h2 className="text-2xl font-semibold leading-tight text-white md:text-3xl lg:text-[34px]">
                Stay in sync with their progress
              </h2>
              <p className="mt-2 max-w-xl text-sm text-emerald-100/90 md:text-base">
                Review screen time, learning milestones, and adjust limits with just a few taps. Designed to
                keep families confident and kids inspired.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-emerald-50/90">
              <Badge className="rounded-full bg-white/20 px-3 py-1 text-white hover:bg-white/30">
                {stats.totalMinutesToday} mins today
              </Badge>
              <Badge className="rounded-full bg-white/20 px-3 py-1 text-white hover:bg-white/30">
                {stats.totalMinutesWeek} mins this week
              </Badge>
              <Badge className="rounded-full bg-white/20 px-3 py-1 text-white hover:bg-white/30">
                Limit • {dailyLimit} mins
              </Badge>
            </div>
          </div>
          <Card className="relative w-full max-w-sm border border-primary/10 bg-card/80 text-foreground shadow-lg backdrop-blur-sm dark:border-emerald-500/20 dark:bg-slate-900/70 dark:text-slate-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today’s screen time
              </CardTitle>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-semibold text-foreground">
                  {stats.totalMinutesToday}
                </span>
                <span className="pb-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  mins
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Usage</span>
                  <span>{Math.round(usagePercentage)}% of limit</span>
                </div>
                <Progress
                  value={Math.min(100, usagePercentage)}
                  className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-sky-500"
                />
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-emerald-50/80 px-4 py-3 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                <div>
                  {getRemainingTime()} minutes remaining
                  <p className="text-[10px] text-emerald-500/80 dark:text-emerald-200/80">Daily allowance</p>
                </div>
                <div className="text-right">
                  <p>{stats.totalMinutesWeek} min</p>
                  <p className="text-[10px] text-emerald-500/80 dark:text-emerald-200/80">This week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as typeof activeTab)}
        className="space-y-6"
      >
        <TabsList className="w-full justify-start gap-2 rounded-2xl bg-slate-100/70 p-1 dark:bg-slate-900/70">
          <TabsTrigger
            value="settings"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 transition data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-md dark:text-slate-300 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-emerald-300"
          >
            <Settings className="h-4 w-4" />
            Controls
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 transition data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-md dark:text-slate-300 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-emerald-300"
          >
            <BarChart3 className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="relative overflow-hidden rounded-3xl border border-primary/10 bg-card/80 shadow-sm backdrop-blur-sm dark:border-emerald-500/20 dark:bg-slate-900/70">
              <div className="absolute -right-16 top-1/2 hidden h-48 w-48 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-emerald-500/10 lg:block" />
              <CardHeader className="relative">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Daily time limit
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="rounded-full border-primary/30 text-xs text-primary dark:border-emerald-500/40 dark:text-emerald-300"
                  >
                    {dailyLimit} minutes / day
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Calibrate healthy screen time guidelines that flex with your family’s routine.
                </p>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="space-y-4">
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="5"
                    value={dailyLimit}
                    onChange={(event) => setDailyLimit(parseInt(event.target.value, 10))}
                    className="w-full appearance-none rounded-full bg-slate-200 dark:bg-slate-700"
                    style={{
                      background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--accent)) ${
                        ((dailyLimit - 10) / 110) * 100
                      }%, hsl(var(--muted)) ${((dailyLimit - 10) / 110) * 100}%, hsl(var(--muted)) 100%)`,
                      height: '10px',
                    }}
                  />
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    <span>10 min</span>
                    <span>120 min</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-primary/10 bg-card/70 px-4 py-4 text-sm text-muted-foreground shadow-sm dark:border-emerald-500/20 dark:bg-slate-800/60 dark:text-slate-300">
                  💡 The American Academy of Pediatrics recommends 1–2 hours of quality screen time per day for
                  learners aged 6+. Adjust as your child grows.
                </div>
              </CardContent>
            </Card>

            <Card className="grid gap-5 rounded-3xl border border-primary/10 bg-card/80 p-6 shadow-sm backdrop-blur-sm dark:border-emerald-500/20 dark:bg-slate-900/70">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    PIN management
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-primary/10 text-primary dark:bg-emerald-500/20 dark:text-emerald-300"
                  >
                    Secure
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Update or reset your private PIN to keep controls locked between sessions.
                </p>
              </div>
              <div className="grid gap-4 rounded-2xl border border-primary/10 p-4 dark:border-emerald-500/20">
                {hasPin && (
                  <>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Current PIN
                    </label>
                    <Input
                      type="password"
                      value={currentPin}
                      onChange={(event) => setCurrentPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter current PIN"
                      className="h-12 rounded-xl border-border bg-card/70 text-center text-lg tracking-[0.5em] focus-visible:ring-primary"
                      maxLength={6}
                    />
                  </>
                )}
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  New PIN
                </label>
                <Input
                  type="password"
                  value={newPin}
                  onChange={(event) => setNewPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 4–6 digits"
                  className="h-12 rounded-xl border-border bg-card/70 text-center text-lg tracking-[0.5em] focus-visible:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  maxLength={6}
                />
                <Input
                  type="password"
                  value={confirmPin}
                  onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Confirm PIN"
                  className="h-12 rounded-xl border-border bg-card/70 text-center text-lg tracking-[0.5em] focus-visible:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  maxLength={6}
                />
                {pinError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                    ⚠️ {pinError}
                  </div>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    onClick={handleSetupPin}
                    disabled={isUpdatingPin || !newPin || !confirmPin}
                    className="flex-1 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUpdatingPin ? 'Saving…' : 'Save new PIN'}
                  </Button>
                  <Button
                    onClick={handleResetPin}
                    variant="outline"
                    disabled={isUpdatingPin}
                    className="flex-1 rounded-xl border-red-200 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
                  >
                    {isUpdatingPin ? 'Updating…' : 'Reset PIN'}
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-sm font-semibold text-primary-foreground shadow-md transition hover:from-primary/90 hover:to-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingSettings ? 'Saving…' : 'Save control settings'}
              </Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-3xl border border-primary/10 bg-card/80 shadow-sm backdrop-blur-sm dark:border-emerald-500/20 dark:bg-slate-900/70">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      Daily overview
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Track today’s activity at a glance.
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-full border-primary/30 text-xs text-primary dark:border-sky-500/40 dark:text-sky-300"
                  >
                    {new Date(stats.lastActive).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 rounded-2xl border border-primary/10 p-5 dark:border-emerald-500/20">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Time spent</span>
                    <span className="font-semibold text-foreground">
                      {stats.totalMinutesToday} minutes
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, usagePercentage)}
                    className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-sky-500"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Time remaining</span>
                    <span>{getRemainingTime()} minutes</span>
                  </div>
                </div>
                <div className="grid gap-3 rounded-2xl border border-primary/10 p-4 text-sm text-muted-foreground dark:border-emerald-500/20 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Daily limit</span>
                    <span className="font-semibold text-foreground">{dailyLimit} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Week total</span>
                    <span className="font-semibold text-foreground">
                      {stats.totalMinutesWeek} minutes
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-primary/10 bg-card/80 shadow-sm backdrop-blur-sm dark:border-emerald-500/20 dark:bg-slate-900/70">
              <CardHeader className="space-y-3">
                <CardTitle className="text-lg font-semibold text-foreground">
                  Learning milestones
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Celebrate progress built through stories, vocabulary, and games.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      label: 'Words learned',
                      value: stats.wordsLearned,
                      accent: 'from-blue-500/10 to-cyan-500/10 dark:from-blue-500/15 dark:to-cyan-500/10',
                    },
                    {
                      label: 'Stories completed',
                      value: stats.storiesCompleted,
                      accent: 'from-purple-500/10 to-pink-500/10 dark:from-purple-500/15 dark:to-pink-500/10',
                    },
                    {
                      label: 'Games played',
                      value: stats.gamesPlayed,
                      accent: 'from-amber-500/10 to-orange-500/10 dark:from-amber-500/15 dark:to-orange-500/10',
                    },
                    {
                      label: 'Minutes this week',
                      value: stats.totalMinutesWeek,
                      accent: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/15 dark:to-teal-500/10',
                    },
                  ].map((tile) => (
                    <div
                      key={tile.label}
                      className={cn(
                        'space-y-2 rounded-2xl border border-primary/10 p-4 transition hover:shadow-md dark:border-emerald-500/20',
                        `bg-gradient-to-br ${tile.accent}`,
                      )}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {tile.label}
                      </p>
                      <p className="text-2xl font-semibold text-foreground">{tile.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl border border-primary/10 bg-card/70 px-4 py-4 text-xs font-medium text-muted-foreground shadow-sm dark:border-emerald-500/20 dark:bg-slate-800/60 dark:text-slate-300">
                  Last active: {new Date(stats.lastActive).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParentalControls;

