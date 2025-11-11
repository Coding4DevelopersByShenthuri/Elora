import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Award, ArrowLeft, Download, Loader2, Sparkles, Baby, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import KidsApi from '@/services/KidsApi';
import TeenApi from '@/services/TeenApi';
import KidsProgressService from '@/services/KidsProgressService';
import CertificatesService, { type CertificateLayout } from '@/services/CertificatesService';
import StorageService from '@/services/StorageService';
import StoryWordsService from '@/services/StoryWordsService';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type CertificateSpec = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  category: 'young_kids' | 'teen_kids' | 'upcoming';
  criteria: (ctx: any, isTeenKids?: boolean) => { progress: number; eligible: boolean; hint: string };
  badgeSrc?: string;
};

const AllCertificatesPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [youngProgress, setYoungProgress] = useState<any>(null);
  const [teenProgress, setTeenProgress] = useState<any>(null);
  const [localKidsProgress, setLocalKidsProgress] = useState<any>(null);
  const [generatingCertId, setGeneratingCertId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'young' | 'teen' | 'upcoming'>('all');

  // Load progress for both categories
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('speakbee_auth_token');
        const userData = localStorage.getItem('speakbee_current_user');
        const userId = userData ? (JSON.parse(userData)?.id || 'anonymous') : 'anonymous';

        // Always load local kids progress as fallback
        try {
          const local = await KidsProgressService.get(userId);
          setLocalKidsProgress(local);
        } catch (_) {}

        if (isAuthenticated && token && token !== 'local-token') {
          // Load Young Kids progress
          try {
            const [youngPg] = await Promise.all([
              KidsApi.getProgress(token).catch(() => null),
            ]);
            setYoungProgress(youngPg);
          } catch (error) {
            console.error('Error loading young kids progress:', error);
          }

          // Load Teen Kids progress
          try {
            const [teenDashboard, kidsProgress] = await Promise.all([
              TeenApi.getDashboard(token).catch(() => null),
              KidsApi.getProgress(token).catch(() => null),
            ]);

            let mergedProgress: any = kidsProgress || {};
            
            if (teenDashboard) {
              const dashboard = teenDashboard as any;
              const teenPoints = dashboard.points ?? dashboard.progress?.points ?? 0;
              const teenStreak = dashboard.streak ?? dashboard.progress?.streak ?? 0;
              const teenPronunciationAttempts = Number(dashboard.pronunciation_attempts ?? 0) || 0;
              const teenVocabularyAttempts = Number(dashboard.vocabulary_attempts ?? 0) || 0;
              const teenGamesAttempts = Number(dashboard.games_attempts ?? 0) || 0;
              const completedStoryIds = Array.isArray(dashboard.completed_story_ids) ? dashboard.completed_story_ids : [];
              
              if (!mergedProgress.details) {
                mergedProgress.details = {};
              }
              if (!mergedProgress.details.audienceStats) {
                mergedProgress.details.audienceStats = {};
              }
              
              mergedProgress.details.audienceStats.teen = {
                points: teenPoints,
                streak: teenStreak,
                pronunciation_attempts: teenPronunciationAttempts,
                vocabulary_attempts: teenVocabularyAttempts,
                games_attempts: teenGamesAttempts,
              };
              
              if (!mergedProgress.details.storyEnrollments) {
                mergedProgress.details.storyEnrollments = [];
              }
              
              const existingStoryIds = new Set(
                (mergedProgress.details.storyEnrollments || []).map((s: any) => s.storyId)
              );
              
              const teenStoryMapping: Record<string, string> = {
                'teen-0': 'mystery-detective',
                'teen-1': 'space-explorer-teen',
                'teen-2': 'environmental-hero',
                'teen-3': 'tech-innovator',
                'teen-4': 'global-citizen',
                'teen-5': 'future-leader',
                'teen-6': 'scientific-discovery',
                'teen-7': 'social-media-expert',
                'teen-8': 'ai-ethics-explorer',
                'teen-9': 'digital-security-guardian',
              };
              
              completedStoryIds.forEach((storyId: string) => {
                if (!existingStoryIds.has(storyId)) {
                  const internalStoryId = teenStoryMapping[storyId] || storyId;
                  mergedProgress.details.storyEnrollments.push({
                    storyId: internalStoryId,
                    completed: true,
                    wordsExtracted: true,
                    score: 100,
                  });
                }
              });
              
              mergedProgress.points = teenPoints;
              mergedProgress.streak = teenStreak;
            }
            
            setTeenProgress(mergedProgress);
          } catch (error) {
            console.error('Error loading teen kids progress:', error);
          }
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  const userData = localStorage.getItem('speakbee_current_user');
  const userId = userData ? (JSON.parse(userData)?.id || 'anonymous') : 'anonymous';

  // Helper to merge details
  const getMergedDetails = (progress: any) => {
    const serverDetails = progress?.details || {};
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
  };

  const youngDetails = getMergedDetails(youngProgress);
  const teenDetails = getMergedDetails(teenProgress);

  const youngAudienceStats = (youngDetails as any)?.audienceStats?.young || {};
  const teenAudienceStats = (teenDetails as any)?.audienceStats?.teen || {};

  // Calculate points for each category
  const calculateLearningPoints = useCallback((progress: any, isTeenKids: boolean) => {
    try {
      let totalPoints = 0;
      const details = getMergedDetails(progress);
      const vocab = details?.vocabulary || {};
      const pron = details?.pronunciation || {};
      const teenStoryIds = ['mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator', 
        'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert', 
        'ai-ethics-explorer', 'digital-security-guardian'];
      const youngStoryIds = ['magic-forest', 'space-adventure', 'underwater-world', 'dinosaur-discovery',
        'unicorn-magic', 'pirate-treasure', 'superhero-school', 'fairy-garden',
        'rainbow-castle', 'jungle-explorer'];
      
      const targetStoryIds = isTeenKids ? teenStoryIds : youngStoryIds;
      const enrolledStories = StoryWordsService.getEnrolledStories(userId);
      
      const completedStoryIds = enrolledStories
        .filter(e => 
          e.completed === true && 
          e.wordsExtracted === true &&
          targetStoryIds.includes(e.storyId)
        )
        .map(e => e.storyId);
      
      completedStoryIds.forEach(storyId => {
        const story = enrolledStories.find(e => e.storyId === storyId);
        if (story && story.score) {
          const storyPoints = 100 + Math.round(story.score);
          totalPoints += storyPoints;
        } else {
          totalPoints += 150;
        }
      });
      
      if (completedStoryIds.length > 0) {
        const words = StoryWordsService.getWordsForStoryIds(completedStoryIds);
        const storyWords = new Set<string>();
        words.forEach(w => storyWords.add(w.word.toLowerCase()));
        
        const filteredVocab = Object.entries(vocab).filter(([word]) => 
          storyWords.has(word.toLowerCase())
        ).map(([, data]) => data as any);
        
        const masteredWords = filteredVocab.filter((r: any) => (r.attempts || 0) >= 2);
        totalPoints += masteredWords.length * 25;
      }
      
      if (completedStoryIds.length > 0) {
        const phrases = StoryWordsService.getPhrasesForStoryIds(completedStoryIds);
        const storyPhrases = new Set<string>();
        phrases.forEach(p => storyPhrases.add(p.phrase.toLowerCase()));
        
        const filteredSessions = Object.entries(pron).filter(([phrase]) => 
          storyPhrases.has(phrase.toLowerCase())
        ).map(([, data]) => data as any);
        
        const totalPronAttempts = filteredSessions.reduce((sum: number, r: any) => sum + (r.attempts || 0), 0);
        totalPoints += totalPronAttempts * 35;
      }
      
      return totalPoints;
    } catch (error) {
      console.error('Error calculating learning points:', error);
      return 0;
    }
  }, [userId, localKidsProgress]);

  const youngPoints = useMemo(() => calculateLearningPoints(youngProgress, false), [youngProgress, calculateLearningPoints]);
  const teenPoints = useMemo(() => calculateLearningPoints(teenProgress, true), [teenProgress, calculateLearningPoints]);

  const youngStreak = youngAudienceStats.streak ?? (youngProgress as any)?.streak ?? 0;
  const teenStreak = teenAudienceStats.streak ?? (teenProgress as any)?.streak ?? 0;

  // Certificate definitions
  const createCertificateSpecs = (category: 'young_kids' | 'teen_kids'): CertificateSpec[] => {
    const isTeenKids = category === 'teen_kids';
    const progress = isTeenKids ? teenProgress : youngProgress;
    const details = isTeenKids ? teenDetails : youngDetails;
    const points = isTeenKids ? teenPoints : youngPoints;
    const streak = isTeenKids ? teenStreak : youngStreak;

    const ctx = {
      points,
      streak,
      details,
      achievements: [],
    };

    return [
      {
        id: `story-time-champion-${category}`,
        title: isTeenKids ? 'Advanced Story Champion' : 'Story Time Champion',
        emoji: '📚',
        badgeSrc: '/story-time-champion-badge.png',
        description: isTeenKids ? 'Completed 10 advanced teen stories' : 'Completed 10 stories',
        category,
        criteria: (c, isTeen = isTeenKids) => {
          const storyEnrollments = (c.details?.storyEnrollments || []) as any[];
          const teenStoryIds = ['mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator', 
            'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert', 
            'ai-ethics-explorer', 'digital-security-guardian'];
          const youngStoryIds = ['magic-forest', 'space-adventure', 'underwater-world', 'dinosaur-discovery',
            'unicorn-magic', 'pirate-treasure', 'superhero-school', 'fairy-garden',
            'rainbow-castle', 'jungle-explorer'];
          
          let completedStories = storyEnrollments.filter((s: any) => 
            s.completed === true && s.wordsExtracted === true
          );
          
          if (isTeen) {
            completedStories = completedStories.filter((s: any) => teenStoryIds.includes(s.storyId));
          } else {
            completedStories = completedStories.filter((s: any) => youngStoryIds.includes(s.storyId));
          }
          
          const completedCount = completedStories.length;

          try {
            const enrolledStories = StoryWordsService.getEnrolledStories(userId);
            let fullyCompleted = enrolledStories.filter(e => 
              e.completed === true && e.wordsExtracted === true
            );
            
            if (isTeen) {
              fullyCompleted = fullyCompleted.filter(e => teenStoryIds.includes(e.storyId));
            } else {
              fullyCompleted = fullyCompleted.filter(e => youngStoryIds.includes(e.storyId));
            }
            
            const total = Math.max(completedCount, fullyCompleted.length);
            const progress = Math.min(100, Math.round((Math.min(total, 10) / 10) * 100));
            const eligible = total >= 10;
            const hint = eligible ? 'Ready to download!' : `Stories: ${Math.min(total, 10)}/10 completed`;
            return { progress, eligible, hint };
          } catch {
            const total = completedCount;
            const progress = Math.min(100, Math.round((Math.min(total, 10) / 10) * 100));
            const eligible = total >= 10;
            const hint = eligible ? 'Ready to download!' : `Stories: ${Math.min(total, 10)}/10 completed`;
            return { progress, eligible, hint };
          }
        }
      },
      {
        id: `speaking-star-${category}`,
        title: isTeenKids ? 'Professional Speaking Star' : 'Speaking Star',
        emoji: '🎤',
        badgeSrc: '/Speaking_star_badge.png',
        description: isTeenKids ? '50 Advanced Speaking sessions with average ≥ 75' : '50 Speak & Repeat sessions with average ≥ 75',
        category,
        criteria: (c, isTeen = isTeenKids) => {
          const pron = c.details?.pronunciation || {};
          const teenStoryIds = ['mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator', 
            'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert', 
            'ai-ethics-explorer', 'digital-security-guardian'];
          const youngStoryIds = ['magic-forest', 'space-adventure', 'underwater-world', 'dinosaur-discovery',
            'unicorn-magic', 'pirate-treasure', 'superhero-school', 'fairy-garden',
            'rainbow-castle', 'jungle-explorer'];
          
          const targetStoryIds = isTeen ? teenStoryIds : youngStoryIds;
          try {
            const enrolledStories = StoryWordsService.getEnrolledStories(userId);
            const completedStoryIds = enrolledStories
              .filter(e => 
                e.completed === true && 
                e.wordsExtracted === true &&
                targetStoryIds.includes(e.storyId)
              )
              .map(e => e.storyId);
            
            if (completedStoryIds.length === 0) {
              return { progress: 0, eligible: false, hint: 'Sessions: 0/50, Avg: 0%' };
            }
            
            const phrases = StoryWordsService.getPhrasesForStoryIds(completedStoryIds);
            const storyPhrases = new Set<string>();
            phrases.forEach(p => storyPhrases.add(p.phrase.toLowerCase()));
            
            const filteredSessions = Object.entries(pron).filter(([phrase]) => 
              storyPhrases.has(phrase.toLowerCase())
            ).map(([, data]) => data as any);
            
            const total = filteredSessions.reduce((s: number, r: any) => s + (r.attempts || 0), 0);
            const avg = filteredSessions.length ? (filteredSessions.reduce((s: number, r: any) => s + (r.bestScore || 0), 0) / filteredSessions.length) : 0;
            const progress = Math.min(100, Math.round(((Math.min(total, 50) / 50) * 50) + (Math.min(avg, 100) / 2)));
            const eligible = total >= 50 && avg >= 75;
            const hint = eligible ? 'Ready to download!' : `Sessions: ${Math.min(total, 50)}/50, Avg: ${avg.toFixed(0)}%`;
            return { progress, eligible, hint };
          } catch (error) {
            console.error('Error computing speaking-star certificate:', error);
            return { progress: 0, eligible: false, hint: 'Sessions: 0/50, Avg: 0%' };
          }
        }
      },
      {
        id: `word-wizard-${category}`,
        title: isTeenKids ? 'Advanced Vocabulary Master' : 'Word Wizard',
        emoji: '🪄',
        badgeSrc: '/Word_wizard_badge.png',
        description: isTeenKids ? 'Master 100 advanced words (≥ 2 practices each)' : 'Master 100 unique words (≥ 2 practices each)',
        category,
        criteria: (c, isTeen = isTeenKids) => {
          const vocab = c.details?.vocabulary || {};
          const teenStoryIds = ['mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator', 
            'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert', 
            'ai-ethics-explorer', 'digital-security-guardian'];
          const youngStoryIds = ['magic-forest', 'space-adventure', 'underwater-world', 'dinosaur-discovery',
            'unicorn-magic', 'pirate-treasure', 'superhero-school', 'fairy-garden',
            'rainbow-castle', 'jungle-explorer'];
          
          const targetStoryIds = isTeen ? teenStoryIds : youngStoryIds;
          try {
            const enrolledStories = StoryWordsService.getEnrolledStories(userId);
            const completedStoryIds = enrolledStories
              .filter(e => 
                e.completed === true && 
                e.wordsExtracted === true &&
                targetStoryIds.includes(e.storyId)
              )
              .map(e => e.storyId);
            
            if (completedStoryIds.length === 0) {
              return { progress: 0, eligible: false, hint: 'Mastered: 0/100' };
            }
            
            const words = StoryWordsService.getWordsForStoryIds(completedStoryIds);
            const storyWords = new Set<string>();
            words.forEach(w => storyWords.add(w.word.toLowerCase()));
            
            const filteredVocab = Object.entries(vocab).filter(([word]) => 
              storyWords.has(word.toLowerCase())
            ).map(([, data]) => data as any);
            
            const mastered = filteredVocab.filter((r: any) => (r.attempts || 0) >= 2).length;
            const progress = Math.min(100, Math.round((Math.min(mastered, 100) / 100) * 100));
            const eligible = mastered >= 100;
            const hint = eligible ? 'Ready to download!' : `Mastered: ${mastered}/100`;
            return { progress, eligible, hint };
          } catch (error) {
            console.error('Error computing word-wizard certificate:', error);
            return { progress: 0, eligible: false, hint: 'Mastered: 0/100' };
          }
        }
      },
      {
        id: `consistency-hero-${category}`,
        title: 'Consistency Hero',
        emoji: '🔥',
        badgeSrc: '/Consistancy_badge.png',
        description: 'Maintain a 21-day learning streak',
        category,
        criteria: (c) => {
          const streak = c.streak || 0;
          const progress = Math.min(100, Math.round((Math.min(streak, 21) / 21) * 100));
          const eligible = streak >= 21;
          const hint = eligible ? 'Ready to download!' : `Streak: ${Math.min(streak, 21)}/21 days`;
          return { progress, eligible, hint };
        }
      },
      {
        id: `super-learner-${category}`,
        title: 'Super Learner',
        emoji: '🏆',
        badgeSrc: '/Super_Learner.png',
        description: 'Unlock any 3 certificates',
        category,
        criteria: (_c) => {
          return { progress: 0, eligible: false, hint: '' };
        }
      }
    ];
  };

  const youngCertificates = useMemo(() => {
    const specs = createCertificateSpecs('young_kids');
    const ctx = {
      points: youngPoints,
      streak: youngStreak,
      details: youngDetails,
      achievements: [],
    };
    const computed = specs.map((spec) => spec.criteria(ctx, false));
    const earnedCount = computed.slice(0, 4).filter(c => c.eligible).length;
    const superProgress = Math.min(100, Math.round((Math.min(earnedCount, 3) / 3) * 100));
    const superEligible = earnedCount >= 3;
    computed[4] = { 
      progress: superProgress, 
      eligible: superEligible, 
      hint: superEligible ? 'Ready to download!' : `Certificates: ${Math.min(earnedCount, 3)}/3` 
    };
    return specs.map((spec, idx) => ({ ...spec, computed: computed[idx] }));
  }, [youngPoints, youngStreak, youngDetails]);

  const teenCertificates = useMemo(() => {
    const specs = createCertificateSpecs('teen_kids');
    const ctx = {
      points: teenPoints,
      streak: teenStreak,
      details: teenDetails,
      achievements: [],
    };
    const computed = specs.map((spec) => spec.criteria(ctx, true));
    const earnedCount = computed.slice(0, 4).filter(c => c.eligible).length;
    const superProgress = Math.min(100, Math.round((Math.min(earnedCount, 3) / 3) * 100));
    const superEligible = earnedCount >= 3;
    computed[4] = { 
      progress: superProgress, 
      eligible: superEligible, 
      hint: superEligible ? 'Ready to download!' : `Certificates: ${Math.min(earnedCount, 3)}/3` 
    };
    return specs.map((spec, idx) => ({ ...spec, computed: computed[idx] }));
  }, [teenPoints, teenStreak, teenDetails]);

  // Upcoming certificates (for other categories)
  const upcomingCertificates: CertificateSpec[] = [
    {
      id: 'adults-beginner-cert',
      title: 'Beginner Achievement',
      emoji: '🌟',
      description: 'Complete 20 beginner lessons',
      category: 'upcoming',
      criteria: () => ({ progress: 0, eligible: false, hint: 'Coming soon' })
    },
    {
      id: 'adults-intermediate-cert',
      title: 'Intermediate Mastery',
      emoji: '⭐',
      description: 'Complete 30 intermediate lessons',
      category: 'upcoming',
      criteria: () => ({ progress: 0, eligible: false, hint: 'Coming soon' })
    },
    {
      id: 'adults-advanced-cert',
      title: 'Advanced Excellence',
      emoji: '💫',
      description: 'Complete 40 advanced lessons',
      category: 'upcoming',
      criteria: () => ({ progress: 0, eligible: false, hint: 'Coming soon' })
    },
    {
      id: 'ielts-pte-cert',
      title: 'IELTS/PTE Preparation',
      emoji: '🎓',
      description: 'Complete IELTS/PTE practice modules',
      category: 'upcoming',
      criteria: () => ({ progress: 0, eligible: false, hint: 'Coming soon' })
    }
  ];

  const allCertificates = [
    ...youngCertificates,
    ...teenCertificates,
    ...upcomingCertificates.map(cert => ({ ...cert, computed: { progress: 0, eligible: false, hint: 'Coming soon' } }))
  ];

  const filteredCertificates = useMemo(() => {
    if (activeCategory === 'all') return allCertificates;
    if (activeCategory === 'young') return youngCertificates;
    if (activeCategory === 'teen') return teenCertificates;
    if (activeCategory === 'upcoming') return upcomingCertificates.map(cert => ({ ...cert, computed: { progress: 0, eligible: false, hint: 'Coming soon' } }));
    return allCertificates;
  }, [activeCategory, allCertificates, youngCertificates, teenCertificates, upcomingCertificates]);

  const defaultLayout: CertificateLayout = {
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
      templatePath: (import.meta as any).env.VITE_STORY_CERT_TEMPLATE_URL || '/story-time-champion-template.png',
      namePositionRel: { x: 0.5, y: 0.50 },
      datePositionRel: { x: 0.72, y: 0.80 },
      nameFont: '700 72px "Playfair Display", "Georgia", "Times New Roman", serif',
      dateFont: '700 28px system-ui, sans-serif',
      nameColor: '#111827',
      dateColor: '#111827'
    },
    'speaking-star': {
      templatePath: (import.meta as any).env.VITE_SPEAKING_STAR_TEMPLATE_URL || '/Speaking_Star_Template.png',
      namePositionRel: { x: 0.5, y: 0.54 },
      datePositionRel: { x: 0.70, y: 0.82 },
      nameFont: '700 72px "Playfair Display", "Georgia", "Times New Roman", serif',
      dateFont: '700 28px system-ui, sans-serif',
      nameColor: '#111827',
      dateColor: '#111827'
    },
    'word-wizard': {
      templatePath: (import.meta as any).env.VITE_WORD_WIZARD_TEMPLATE_URL || '/Word Wizard_Template.png',
      namePositionRel: { x: 0.5, y: 0.54 },
      datePositionRel: { x: 0.70, y: 0.82 },
      nameFont: '700 72px "Playfair Display", "Georgia", "Times New Roman", serif',
      dateFont: '700 28px system-ui, sans-serif',
      nameColor: '#111827',
      dateColor: '#111827'
    },
    'consistency-hero': {
      templatePath: (import.meta as any).env.VITE_CONSISTENCY_HERO_TEMPLATE_URL || '/Consistency Hero_Template.png',
      namePositionRel: { x: 0.5, y: 0.54 },
      datePositionRel: { x: 0.70, y: 0.82 },
      nameFont: '700 72px "Playfair Display", "Georgia", "Times New Roman", serif',
      dateFont: '700 28px system-ui, sans-serif',
      nameColor: '#111827',
      dateColor: '#111827',
      titleText: 'Consistency Hero',
    },
    'super-learner': {
      templatePath: (import.meta as any).env.VITE_SUPER_LEARNER_TEMPLATE_URL || '/Super_Learner_Template.png',
      namePositionRel: { x: 0.5, y: 0.54 },
      datePositionRel: { x: 0.70, y: 0.82 },
      nameFont: '700 76px "Playfair Display", "Georgia", "Times New Roman", serif',
      dateFont: '500 26px system-ui, sans-serif',
      nameColor: '#111827',
      dateColor: '#374151'
    }
  };

  const handleDownload = async (cert: any) => {
    const certId = cert.id.replace(/-young_kids|-teen_kids/, '');
    setGeneratingCertId(cert.id);
    
    try {
      const userData = localStorage.getItem('speakbee_current_user');
      const userName = userData ? (JSON.parse(userData)?.name || 'Learner') : 'Learner';
      const userId = userData ? (JSON.parse(userData)?.id || 'anonymous') : 'anonymous';
      const token = localStorage.getItem('speakbee_auth_token');
      const isOnline = token && token !== 'local-token';
      const isTeenKids = cert.category === 'teen_kids';

      const baseLayout = layoutByCert[certId] || defaultLayout;
      const layout = baseLayout;
      const png = await CertificatesService.generatePNG(layout, userName, new Date());

      let fileUrl: string | undefined;
      const isSupabaseConfigured = StorageService.isSupabaseConfigured();
      
      if (isOnline && isSupabaseConfigured) {
        try {
          const uploadResult = await StorageService.uploadCertificateBlob(png, `${certId}-${Date.now()}.png`, userId);
          fileUrl = uploadResult.publicUrl;
        } catch (uploadError: any) {
          console.warn('Failed to upload certificate to storage:', uploadError);
          toast({
            title: 'Upload Failed',
            description: 'Certificate downloaded locally, but cloud upload failed.',
            variant: 'destructive',
          });
        }
      }

      await CertificatesService.generateAndDownloadPDF(png, `${certId}.pdf`);

      if (isOnline && token) {
        try {
          await KidsApi.issueCertificate(token, { 
            cert_id: certId, 
            title: cert.title,
            audience: isTeenKids ? 'teen' : 'young',
            file_url: fileUrl || ''
          });
          
          toast({
            title: 'Certificate Generated! 🎉',
            description: fileUrl 
              ? 'Your certificate has been downloaded and saved to the cloud.'
              : 'Your certificate has been downloaded and recorded.',
          });
        } catch (apiError: any) {
          console.error('Failed to record certificate:', apiError);
          toast({
            title: 'Certificate Downloaded',
            description: 'Certificate downloaded, but could not be saved to your account.',
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
  };

  const earnedCount = allCertificates.filter(c => c.computed?.eligible).length;
  const totalCount = allCertificates.length;

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <main className="container mx-auto max-w-7xl px-4 pt-24 space-y-10">
        <section>
          <Card className="relative mx-auto w-full overflow-hidden border-none bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#74C69D] text-white shadow-xl">
            <span className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <span className="absolute -left-28 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <CardContent className="relative z-10 space-y-6 p-5 sm:space-y-8 sm:p-6 md:p-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-5 sm:space-y-6 lg:max-w-3xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => navigate(-1)}
                      className="rounded-full border-white/40 bg-white/15 px-4 py-2 text-white transition hover:bg-white/25"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <span className="rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
                      All Certificates
                    </span>
                  </div>
                  <div className="space-y-3">
                    <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
                      Your Complete Certificate Collection
                    </h1>
                    <p className="text-base text-white/85 md:text-lg">
                      View and download all your certificates from Young Kids, Teen Kids, and upcoming categories.
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 text-sm sm:grid-cols-3 sm:gap-4">
                  <div className="rounded-2xl bg-white/15 px-4 py-3 text-white shadow-sm backdrop-blur sm:text-left">
                    <p className="text-xs uppercase tracking-wide text-white/70">Total Certificates</p>
                    <p className="text-2xl font-semibold">{totalCount}</p>
                  </div>
                  <div className="rounded-2xl bg-white/15 px-4 py-3 text-white shadow-sm backdrop-blur sm:text-left">
                    <p className="text-xs uppercase tracking-wide text-white/70">Earned</p>
                    <p className="text-2xl font-semibold">{earnedCount}</p>
                  </div>
                  <div className="rounded-2xl bg-white/15 px-4 py-3 text-white shadow-sm backdrop-blur sm:text-left">
                    <p className="text-xs uppercase tracking-wide text-white/70">Progress</p>
                    <p className="text-2xl font-semibold">{Math.round((earnedCount / totalCount) * 100)}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as typeof activeCategory)}>
            <TabsList className="grid w-full grid-cols-4 gap-2 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="young">
                <Baby className="mr-2 h-4 w-4" />
                Young Kids
              </TabsTrigger>
              <TabsTrigger value="teen">
                <GraduationCap className="mr-2 h-4 w-4" />
                Teen Kids
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                <Sparkles className="mr-2 h-4 w-4" />
                Upcoming
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeCategory} className="space-y-6">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={`skeleton-${i}`} className="border-2 rounded-2xl bg-white/60 dark:bg-gray-900/30 p-5 animate-pulse">
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                      <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                    </Card>
                  ))}
                </div>
              ) : filteredCertificates.length === 0 ? (
                <Card className="border-2 border-yellow-200 dark:border-yellow-700 bg-yellow-50/40 dark:bg-yellow-900/10 backdrop-blur-sm shadow-lg p-8 text-center">
                  <div className="text-6xl mb-4">📜</div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    No Certificates Yet!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Start learning to unlock your first certificate!
                  </p>
                  <Button
                    onClick={() => navigate('/kids')}
                    className="bg-gradient-to-r from-[#1B4332] to-[#74C69D] hover:from-[#74C69D] hover:to-[#1B4332] text-white font-bold py-3 px-6 rounded-xl"
                  >
                    Go to Learning Zone →
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {filteredCertificates.map((cert) => {
                    const computed = cert.computed || { progress: 0, eligible: false, hint: 'Coming soon' };
                    const isUpcoming = cert.category === 'upcoming';
                    
                    return (
                      <Card 
                        key={cert.id} 
                        className={cn(
                          "border-2 rounded-2xl bg-white/80 dark:bg-gray-900/40 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative overflow-hidden",
                          isUpcoming && "opacity-75"
                        )}
                      >
                        {computed.eligible && !isUpcoming && (
                          <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-yellow-400"></div>
                        )}
                        <CardContent className="p-4 sm:p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className={cn(
                                "rounded-xl sm:rounded-2xl p-2 sm:p-3 flex items-center justify-center",
                                computed.eligible && !isUpcoming ? 'bg-gradient-to-br from-yellow-400 to-orange-400' : 'bg-gray-100 dark:bg-gray-800'
                              )}>
                                {cert.badgeSrc ? (
                                  <img
                                    src={cert.badgeSrc}
                                    alt={`${cert.title} badge`}
                                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                                  />
                                ) : (
                                  <span className="text-2xl sm:text-3xl">{cert.emoji}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm sm:text-base md:text-lg font-bold text-gray-800 dark:text-white">
                                  {cert.title}
                                </div>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {cert.category === 'young_kids' ? 'Young Kids' : 
                                   cert.category === 'teen_kids' ? 'Teen Kids' : 'Upcoming'}
                                </Badge>
                              </div>
                            </div>
                            {computed.eligible && !isUpcoming ? (
                              <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500 flex-shrink-0" />
                            ) : (
                              <Award className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                            {cert.description}
                          </p>
                          {!isUpcoming && (
                            <>
                              <div className="w-full h-2.5 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3 shadow-inner">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    computed.eligible 
                                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400' 
                                      : 'bg-gradient-to-r from-[#1B4332] to-[#74C69D]'
                                  )}
                                  style={{ width: `${computed.progress}%` }}
                                />
                              </div>
                              <div className="text-[11px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 mb-4">
                                {computed.hint}
                              </div>
                            </>
                          )}
                          {isUpcoming && (
                            <div className="text-xs text-center text-gray-500 dark:text-gray-400 mb-4">
                              Coming soon
                            </div>
                          )}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            {!isUpcoming && (
                              <Button
                                disabled={!computed.eligible || loading || generatingCertId === cert.id}
                                className="rounded-xl w-full sm:w-auto"
                                onClick={() => handleDownload(cert)}
                              >
                                {generatingCertId === cert.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-4 h-4 mr-2" /> Download
                                  </>
                                )}
                              </Button>
                            )}
                            {cert.category !== 'upcoming' && (
                              <Button
                                variant="outline"
                                className="rounded-xl w-full sm:w-auto"
                                onClick={() => navigate(cert.category === 'teen_kids' ? '/kids/teen' : '/kids/young')}
                              >
                                Improve Progress
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
};

export default AllCertificatesPage;

