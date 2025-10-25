import { useState, useEffect } from 'react';
import { 
  Sparkles, Users, BookOpen,
  Star, Heart, Zap,
  Baby, Brain, Trophy,
  ArrowRight, Clock, Target
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
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);
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
      description: 'Magical stories, fun games, and exciting adventures for young minds!',
      features: [
        'Interactive fairy tale stories',
        'Simple vocabulary games',
        'Fun pronunciation practice',
        'Colorful animations & sounds'
      ],
      gradient: 'from-pink-400 to-purple-400',
      bgGradient: 'from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900',
      emoji: '🧸',
      icon: Baby,
      route: '/kids/young',
      stats: { stories: 10, games: 5, words: 200 },
      difficulty: 'Easy-Medium',
      duration: '5-7 min',
      sampleStories: ['Magic Forest', 'Unicorn Magic', 'Fairy Garden', 'Rainbow Castle'],
      sampleWords: ['rabbit', 'forest', 'magic', 'sparkle']
    },
    {
      id: 'teen-kids',
      title: 'Teen Explorers',
      subtitle: 'Ages 11-17',
      description: 'Advanced adventures, challenging games, and real-world English skills!',
      features: [
        'Adventure & mystery stories',
        'Advanced vocabulary building',
        'Conversation practice',
        'Real-world scenarios'
      ],
      gradient: 'from-blue-400 to-indigo-400',
      bgGradient: 'from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900',
      emoji: '🚀',
      icon: Brain,
      route: '/kids/teen',
      stats: { stories: 8, games: 7, words: 500 },
      difficulty: 'Medium-Hard',
      duration: '9-15 min',
      sampleStories: ['Mystery Detective', 'Environmental Hero', 'Tech Innovator', 'Future Leader'],
      sampleWords: ['investigate', 'innovation', 'sustainability', 'collaboration']
    }
  ];

  const handleElementClick = (elementId: string) => {
    setPulseAnimation(true);
    setTimeout(() => setPulseAnimation(false), 1000);
    console.log(`Clicked element: ${elementId}`);
  };

  const handleElementHover = (elementId: string) => {
    setHoveredElement(elementId);
  };

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
      <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 md:px-6">
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={handleAuthModalClose}
          initialMode={authMode}
          redirectFromKids={true}
          onAuthSuccess={handleAuthSuccess}
        />
        <div className="text-center p-4 sm:p-6 md:p-8 max-w-2xl w-full">
          <div className="animate-bounce mb-4 sm:mb-6">
            <Sparkles className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-yellow-500 mx-auto" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#118AB2] bg-clip-text text-transparent mb-3 sm:mb-4 md:mb-6 px-2">
            Welcome to Kids Learning Zone!
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 px-2">
            {authMode === 'login' 
              ? 'Please sign in to continue your magical learning adventure! 🎉' 
              : 'Create an account to start your magical learning adventure! 🎉'}
          </p>
          <Button 
            onClick={() => setShowAuthModal(true)}
            className="bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#4ECDC4] hover:to-[#FF6B6B] text-white font-bold py-3 sm:py-4 px-6 sm:px-8 md:px-10 rounded-xl sm:rounded-2xl text-sm sm:text-base md:text-lg w-full sm:w-auto transition-all hover:scale-105"
          >
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 sm:pb-20 pt-24 sm:pt-32 md:pt-40 relative overflow-hidden">
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleAuthModalClose}
        initialMode={authMode}
        redirectFromKids={true}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute top-10 left-4 sm:left-10 animate-float-slow">
          <Star className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-200/60 dark:text-yellow-700/60" />
        </div>
        <div className="absolute top-20 right-4 sm:right-20 animate-float-medium">
          <Heart className="w-10 h-10 sm:w-16 sm:h-16 text-pink-200/60 dark:text-pink-800/60" />
        </div>
        <div className="absolute bottom-20 left-4 sm:left-20 animate-float-fast">
          <Zap className="w-10 h-10 sm:w-14 sm:h-14 text-blue-300/60 dark:text-blue-600/60" />
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 relative">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 px-2">
            <div className="relative">
              <div className={cn(
                "absolute inset-0 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-full blur-md opacity-60 animate-pulse transition-all duration-300",
                pulseAnimation && "animate-ping"
              )}></div>
            </div>
            <h1 
              className={cn(
                "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#118AB2] bg-clip-text text-transparent cursor-pointer transition-all duration-300 hover:scale-105",
                pulseAnimation && "animate-pulse"
              )}
              onClick={() => {
                handleElementClick('title');
              }}
              onMouseEnter={() => handleElementHover('title')}
            >
              Kids Learning Zone
            </h1>
          </div>
          <p 
            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-500 dark:text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8 px-4 cursor-pointer transition-all duration-300 hover:text-gray-700 dark:hover:text-gray-100"
            onClick={() => handleElementClick('subtitle')}
            onMouseEnter={() => handleElementHover('subtitle')}
          >
            Choose your age group and start your amazing English learning journey!
          </p>
          
          {/* Sync Status */}
          <div className="mb-4 sm:mb-6 w-full max-w-full px-2 sm:px-0">
            <SyncStatusIndicator showDetails={false} className="w-full sm:w-auto" />
          </div>
        </div>

        {/* Age Category Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 mb-8 sm:mb-12 px-2 sm:px-0">
          {ageCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card 
                key={category.id}
                className={cn(
                  "group cursor-pointer bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-transparent hover:border-[#FF6B6B] transition-all duration-500 hover:shadow-2xl overflow-hidden w-full",
                  hoveredElement === `category-${category.id}` && "scale-105 shadow-2xl"
                )}
                onMouseEnter={() => handleElementHover(`category-${category.id}`)}
                onMouseLeave={() => setHoveredElement(null)}
                onClick={() => {
                  handleElementClick(`category-${category.id}`);
                  navigate(category.route);
                }}
              >
                <CardContent className="p-0 overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl">
                  <div className={cn(
                    "p-6 sm:p-8 md:p-10 relative overflow-hidden bg-gradient-to-br",
                    category.bgGradient
                  )}>
                    <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-white/20 dark:bg-black/20 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/20 dark:bg-black/20 rounded-full -ml-8 sm:-ml-12 -mb-8 sm:-mb-12"></div>
                    
                    <div className="relative z-10">
                      {/* Header */}
                      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className={cn(
                          "text-4xl sm:text-5xl md:text-6xl transition-all duration-300",
                          hoveredElement === `category-${category.id}` && "animate-bounce"
                        )}>
                          {category.emoji}
                        </div>
                        <div>
                          <h3 className={cn(
                            "text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white transition-all duration-300",
                            hoveredElement === `category-${category.id}` && "text-blue-600 dark:text-blue-400"
                          )}>
                            {category.title}
                          </h3>
                          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 font-semibold">
                            {category.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-700 dark:text-gray-200 mb-6 sm:mb-8">
                        {category.description}
                      </p>

                      {/* Features */}
                      <div className="mb-6 sm:mb-8">
                        <h4 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                          What you'll find:
                        </h4>
                        <ul className="space-y-2">
                          {category.features.map((feature, index) => (
                            <li key={index} className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-full flex-shrink-0"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Sample Content Preview */}
                      <div className="mb-6 sm:mb-8">
                        <h4 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                          Sample Stories:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {category.sampleStories.map((story, index) => (
                            <span key={index} className="text-xs px-2 py-1 bg-white/20 dark:bg-black/20 rounded-full text-gray-700 dark:text-gray-200">
                              {story}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Sample Words */}
                      <div className="mb-6 sm:mb-8">
                        <h4 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                          <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                          Sample Words:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {category.sampleWords.map((word, index) => (
                            <span key={index} className="text-xs px-2 py-1 bg-white/20 dark:bg-black/20 rounded-full text-gray-700 dark:text-gray-200">
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <div className="text-center">
                          <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                            {category.stats.stories}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            Stories
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                            {category.stats.games}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            Games
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                            {category.stats.words}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            Words
                          </div>
                        </div>
                      </div>

                      {/* Difficulty & Duration */}
                      <div className="flex items-center justify-between mb-6 sm:mb-8 text-sm">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-200 font-semibold">
                            {category.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-200 font-semibold">
                            {category.duration}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button 
                        className={cn(
                          "w-full bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#4ECDC4] hover:to-[#FF6B6B] text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 group-hover:shadow-xl relative overflow-hidden text-sm sm:text-base",
                          hoveredElement === `category-${category.id}` && "animate-pulse"
                        )}
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Start Learning
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                        </span>
                        <div className="absolute inset-0 bg-white/20 transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Comparison Table */}
        <Card className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm border-2 border-blue-200/50 dark:border-blue-600/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-6xl mx-auto mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
              Age Group Comparison
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 font-semibold text-gray-800 dark:text-white">Feature</th>
                  <th className="text-center py-3 px-2 font-semibold text-pink-600 dark:text-pink-400">Ages 4-10</th>
                  <th className="text-center py-3 px-2 font-semibold text-blue-600 dark:text-blue-400">Ages 11-17</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-2 font-medium text-gray-700 dark:text-gray-300">Story Themes</td>
                  <td className="py-3 px-2 text-center text-gray-600 dark:text-gray-400">Magic, Fairies, Animals</td>
                  <td className="py-3 px-2 text-center text-gray-600 dark:text-gray-400">Mystery, Technology, Real-world</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-2 font-medium text-gray-700 dark:text-gray-300">Vocabulary Level</td>
                  <td className="py-3 px-2 text-center text-gray-600 dark:text-gray-400">Basic, Simple Words</td>
                  <td className="py-3 px-2 text-center text-gray-600 dark:text-gray-400">Advanced, Complex Terms</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-2 font-medium text-gray-700 dark:text-gray-300">Story Duration</td>
                  <td className="py-3 px-2 text-center text-gray-600 dark:text-gray-400">5-7 minutes</td>
                  <td className="py-3 px-2 text-center text-gray-600 dark:text-gray-400">9-15 minutes</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-2 font-medium text-gray-700 dark:text-gray-300">Difficulty</td>
                  <td className="py-3 px-2 text-center text-gray-600 dark:text-gray-400">Easy-Medium</td>
                  <td className="py-3 px-2 text-center text-gray-600 dark:text-gray-400">Medium-Hard</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-2 font-medium text-gray-700 dark:text-gray-300">Learning Focus</td>
                  <td className="py-3 px-2 text-center text-gray-600 dark:text-gray-400">Fun, Playful Learning</td>
                  <td className="py-3 px-2 text-center text-gray-600 dark:text-gray-400">Critical Thinking, Real Skills</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Info */}
        <div className="text-center px-4 sm:px-6">
          <Card className="bg-gradient-to-r from-green-50/50 to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-600/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                Age-Appropriate Learning
              </h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
              Our content is carefully designed for different age groups to ensure the best learning experience!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>Ages 4-10:</strong> Simple stories, basic vocabulary, fun games
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>Ages 11-17:</strong> Complex stories, advanced vocabulary, real-world scenarios
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float-slow {
          animation: float-slow 3s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 2.5s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default KidsPage;
