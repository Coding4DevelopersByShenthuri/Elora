import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Award, ArrowLeft, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import KidsApi from '@/services/KidsApi';
import KidsProgressService from '@/services/KidsProgressService';
import CertificatesService, { type CertificateLayout } from '@/services/CertificatesService';

type CertificateSpec = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  criteria: (ctx: any) => { progress: number; eligible: boolean; hint: string };
};

const CertificatesPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);
  const [localKidsProgress, setLocalKidsProgress] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'certs' | 'badges' | 'trophies'>('certs');
  const [stylePreset, setStylePreset] = useState<'auto' | 'kids' | 'pro'>('auto');

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
      pronunciation: localKidsProgress.pronunciation
    } : {};
    return {
      ...serverDetails,
      readAloud: serverDetails.readAloud || localDetails.readAloud || {},
      vocabulary: serverDetails.vocabulary || localDetails.vocabulary || {},
      pronunciation: serverDetails.pronunciation || localDetails.pronunciation || {}
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
      description: 'Complete 10 stories with average score ≥ 80',
      criteria: (c) => {
        const readAloud = c.details?.readAloud || {};
        const attempts = Object.values(readAloud) as any[];
        const total = attempts.length;
        const avg = total ? (attempts.reduce((s: number, r: any) => s + (r.bestScore || 0), 0) / total) : 0;
        const progress = Math.min(100, Math.round(((Math.min(total, 10) / 10) * 50) + (Math.min(avg, 100) / 2)));
        const eligible = total >= 10 && avg >= 80;
        const hint = eligible ? 'Ready to download!' : `Stories: ${total}/10, Avg: ${avg.toFixed(0)}%`;
        return { progress, eligible, hint };
      }
    },
    {
      id: 'speaking-star',
      title: 'Speaking Star',
      emoji: '🎤',
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
      description: 'Unlock any 3 certificates',
      criteria: (_c) => {
        // computed after other specs
        return { progress: 0, eligible: false, hint: '' };
      }
    }
  ];

  const computed = certificates.map((spec) => spec.criteria(ctx));
  const earnedCount = computed.slice(0, 4).filter(c => c.eligible).length;
  const superProgress = Math.min(100, Math.round((Math.min(earnedCount, 3) / 3) * 100));
  const superEligible = earnedCount >= 3;

  // Patch in Super Learner
  computed[4] = { progress: superProgress, eligible: superEligible, hint: superEligible ? 'Ready to download!' : `Certificates: ${Math.min(earnedCount, 3)}/3` };

  // Derive badges and trophies lists similar to Microsoft Learn layout
  const unlockedBadges = useMemo(() => (achievements || []).filter((a: any) => a.unlocked), [achievements]);
  const lockedBadges = useMemo(() => (achievements || []).filter((a: any) => !a.unlocked), [achievements]);
  const trophySpecs = [
    { id: 'story-master', title: 'Story Master', emoji: '📖', desc: 'All 10 young stories at ≥80' },
    { id: 'pronunciation-pro', title: 'Pronunciation Pro', emoji: '🎙️', desc: '100 pron attempts, avg ≥80' },
    { id: 'vocab-builder', title: 'Vocabulary Builder', emoji: '🧠', desc: '150 unique words, fewer hints' },
    { id: 'explorer', title: 'Explorer Trophy', emoji: '🗺️', desc: 'Try all games + 300 pts' }
  ];

  const computeTrophyProgress = (t: { id: string }) => {
    const d = ctx.details || {};
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
      const aPart = Math.min(attempts, 100) / 100; // up to 100 attempts
      const bPart = Math.min(Math.max(avg, 0), 100) / 100; // avg percent
      return Math.round((aPart * 60 + bPart * 40) * 100); // weight attempts 60%, avg 40%
    }
    if (t.id === 'vocab-builder') {
      const vocab = d.vocabulary || {};
      const unique = Object.keys(vocab).length;
      return Math.round((Math.min(unique, 150) / 150) * 100);
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
      ...defaultLayout,
      style: 'kids',
      titleText: 'Story Time Champion',
    },
    'speaking-star': {
      ...defaultLayout,
      style: 'kids',
      titleText: 'Speaking Star',
    },
    'word-wizard': {
      ...defaultLayout,
      style: 'kids',
      titleText: 'Word Wizard',
    },
    'consistency-hero': {
      ...defaultLayout,
      style: 'kids',
      titleText: 'Consistency Hero',
    },
    // Showcase a professional look for this one
    'super-learner': {
      ...defaultLayout,
      style: 'pro',
      titleText: 'Certificate of Achievement',
      subtitleText: 'This is presented to',
      nameFont: '700 60px system-ui, sans-serif',
      dateFont: '500 26px system-ui, sans-serif',
      nameColor: '#111827',
      dateColor: '#374151'
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 container mx-auto px-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" className="rounded-xl" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#118AB2] bg-clip-text text-transparent">
          Your Certificates
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
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
        {activeTab === 'certs' && (
          <>
            <span className="text-xs text-gray-500 dark:text-gray-300 ml-3 mr-1">Style:</span>
            <Button variant={stylePreset==='auto'?'default':'outline'} className="rounded-xl" onClick={() => setStylePreset('auto')}>Auto</Button>
            <Button variant={stylePreset==='kids'?'default':'outline'} className="rounded-xl" onClick={() => setStylePreset('kids')}>Kids</Button>
            <Button variant={stylePreset==='pro'?'default':'outline'} className="rounded-xl" onClick={() => setStylePreset('pro')}>Pro</Button>
          </>
        )}
      </div>

      {activeTab === 'certs' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {certificates.map((spec, idx) => (
            <Card key={spec.id} className="border-2 rounded-2xl bg-white/80 dark:bg-gray-900/40">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-extrabold text-gray-800 dark:text-white">
                    <span className="text-2xl">{spec.emoji}</span>
                    {spec.title}
                  </div>
                  {computed[idx].eligible ? (
                    <Crown className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Award className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{spec.description}</p>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4]"
                    style={{ width: `${computed[idx].progress}%` }}
                  />
                </div>
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-3">
                  {computed[idx].hint}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={!computed[idx].eligible || loading}
                    className="rounded-xl"
                    onClick={async () => {
                      const userData = localStorage.getItem('speakbee_current_user');
                      const userName = userData ? (JSON.parse(userData)?.name || 'Little Learner') : 'Little Learner';
                      const baseLayout = layoutByCert[spec.id] || defaultLayout;
                      const layout = stylePreset === 'auto' ? baseLayout : { ...baseLayout, style: stylePreset } as CertificateLayout;
                      const png = await CertificatesService.generatePNG(layout, userName, new Date());
                      await CertificatesService.generateAndDownloadPDF(png, `${spec.id}.pdf`);
                      try {
                        const token = localStorage.getItem('speakbee_auth_token');
                        if (token && token !== 'local-token') {
                          await (KidsApi as any).issueCertificate(token, { cert_id: spec.id, title: spec.title });
                        }
                      } catch (_) {}
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {unlockedBadges.map((b: any, i: number) => (
            <Card key={`${b.id || i}`} className="border rounded-xl bg-white/80 dark:bg-gray-900/40">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🏅</div>
                  <div>
                    <div className="text-sm font-extrabold text-gray-800 dark:text-white">{b.title || b.name || 'Badge'}</div>
                    <div className="text-xs text-gray-500">{b.unlocked_at ? `Unlocked` : ''}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {lockedBadges.length === 0 && unlockedBadges.length === 0 && (
            <div className="text-center text-sm text-gray-500">No badges yet. Start learning to unlock badges!</div>
          )}
        </div>
      )}

      {activeTab === 'trophies' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {trophySpecs.map((t) => (
            <Card key={t.id} className="border rounded-xl bg-white/80 dark:bg-gray-900/40">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 font-extrabold text-gray-800 dark:text-white mb-1">
                  <span className="text-2xl">{t.emoji}</span>
                  {t.title}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">{t.desc}</div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${computeTrophyProgress(t)}%` }} />
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


