import { useState, useEffect } from 'react';
import {
  Sparkles,
  Users,
  BookOpen,
  Baby,
  GraduationCap,
  ArrowRight,
  Clock,
  Target,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import { useNavigate } from 'react-router-dom';
import SyncStatusIndicator from '@/components/kids/SyncStatusIndicator';

const KidsPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check authentication and user existence on mount
  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (!isAuthenticated) {
        // Check if there are any existing users in localStorage
        const speakbeeUsers = JSON.parse(localStorage.getItem("speakbee_users") || "[]");
        const legacyUsers = JSON.parse(localStorage.getItem('users') || "[]");
        
        const hasExistingUsers = speakbeeUsers.length > 0 || legacyUsers.length > 0;
        
        // If there are existing users, show login form, otherwise show registration
        setAuthMode(hasExistingUsers ? 'login' : 'register');
        setShowAuthModal(true);
      }
    };

    checkUserAndRedirect();
  }, [isAuthenticated]);

  const ageCategories = [
    {
      id: 'young-kids',
      title: 'Little Learners',
      subtitle: 'Ages 4-10',
      description: 'Everything inside Little Learners mirrors the Young Kids hub: guided stories, Speak & Repeat, Word Games, and sparkly progress tracking.',
      features: [
        'Story Time adventures with voice narration and enrollment badges',
        'Word Games that unlock vocabulary straight from completed stories',
        'Speak & Repeat studio powered by AI pronunciation scoring',
        'Fun Games with session history, points, and streak tracking'
      ],
      icon: Baby,
      route: '/kids/young',
      stats: { stories: 10, games: 5, words: 200 },
      difficulty: 'Guided • Foundational',
      duration: '5-7 minutes per session',
      accent: {
        text: 'text-sky-600 dark:text-sky-300',
        badge: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-200',
        button: 'from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-600',
        chip: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-100',
        border: 'hover:border-sky-400/60 hover:shadow-sky-500/20',
        cardBg: 'from-sky-50 via-white to-sky-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900',
        cardOverlay: 'from-sky-300/40 via-sky-200/25 to-transparent dark:from-sky-500/25 dark:via-sky-400/20 dark:to-transparent',
        statBg: 'border-sky-200/60 bg-sky-100/50 dark:border-sky-500/25 dark:bg-sky-500/10'
      }
    },
    {
      id: 'teen-kids',
      title: 'Teen Explorers',
      subtitle: 'Ages 11-17',
      description: 'Teen Explorers matches the teen learning experience: advanced stories, vocabulary drills, speaking labs, and challenge games with AI feedback.',
      features: [
        'Adventure Stories that award points, enrollments, and certificates',
        'Advanced Vocabulary decks sourced from completed teen narratives',
        'Professional Speaking practice with phoneme coaching and attempts tracking',
        'Challenge Games with Gemini-powered conversations and history tabs'
      ],
      icon: GraduationCap,
      route: '/kids/teen',
      stats: { stories: 10, games: 7, words: 500 },
      difficulty: 'Independent • Advanced',
      duration: '9-15 minutes per session',
      accent: {
        text: 'text-indigo-600 dark:text-indigo-300',
        badge: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-200',
        button: 'from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600',
        chip: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-100',
        border: 'hover:border-indigo-400/60 hover:shadow-indigo-500/20',
        cardBg: 'from-indigo-50 via-white to-indigo-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900',
        cardOverlay: 'from-indigo-300/40 via-indigo-200/25 to-transparent dark:from-indigo-500/25 dark:via-indigo-400/20 dark:to-transparent',
        statBg: 'border-indigo-200/60 bg-indigo-100/50 dark:border-indigo-500/25 dark:bg-indigo-500/10'
      }
    }
  ];

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    navigate('/');
  };

  // Show auth modal if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={handleAuthModalClose}
          initialMode={authMode}
          redirectFromKids={true}
          onAuthSuccess={handleAuthSuccess}
        />
        <div className="text-center p-6 md:p-8 lg:p-10 max-w-2xl w-full rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 shadow-lg backdrop-blur">
          <div className="mb-5 flex items-center justify-center gap-3">
            <div className="rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300 p-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white">
              Kids Learning Zone
            </h1>
          </div>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mb-8">
            {authMode === 'login' 
              ? 'Sign in to continue tracking progress and personalised learning plans.'
              : 'Create an account to unlock guided lessons and structured practice.'}
          </p>
          <Button 
            onClick={() => setShowAuthModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-500 text-white font-semibold py-3 px-8 rounded-xl text-base w-full sm:w-auto transition-all"
          >
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-16 sm:pb-20 pt-24 sm:pt-28 md:pt-32">
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleAuthModalClose}
        initialMode={authMode}
        redirectFromKids={true}
        onAuthSuccess={handleAuthSuccess}
      />
      <main className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Hero */}
        <div className="mb-12 sm:mb-16">
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#74C69D] text-white shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.28),_transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.18),_transparent_50%)]" />
            <CardContent className="relative p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/80 mb-2">
                    <Sparkles className="w-4 h-4" />
                    Curated Learning Journeys
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-4">
                    Choose a Path Designed For Your Learner
                  </h1>
                  <p className="text-base sm:text-lg text-white/80 max-w-2xl">
                    Every program combines structured content, measurable goals, and consistent feedback. 
                    Select the age group that best matches your learner to get a tailored curriculum and guidance.
                  </p>
                </div>
                <div className="flex md:flex-col gap-3 md:items-end">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm text-white">
                    <Users className="w-4 h-4" />
                    Family dashboard friendly
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm text-white">
                    <BookOpen className="w-4 h-4" />
                    Guided curriculum updates weekly
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <SyncStatusIndicator showDetails={false} className="w-full md:w-auto bg-white/15 text-white backdrop-blur-sm" />
              </div>
            </CardContent>
          </Card>
          </div>

        {/* Age Category Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 mb-12">
          {ageCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card 
                key={category.id}
                className={cn(
                  "group relative overflow-hidden cursor-pointer rounded-3xl border border-transparent bg-transparent shadow-sm transition-all duration-300 hover:shadow-xl ring-1 ring-slate-200/60 dark:ring-slate-800/60",
                  category.accent.border
                )}
                onClick={() => {
                  navigate(category.route);
                }}
              >
                <div className={cn("absolute inset-0 bg-gradient-to-br", category.accent.cardBg)} />
                <div className={cn("absolute inset-y-0 right-[-25%] hidden w-3/4 rounded-full blur-3xl opacity-70 sm:block", `bg-gradient-to-br`, category.accent.cardOverlay)} />
                <CardContent className="relative p-6 sm:p-8 flex flex-col h-full">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'rounded-xl p-3 sm:p-4',
                        category.accent.badge
                      )}>
                        <IconComponent className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
                          {category.title}
                        </h3>
                        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-300">
                          {category.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col items-end text-sm text-slate-500 dark:text-slate-300">
                      <span className="font-medium text-slate-600 dark:text-slate-200">
                        {category.difficulty}
                      </span>
                      <span>{category.duration}</span>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    {category.description}
                  </p>

                  <div className="grid gap-4 sm:gap-5 mb-6 sm:grid-cols-2">
                    {category.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
                      >
                        <CheckCircle2 className={cn('w-4 h-4 mt-1 flex-shrink-0', category.accent.text)} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                    {[
                      { label: 'Stories', value: category.stats.stories },
                      { label: 'Interactive modules', value: category.stats.games },
                      { label: 'Vocabulary bank', value: category.stats.words }
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={cn(
                          'rounded-xl px-4 py-3 text-center transition-colors',
                          category.accent.statBg
                        )}
                      >
                        <div className="text-xl font-semibold text-slate-900 dark:text-white">
                          {item.value}
                        </div>
                        <div className={cn('text-xs font-medium mt-1 rounded-full px-3 py-1 inline-flex justify-center', category.accent.chip)}>
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-auto">
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-300">
                      <Target className={cn('w-4 h-4', category.accent.text)} />
                      <span className={cn('font-medium text-slate-700 dark:text-slate-200', category.accent.text)}>
                        {category.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-300">
                      <Clock className={cn('w-4 h-4', category.accent.text)} />
                      <span className="text-slate-600 dark:text-slate-200">{category.duration}</span>
                    </div>
                  </div>

                  <Button
                    className={cn(
                      'mt-6 w-full bg-gradient-to-r text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2',
                      category.accent.button
                    )}
                  >
                    <BookOpen className="w-4 h-4" />
                    Explore Program
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Comparison Table */}
        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
              Age Group Comparison
              </h3>
              <div className="text-sm text-slate-500 dark:text-slate-300">
                Distilled highlights to help you select the most suitable pathway.
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300">
                    <th className="text-left py-3 px-3 font-medium">Criteria</th>
                    <th className="text-left md:text-center py-3 px-3 font-medium text-sky-700 dark:text-sky-300">
                      Little Learners (4-10)
                    </th>
                    <th className="text-left md:text-center py-3 px-3 font-medium text-indigo-700 dark:text-indigo-300">
                      Teen Explorers (11-17)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">Story Themes</td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 md:text-center">Discovery, everyday heroes, values</td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 md:text-center">Innovation, global issues, career previews</td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">Vocabulary Level</td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 md:text-center">Early fluency, daily expressions</td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 md:text-center">Academic, persuasive, technical</td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">Session Length</td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 md:text-center">5 — 7 minutes</td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 md:text-center">9 — 15 minutes</td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">Facilitation Style</td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 md:text-center">Coach-led prompts and rewards</td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 md:text-center">Mentor guides with autonomous tasks</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">Learning Focus</td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 md:text-center">Confidence building, routine practice</td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 md:text-center">Critical thinking, future readiness</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <div className="mt-12">
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
            <CardContent className="p-6 sm:p-8 md:p-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-300 mb-2">
                    <Users className="w-4 h-4" />
                    Age-Appropriate Learning
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-3">
                    Designed for meaningful progress at every stage
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
                    Content specialists, language coaches, and curriculum designers collaborate on every module.
                    Each path balances engagement with measurable outcomes, ensuring learners stay motivated while parents see growth.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 text-sm w-full sm:max-w-sm">
                  <div className="flex gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 px-4 py-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                    <div className="text-slate-600 dark:text-slate-300">
                      <span className="font-medium text-slate-900 dark:text-white">Little Learners:</span> scaffolded vocabulary, guided speaking, evidence-based repetition.
                    </div>
                  </div>
                  <div className="flex gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 px-4 py-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                    <div className="text-slate-600 dark:text-slate-300">
                      <span className="font-medium text-slate-900 dark:text-white">Teen Explorers:</span> academic writing drills, collaborative projects, presentation labs.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default KidsPage;
