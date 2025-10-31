import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Award, ArrowLeft, Download, Loader2, Share2, Printer } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import KidsApi from '@/services/KidsApi';
import KidsProgressService from '@/services/KidsProgressService';
import CertificatesService, { type CertificateLayout } from '@/services/CertificatesService';
import StorageService from '@/services/StorageService';

type CertificateSpec = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  criteria: (ctx: any) => { progress: number; eligible: boolean; hint: string };
  badgeSrc?: string;
};

const CertificatesPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);
  const [localKidsProgress, setLocalKidsProgress] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'certs' | 'badges' | 'trophies'>('certs');
  const [generatingCertId, setGeneratingCertId] = useState<string | null>(null);
  const [reportedTrophies, setReportedTrophies] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem('speakbee_unlocked_trophies_v2');
      if (raw) return JSON.parse(raw) as Record<string, string>;
      // Backward compat: migrate from Set store
      const legacy = localStorage.getItem('speakbee_unlocked_trophies');
      const legacyArr = legacy ? (JSON.parse(legacy) as string[]) : [];
      const migrated: Record<string, string> = {};
      legacyArr.forEach(id => { migrated[id] = new Date().toISOString(); });
      if (legacyArr.length) localStorage.setItem('speakbee_unlocked_trophies_v2', JSON.stringify(migrated));
      return migrated;
    } catch {
      return {};
    }
  });
  const [pendingUnlocks, setPendingUnlocks] = useState<{ id: string; title: string; date: string }[]>(() => {
    try {
      const raw = localStorage.getItem('speakbee_pending_trophy_unlocks');
      return raw ? (JSON.parse(raw) as { id: string; title: string; date: string }[]) : [];
    } catch { return []; }
  });
  const unlockDebounceRef = useState<{ timer: any | null }>({ timer: null })[0];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('speakbee_auth_token');
        const userData = localStorage.getItem('speakbee_current_user');
        const userId = userData ? (JSON.parse(userData)?.id || 'anonymous') : 'anonymous';
        // Always load local kids progress as fallback for certificate criteria
        try {
          const local = await KidsProgressService.get(userId);
          setLocalKidsProgress(local);
        } catch (_) {}
        if (isAuthenticated && token && token !== 'local-token') {
          const [pg, ach] = await Promise.all([
            KidsApi.getProgress(token),
            (KidsApi as any).getAchievements(token)
          ]);
          setProgress(pg);
          if (Array.isArray(ach)) setAchievements(ach);
        }
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, [isAuthenticated]);

  const mergedDetails = (() => {
    const serverDetails = (progress as any)?.details || {};
    const localDetails = localKidsProgress ? {
      readAloud: localKidsProgress.readAloud,
      vocabulary: localKidsProgress.vocabulary,
      pronunciation: localKidsProgress.pronunciation,
      storyEnrollments: localKidsProgress.storyEnrollments || []
    } : {};
    return {
      ...serverDetails,
      readAloud: serverDetails.readAloud || localDetails.readAloud || {},
      vocabulary: serverDetails.vocabulary || localDetails.vocabulary || {},
      pronunciation: serverDetails.pronunciation || localDetails.pronunciation || {},
      storyEnrollments: (serverDetails.storyEnrollments || localDetails.storyEnrollments || []) as any[]
    };
  })();

  const ctx = {
    points: (progress as any)?.points ?? 0,
    streak: (progress as any)?.streak ?? 0,
    details: mergedDetails,
    achievements
  };

  const certificates: CertificateSpec[] = [
    {
      id: 'story-time-champion',
      title: 'Story Time Champion',
      emoji: '📚',
      badgeSrc: '/story-time-champion-badge.png',
      description: 'Complete 10 stories',
      criteria: (c) => {
        // Count from readAloud attempts
        const readAloud = c.details?.readAloud || {};
        const readAloudCount = Object.keys(readAloud).length;

        // Count from storyEnrollments (completed stories)
        const storyEnrollments = (c.details?.storyEnrollments || []) as any[];
        const completedStories = storyEnrollments.filter((s: any) => s.completed === true).length;

        // Use the maximum count from either source
        const total = Math.max(readAloudCount, completedStories);

        const progress = Math.min(100, Math.round((Math.min(total, 10) / 10) * 100));
        const eligible = total >= 10;
        const hint = eligible ? 'Ready to download!' : `Stories: ${Math.min(total, 10)}/10 (${completedStories} completed)`;
        return { progress, eligible, hint };
      }
    },
    {
      id: 'speaking-star',
      title: 'Speaking Star',
      emoji: '🎤',
      badgeSrc: '/Speaking_star_badge.png',
      description: '50 Speak & Repeat sessions with average ≥ 75',
      criteria: (c) => {
        const pron = c.details?.pronunciation || {};
        const sessions = Object.values(pron) as any[];
        const total = sessions.reduce((s: number, r: any) => s + (r.attempts || 0), 0);
        const avg = sessions.length ? (sessions.reduce((s: number, r: any) => s + (r.bestScore || 0), 0) / sessions.length) : 0;
        const progress = Math.min(100, Math.round(((Math.min(total, 50) / 50) * 50) + (Math.min(avg, 100) / 2)));
        const eligible = total >= 50 && avg >= 75;
        const hint = eligible ? 'Ready to download!' : `Sessions: ${Math.min(total, 50)}/50, Avg: ${avg.toFixed(0)}%`;
        return { progress, eligible, hint };
      }
    },
    {
      id: 'word-wizard',
      title: 'Word Wizard',
      emoji: '🪄',
      badgeSrc: '/Word_wizard_badge.png',
      description: 'Master 100 unique words (≥ 2 practices each)',
      criteria: (c) => {
        const vocab = c.details?.vocabulary || {};
        const practiced = Object.values(vocab) as any[];
        const mastered = practiced.filter((r: any) => (r.attempts || 0) >= 2).length;
        const progress = Math.min(100, Math.round((Math.min(mastered, 100) / 100) * 100));
        const eligible = mastered >= 100;
        const hint = eligible ? 'Ready to download!' : `Mastered: ${mastered}/100`;
        return { progress, eligible, hint };
      }
    },
    {
      id: 'consistency-hero',
      title: 'Consistency Hero',
      emoji: '🔥',
      badgeSrc: '/Consistancy_badge.png',
      description: 'Maintain a 21-day learning streak',
      criteria: (c) => {
        const streak = c.streak || 0;
        const progress = Math.min(100, Math.round((Math.min(streak, 21) / 21) * 100));
        const eligible = streak >= 21;
        const hint = eligible ? 'Ready to download!' : `Streak: ${Math.min(streak, 21)}/21 days`;
        return { progress, eligible, hint };
      }
    },
    {
      id: 'super-learner',
      title: 'Super Learner',
      emoji: '🏆',
      badgeSrc: '/Super_Learner.png',
      description: 'Unlock any 3 certificates',
      criteria: (_c) => {
        // Will be computed after other certificates
        return { progress: 0, eligible: false, hint: '' };
      }
    }
  ];

  // Compute eligibility for first 4 certificates
  const computed = certificates.map((spec) => spec.criteria(ctx));
  
  // Compute Super Learner based on other certificates
  const earnedCount = computed.slice(0, 4).filter(c => c.eligible).length;
  const superProgress = Math.min(100, Math.round((Math.min(earnedCount, 3) / 3) * 100));
  const superEligible = earnedCount >= 3;

  // Update Super Learner result
  computed[4] = { 
    progress: superProgress, 
    eligible: superEligible, 
    hint: superEligible ? 'Ready to download!' : `Certificates: ${Math.min(earnedCount, 3)}/3` 
  };

  // Derive badges and trophies lists similar to Microsoft Learn layout
  // If Story Time Champion is eligible, surface its badge in Badges section
  const unlockedBadges = useMemo(() => {
    const base = (achievements || []).filter((a: any) => a.unlocked);
    try {
      const idx = certificates.findIndex(c => c.id === 'story-time-champion');
      if (idx >= 0 && computed[idx]?.eligible) {
        const stc = certificates[idx] as any;
        base.unshift({
          id: 'badge-story-time-champion',
          title: stc.title,
          name: stc.title,
          unlocked: true,
          unlocked_at: new Date().toISOString(),
          image: stc.badgeSrc || '/story-time-champion-badge.png'
        });
      }
    } catch (_) {}
    return base;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievements, computed.map(c => c.eligible).join('|')]);
  const lockedBadges = useMemo(() => (achievements || []).filter((a: any) => !a.unlocked), [achievements]);
  const trophySpecs = [
    { id: 'consistency-hero', title: 'Consistency Hero', emoji: '🔥', desc: 'Maintain a 21-day learning streak', badgeSrc: '/Consistency_badge.png' },
    { id: 'story-master', title: 'Story Master', emoji: '📖', desc: 'All 10 young stories at ≥80', badgeSrc: '/story-time-champion-badge.png' },
    { id: 'pronunciation-pro', title: 'Pronunciation Pro', emoji: '🎙️', desc: '100 pron attempts, avg ≥80', badgeSrc: '/Speaking_star_badge.png' },
    { id: 'vocab-builder', title: 'Vocabulary Builder', emoji: '🧠', desc: 'Learn 150 unique words', badgeSrc: '/Word_wizard_badge.png' },
    { id: 'super-learner', title: 'Super Learner', emoji: '🏆', desc: 'Unlock any 3 certificates', badgeSrc: '/Super_Learner.png' },
    { id: 'explorer', title: 'Explorer Trophy', emoji: '🗺️', desc: 'Try all games + 300 pts' }
  ];

  const computeTrophyProgress = (t: { id: string }) => {
    const d = ctx.details || {};
    if (t.id === 'consistency-hero') {
      const streak = ctx.streak || 0;
      return Math.round((Math.min(streak, 21) / 21) * 100);
    }
    if (t.id === 'story-master') {
      const readAloud = d.readAloud || {};
      const keys = Object.keys(readAloud);
      const scores80 = keys.filter(k => (readAloud[k]?.bestScore || 0) >= 80);
      const completed10 = Math.min(scores80.length, 10);
      return Math.round((completed10 / 10) * 100);
    }
    if (t.id === 'pronunciation-pro') {
      const pron = d.pronunciation || {};
      const vals = Object.values(pron) as any[];
      const attempts = vals.reduce((s, r) => s + (r.attempts || 0), 0);
      const avg = vals.length ? (vals.reduce((s, r) => s + (r.bestScore || 0), 0) / vals.length) : 0;
      // Strict thresholds: attempts >= 100 AND avg >= 80 to unlock
      const attemptsPct = Math.min(attempts, 100) / 100; // 0..1
      const avgTo80Pct = Math.min(Math.max(avg, 0), 80) / 80; // reach 1.0 at 80
      return Math.round(Math.min(attemptsPct, avgTo80Pct) * 100);
    }
    if (t.id === 'vocab-builder') {
      const vocab = d.vocabulary || {};
      const unique = Object.keys(vocab).length;
      return Math.round((Math.min(unique, 150) / 150) * 100);
    }
    if (t.id === 'super-learner') {
      const earned = earnedCount;
      return Math.round((Math.min(earned, 3) / 3) * 100);
    }
    if (t.id === 'explorer') {
      const games = d.games || {};
      const tried = Array.isArray(games.types) ? new Set(games.types).size : 0; // expect ['tongue-twister','word-chain',...]
      const points = Number(games.points || 0);
      const aPart = Math.min(tried, 5) / 5; // assume 5 game types
      const bPart = Math.min(points, 300) / 300;
      return Math.round((aPart * 50 + bPart * 50) * 100);
    }
    return 0;
  };

  const getTrophyHint = (t: { id: string }) => {
    const d = ctx.details || {};
    if (t.id === 'consistency-hero') {
      const streak = ctx.streak || 0;
      return `Streak: ${Math.min(streak, 21)}/21 days`;
    }
    if (t.id === 'story-master') {
      const readAloud = d.readAloud || {};
      const keys = Object.keys(readAloud);
      const scores80 = keys.filter(k => (readAloud[k]?.bestScore || 0) >= 80);
      const completed10 = Math.min(scores80.length, 10);
      return `Stories ≥80: ${completed10}/10`;
    }
    if (t.id === 'pronunciation-pro') {
      const pron = d.pronunciation || {};
      const vals = Object.values(pron) as any[];
      const attempts = vals.reduce((s, r) => s + (r.attempts || 0), 0);
      const avg = vals.length ? (vals.reduce((s, r) => s + (r.bestScore || 0), 0) / vals.length) : 0;
      return `Attempts: ${Math.min(attempts, 100)}/100, Avg: ${avg.toFixed(0)}%`;
    }
    if (t.id === 'vocab-builder') {
      const vocab = d.vocabulary || {};
      const unique = Object.keys(vocab).length;
      return `Words: ${Math.min(unique, 150)}/150`;
    }
    if (t.id === 'super-learner') {
      return `Certificates: ${Math.min(earnedCount, 3)}/3`;
    }
    if (t.id === 'explorer') {
      const games = d.games || {};
      const tried = Array.isArray(games.types) ? new Set(games.types).size : 0;
      const points = Number(games.points || 0);
      return `Games tried: ${Math.min(tried, 5)}/5, Points: ${Math.min(points, 300)}/300`;
    }
    return '';
  };

  // Memoize progress and hints maps per render for performance
  const trophyProgressMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of trophySpecs) {
      map[t.id] = computeTrophyProgress(t as any);
    }
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.streak, ctx.points, mergedDetails, earnedCount, trophySpecs.map(t => t.id).join('|')]);
  const trophyHintMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of trophySpecs) {
      map[t.id] = getTrophyHint(t as any);
    }
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.streak, ctx.points, mergedDetails, earnedCount, trophySpecs.map(t => t.id).join('|')]);

  const defaultLayout: CertificateLayout = {
    // No templatePath needed; styled backgrounds are drawn in code
    style: 'kids',
    titleText: 'Super Star Certificate',
    subtitleText: 'Awarded to',
    namePosition: { x: 1120, y: 620 },
    datePosition: { x: 1120, y: 760 },
    nameFont: 'bold 64px system-ui, sans-serif',
    dateFont: '500 28px system-ui, sans-serif',
    nameColor: '#0f172a',
    dateColor: '#1f2937'
  };

  const layoutByCert: Record<string, CertificateLayout> = {
    'story-time-champion': {
      // Use custom template image for Story Time Champion
      templatePath: (import.meta as any).env.VITE_STORY_CERT_TEMPLATE_URL || '/story-time-champion-template.png',
      // Fine-tuned positions for your template:
      // Name - moved down more (increased y significantly)
      namePositionRel: { x: 0.5, y: 0.52 },
      // Issued Date - moved up more (decreased y further)
      datePositionRel: { x: 0.72, y: 0.75 },
      nameFont: '700 56px system-ui, sans-serif',
      dateFont: '700 28px system-ui, sans-serif',
      nameColor: '#111827',
      dateColor: '#111827'
    },
    'speaking-star': {
      // Use custom template image for Speaking Star
      templatePath: (import.meta as any).env.VITE_SPEAKING_STAR_TEMPLATE_URL || '/Speaking_Star_Template.png',
      // Positions tuned for the provided template
      namePositionRel: { x: 0.5, y: 0.56 },
      datePositionRel: { x: 0.70, y: 0.78 },
      nameFont: '700 56px system-ui, sans-serif',
      dateFont: '700 28px system-ui, sans-serif',
      nameColor: '#111827',
      dateColor: '#111827'
    },
    'word-wizard': {
      // Use custom template image for Word Wizard
      templatePath: (import.meta as any).env.VITE_WORD_WIZARD_TEMPLATE_URL || '/Word Wizard_Template.png',
      // Positions tuned for the provided template
      namePositionRel: { x: 0.5, y: 0.56 },
      datePositionRel: { x: 0.70, y: 0.78 },
      nameFont: '700 56px system-ui, sans-serif',
      dateFont: '700 28px system-ui, sans-serif',
      nameColor: '#111827',
      dateColor: '#111827'
    },
    'consistency-hero': {
      // Use custom template image for Consistency Hero
      templatePath: (import.meta as any).env.VITE_CONSISTENCY_HERO_TEMPLATE_URL || '/Consistency Hero_Template.png',
      // Positions tuned for the provided template
      namePositionRel: { x: 0.5, y: 0.56 },
      datePositionRel: { x: 0.70, y: 0.78 },
      nameFont: '700 56px system-ui, sans-serif',
      dateFont: '700 28px system-ui, sans-serif',
      nameColor: '#111827',
      dateColor: '#111827',
      titleText: 'Consistency Hero',
    },
    // Showcase a professional look for this one
    'super-learner': {
      // Use custom template image for Super Learner
      templatePath: (import.meta as any).env.VITE_SUPER_LEARNER_TEMPLATE_URL || '/Super_Learner_Template.png',
      // Positions tuned for the provided template
      namePositionRel: { x: 0.5, y: 0.56 },
      datePositionRel: { x: 0.70, y: 0.78 },
      nameFont: '700 60px system-ui, sans-serif',
      dateFont: '500 26px system-ui, sans-serif',
      nameColor: '#111827',
      dateColor: '#374151'
    }
  };

  // Persist newly unlocked trophies (once per trophy)
  // Process trophy unlocks with debounce + offline queue
  useEffect(() => {
    if (activeTab !== 'trophies') return;
    if (unlockDebounceRef.timer) clearTimeout(unlockDebounceRef.timer);
    unlockDebounceRef.timer = setTimeout(() => {
      try {
        const token = localStorage.getItem('speakbee_auth_token');
        const isOnline = token && token !== 'local-token';

        const newlyUnlocked: { id: string; title: string; date: string }[] = [];
        for (const t of trophySpecs) {
          const progressPct = trophyProgressMap[t.id] ?? 0;
          if (progressPct === 100 && !reportedTrophies[t.id]) {
            newlyUnlocked.push({ id: t.id, title: t.title, date: new Date().toISOString() });
          }
        }

        if (newlyUnlocked.length) {
          // Update local unlocked registry with dates
          const updated = { ...reportedTrophies } as Record<string, string>;
          newlyUnlocked.forEach(item => { updated[item.id] = item.date; });
          setReportedTrophies(updated);
          try { localStorage.setItem('speakbee_unlocked_trophies_v2', JSON.stringify(updated)); } catch {}

          // Queue unlocks if offline or send immediately if online
          if (!isOnline) {
            const queued = [...pendingUnlocks, ...newlyUnlocked];
            setPendingUnlocks(queued);
            try { localStorage.setItem('speakbee_pending_trophy_unlocks', JSON.stringify(queued)); } catch {}
          } else {
            newlyUnlocked.forEach(item => {
              KidsApi.unlockTrophy(token as string, { trophy_id: item.id, title: item.title })
                .catch(() => {
                  // Keep for retry on failure
                  const queued = [...pendingUnlocks, item];
                  setPendingUnlocks(queued);
                  try { localStorage.setItem('speakbee_pending_trophy_unlocks', JSON.stringify(queued)); } catch {}
                  toast({ title: 'Will retry later', description: `${item.title} unlock will sync when online.` });
                });
            });
          }
        }
      } catch {}
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, trophyProgressMap, trophySpecs.map(t => t.id).join('|')]);

  // Retry pending unlocks when coming online or when tab visible
  useEffect(() => {
    const handler = async () => {
      const token = localStorage.getItem('speakbee_auth_token');
      const isOnline = token && token !== 'local-token';
      if (!isOnline || pendingUnlocks.length === 0) return;
      const remaining: { id: string; title: string; date: string }[] = [];
      for (const item of pendingUnlocks) {
        try {
          await KidsApi.unlockTrophy(token as string, { trophy_id: item.id, title: item.title });
        } catch {
          remaining.push(item);
        }
      }
      setPendingUnlocks(remaining);
      try { localStorage.setItem('speakbee_pending_trophy_unlocks', JSON.stringify(remaining)); } catch {}
    };
    window.addEventListener('online', handler);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') handler(); });
    handler();
    return () => {
      window.removeEventListener('online', handler);
    };
  }, [pendingUnlocks]);

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 container mx-auto px-3 sm:px-4 max-w-7xl">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" className="rounded-xl" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#118AB2] bg-clip-text text-transparent">
          Your Certificates
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2">
          Keep learning to unlock and download your certificates!
        </p>
      </div>

      {/* Top counts like Microsoft Learn */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
        <div className="px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-900/40 border">
          <div className="text-xs text-gray-500">Badges</div>
          <div className="text-xl font-extrabold text-gray-800 dark:text-white">{unlockedBadges.length}</div>
        </div>
        <div className="px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-900/40 border">
          <div className="text-xs text-gray-500">Trophies</div>
          <div className="text-xl font-extrabold text-gray-800 dark:text-white">{trophySpecs.length}</div>
        </div>
        <div className="px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-900/40 border">
          <div className="text-xs text-gray-500">Level</div>
          <div className="text-xl font-extrabold text-gray-800 dark:text-white">{Math.max(1, Math.floor((ctx.points || 0) / 5000))}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        <Button variant={activeTab==='certs'?'default':'outline'} className="rounded-xl" onClick={() => setActiveTab('certs')}>Certificates</Button>
        <Button variant={activeTab==='badges'?'default':'outline'} className="rounded-xl" onClick={() => setActiveTab('badges')}>Badges</Button>
        <Button variant={activeTab==='trophies'?'default':'outline'} className="rounded-xl" onClick={() => setActiveTab('trophies')}>Trophies</Button>
        {/* Style controls temporarily removed */}
      </div>

      {activeTab === 'certs' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="border-2 rounded-2xl bg-white/60 dark:bg-gray-900/30 p-5 animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="flex gap-2">
                <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))}
          {certificates.map((spec, idx) => (
            <Card key={spec.id} className="border-2 rounded-2xl bg-white/80 dark:bg-gray-900/40 transition-shadow hover:shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-extrabold text-gray-800 dark:text-white">
                    {spec.badgeSrc ? (
                      <img
                        src={spec.badgeSrc}
                        alt={`${spec.title} badge`}
                        className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
                      />
                    ) : (
                      <span className="text-xl sm:text-2xl">{spec.emoji}</span>
                    )}
                    <span
                      className={`text-sm sm:text-base ${spec.id === 'story-time-champion' ? 'cursor-pointer hover:underline' : ''}`}
                      onClick={spec.id === 'story-time-champion' ? () => navigate('/kids/young') : undefined}
                    >
                      {spec.title}
                    </span>
                  </div>
                  {computed[idx].eligible ? (
                    <Crown className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Award className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3">{spec.description}</p>
                <div className="w-full h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4]"
                    style={{ width: `${computed[idx].progress}%` }}
                  />
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300 mb-3">
                  {computed[idx].hint}
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Button
                    aria-busy={generatingCertId === spec.id}
                    disabled={!computed[idx].eligible || loading || generatingCertId === spec.id}
                    className="rounded-xl w-full sm:w-auto"
                    onClick={async () => {
                      const certId = spec.id;
                      setGeneratingCertId(certId);
                      
                      try {
                      const userData = localStorage.getItem('speakbee_current_user');
                      const userName = userData ? (JSON.parse(userData)?.name || 'Little Learner') : 'Little Learner';
                        const userId = userData ? (JSON.parse(userData)?.id || 'anonymous') : 'anonymous';
                        const token = localStorage.getItem('speakbee_auth_token');
                        const isOnline = token && token !== 'local-token';

                        // Generate certificate PNG
                      const baseLayout = layoutByCert[spec.id] || defaultLayout;
                      const layout = baseLayout;
                      const png = await CertificatesService.generatePNG(layout, userName, new Date());

                        // Upload to storage if online and Supabase configured
                        let fileUrl: string | undefined;
                        let uploadedFilePath: string | undefined;
                        const isSupabaseConfigured = StorageService.isSupabaseConfigured();
                        
                        if (isOnline && isSupabaseConfigured) {
                          try {
                            const uploadResult = await StorageService.uploadCertificateBlob(png, `${spec.id}-${Date.now()}.png`, userId);
                            fileUrl = uploadResult.publicUrl;
                            uploadedFilePath = uploadResult.path;
                            console.log('Certificate uploaded to storage:', fileUrl);
                          } catch (uploadError: any) {
                            console.warn('Failed to upload certificate to storage:', uploadError);
                            toast({
                              title: 'Upload Failed',
                              description: 'Certificate downloaded locally, but cloud upload failed. Please check your internet connection.',
                              variant: 'destructive',
                            });
                            // Continue with download even if upload fails
                          }
                        } else if (isOnline && !isSupabaseConfigured) {
                          console.warn('Supabase not configured - skipping certificate upload');
                          toast({
                            title: 'Cloud Storage Unavailable',
                            description: 'Certificate downloaded locally, but cloud storage is not configured.',
                          });
                        }

                        // Download PDF
                      await CertificatesService.generateAndDownloadPDF(png, `${spec.id}.pdf`);

                        // Record certificate in database
                        if (isOnline) {
                          try {
                            await KidsApi.issueCertificate(token, { 
                              cert_id: spec.id, 
                              title: spec.title,
                              file_url: fileUrl 
                            });
                            
                            toast({
                              title: 'Certificate Generated! 🎉',
                              description: fileUrl 
                                ? 'Your certificate has been downloaded and saved to the cloud.'
                                : 'Your certificate has been downloaded.',
                            });
                          } catch (apiError: any) {
                            console.error('Failed to record certificate:', apiError);
                            
                            // Rollback: Delete uploaded file if API call failed
                            if (fileUrl && uploadedFilePath && isSupabaseConfigured) {
                              try {
                                await StorageService.deleteFile(uploadedFilePath);
                                console.log('Rollback: Deleted orphaned certificate file from storage');
                              } catch (deleteError) {
                                console.error('Failed to delete orphaned file during rollback:', deleteError);
                                // Log but don't throw - file remains but at least we tried
                              }
                            }
                            
                            toast({
                              title: 'Certificate Downloaded',
                              description: 'Certificate downloaded, but could not be saved to your account. You may need to sign in again.',
                              variant: 'destructive',
                            });
                          }
                        } else {
                          toast({
                            title: 'Certificate Downloaded! 📄',
                            description: 'Sign in to save your certificate to the cloud.',
                          });
                        }
                      } catch (error: any) {
                        console.error('Certificate generation failed:', error);
                        toast({
                          title: 'Generation Failed',
                          description: error.message || 'Failed to generate certificate. Please try again.',
                          variant: 'destructive',
                        });
                      } finally {
                        setGeneratingCertId(null);
                      }
                    }}
                  >
                    {generatingCertId === spec.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                    <Download className="w-4 h-4 mr-2" /> Download
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl w-full sm:w-auto"
                    onClick={() => navigate('/kids/young')}
                  >
                     Improve Progress
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {unlockedBadges.map((b: any, i: number) => (
            <Card key={`${b.id || i}`} className="border rounded-xl bg-white/80 dark:bg-gray-900/40 shadow-sm hover:shadow-md transition">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 p-2 flex items-center justify-center">
                    {b.image ? (
                      <img
                        src={b.image}
                        alt={b.title || b.name || 'Badge'}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-3xl sm:text-4xl">🏅</div>
                    )}
                    </div>
                    <div className="min-w-0 flex-1">
                    <div className="text-[10px] tracking-widest font-semibold text-[#2563EB] dark:text-[#60A5FA] uppercase mb-1">Badge</div>
                    <div
                      className={`text-sm sm:text-base font-semibold text-gray-800 dark:text-white leading-snug line-clamp-2 ${(b.title || b.name) === 'Story Time Champion' ? 'cursor-pointer hover:underline' : ''}`}
                      onClick={(b.title || b.name) === 'Story Time Champion' ? () => navigate('/kids/young') : undefined}
                    >
                      {b.title || b.name || 'Badge'}
                    </div>
                    {!!b.unlocked_at && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Completed on {new Date(b.unlocked_at).toLocaleDateString()}
                      </div>
                    )}
                    </div>
                  </div>
                  <div className="ml-2 flex items-start gap-2">
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 rounded-full"
                      title="Share"
                      onClick={async () => {
                        const shareUrl = b.image || window.location.href;
                        const shareTitle = b.title || b.name || 'Badge';
                        try {
                          if (navigator.share) {
                            await navigator.share({ title: shareTitle, url: shareUrl });
                          } else if (navigator.clipboard) {
                            await navigator.clipboard.writeText(shareUrl);
                            toast({ title: 'Link copied', description: 'Badge link copied to clipboard.' });
                          }
                        } catch (_) {
                          try {
                            await navigator.clipboard.writeText(shareUrl);
                            toast({ title: 'Link copied', description: 'Badge link copied to clipboard.' });
                          } catch {}
                        }
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 rounded-full"
                      title="Print"
                      onClick={() => {
                        const img = b.image;
                        if (!img) {
                          window.print();
                          return;
                        }
                        const w = window.open('', '_blank', 'noopener,noreferrer,width=800,height=600');
                        if (!w) return;
                        w.document.write(`<!doctype html><html><head><title>Print Badge</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;background:#fff}</style></head><body><img src="${img}" style="max-width:90vw;max-height:90vh;" onload="window.focus();window.print();" /></body></html>`);
                        w.document.close();
                      }}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {lockedBadges.length === 0 && unlockedBadges.length === 0 && (
            <div className="col-span-full text-center text-sm text-gray-500">No badges yet. Start learning to unlock badges!</div>
          )}
        </div>
      )}

      {activeTab === 'trophies' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {trophySpecs.map((t: any) => (
            <Card key={t.id} className="border rounded-xl bg-white/80 dark:bg-gray-900/40">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-extrabold text-gray-800 dark:text-white">
                    {t.badgeSrc ? (
                      <img src={t.badgeSrc} alt={`${t.title} trophy badge`} className="w-7 h-7 object-contain" onError={(e) => { const el = e.currentTarget as HTMLImageElement; if (el.src.endsWith('/Consistency_badge.png')) el.src = '/Consistancy_badge.png'; }} />
                    ) : (
                      <span className="text-2xl">{t.emoji}</span>
                    )}
                    <span
                      className={t.id === 'story-master' ? 'cursor-pointer hover:underline' : ''}
                      onClick={t.id === 'story-master' ? () => navigate('/kids/young') : undefined}
                    >
                      {t.title}
                    </span>
                  </div>
                  {trophyProgressMap[t.id] === 100 ? (
                    <Crown className="w-5 h-5 text-yellow-500" aria-label="Unlocked" />
                  ) : (
                    <Award className="w-5 h-5 text-gray-400" aria-label="Locked" />
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">{t.desc}</div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${trophyProgressMap[t.id] ?? 0}%` }} />
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300 mt-2">
                  {trophyHintMap[t.id]}
                </div>
                {reportedTrophies[t.id] && (
                  <div className="text-[10px] text-green-600 dark:text-green-400 mt-1">Unlocked on {new Date(reportedTrophies[t.id]).toLocaleDateString()}</div>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-full"
                    title="Share"
                    onClick={async () => {
                      const shareUrl = t.badgeSrc || window.location.href;
                      try {
                        if (navigator.share) {
                          await navigator.share({ title: t.title, url: shareUrl });
                        } else if (navigator.clipboard) {
                          await navigator.clipboard.writeText(shareUrl);
                          toast({ title: 'Link copied', description: 'Trophy link copied to clipboard.' });
                        }
                      } catch (_) {
                        try {
                          await navigator.clipboard.writeText(shareUrl);
                          toast({ title: 'Link copied', description: 'Trophy link copied to clipboard.' });
                        } catch {}
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-full"
                    title="Print"
                    onClick={() => {
                      const img = t.badgeSrc;
                      if (!img) {
                        window.print();
                        return;
                      }
                      const w = window.open('', '_blank', 'noopener,noreferrer,width=800,height=600');
                      if (!w) return;
                      w.document.write(`<!doctype html><html><head><title>Print Trophy</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;background:#fff}</style></head><body><img src="${img}" style="max-width:90vw;max-height:90vh;" onload="window.focus();window.print();" /></body></html>`);
                      w.document.close();
                    }}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  {t.id === 'story-master' && (
                    <Button variant="outline" className="h-8 px-3 rounded-xl ml-auto" onClick={() => navigate('/kids/young')}>Go to Young Stories</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;


