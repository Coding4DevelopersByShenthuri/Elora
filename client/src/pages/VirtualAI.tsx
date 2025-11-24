import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Clock,
  Crown,
  Home as HomeIcon,
  Lock,
  Play,
  User as UserIcon,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AnimatedTransition } from '@/components/common/AnimatedTransition';
import { cn } from '@/lib/utils';
import { speakTutorLine, isVirtualAITtsSupported } from '@/services/VirtualAITutorTTS';

const STORAGE_KEY = 'elora_virtual_ai_user_name';

type UnitStatus = 'current' | 'locked' | 'completed';

type LearningUnit = {
  id: string;
  title: string;
  subtitle: string;
  status: UnitStatus;
  duration: string;
};

type TutorId =
  | 'elora'
  | 'elora-x'
  | 'mateo'
  | 'hazel'
  | 'skye'
  | 'jasmine'
  | 'darius'
  | 'aiko'
  | 'anisha'
  | 'reina'
  | 'layla'
  | 'santa-claus'
  | 'mrs-claus';

type Tutor = {
  id: TutorId;
  name: string;
  role: string;
  accent: string;
  description: string;
  imageSrc: string;
  traits: string[];
  tags: string[];
};

const TAG_EMOJI: Record<string, string> = {
  General: '💬',
  'US English': '🇺🇸',
  Business: '💼',
  Academic: '🎓',
  Travel: '✈️',
  Social: '🤝',
  Pronunciation: '🗣️',
  Listening: '🎧',
  Fluency: '⚡',
  Speaking: '🗨️',
  Career: '📈',
  Presentations: '📊',
  Stories: '📖',
  Conversation: '🗣️',
  'Daily life': '🏠',
  'Small talk': '💭',
  Interviews: '🎤',
  Confidence: '💪',
  'Exam prep': '📝',
  Abroad: '🌍',
  Holiday: '🎄',
};

const TUTORS: Tutor[] = [
  {
    id: 'elora',
    name: 'Elora',
    role: 'Lead tutor',
    accent: 'American',
    description: 'Growing up in a family passionate about education, Elora always felt inspired to teach. She believes that learning a language opens doors to new worlds and strives to make English accessible and enjoyable. Known for her patient, attentive approach, she helps each student progress at their own pace, fostering confidence.',
    imageSrc: '/American.jpg',
    traits: ['Patient', 'Methodical', 'Supportive'],
    tags: ['General', 'US English'],
  },
  {
    id: 'elora-x',
    name: 'Elora-X',
    role: 'AI tutor',
    accent: 'Machine',
    description:'Built by a team of innovative engineers, Elora-X was designed to assist humans in mastering communication. With their advanced knowledge of linguistics and AI-powered adaptability, Elora-X specializes in breaking down even the trickiest aspects of English, guiding students toward success with patience, precision, and a touch of digital charm.',
    imageSrc: '/Learna-X.jpg',
    traits: ['Logical', 'Encouraging', 'Adaptable'],
    tags: ['Business', 'Academic'],
  },
  {
    id: 'mateo',
    name: 'Mateo',
    role: 'Conversation partner',
    accent: 'Latin American English',
    description: 'Originally from Madrid, Mateo has a background in linguistics and a love for travel. His experiences meeting people from various cultures have made him a versatile teacher who enjoys helping students find their voice in English.',
    imageSrc: '/Mateo.jpg',
    traits: ['Friendly', 'Relaxed', 'Confident'],
    tags: ['Travel', 'Social'],
  },
  {
    id: 'aiko',
    name: 'Aiko',
    role: 'Listening & speaking coach',
    accent: 'Japanese English',
    description: "Originally from Tokyo, Aiko studied English literature and teaching, with a strong background inlinguistic research. She understands the demands of academic English and is passionate about helping students master complex concepts and achieve their academic goals.",
    imageSrc: '/Aiko.jpg',
    traits: ['Calm', 'Patient', 'Precise'],
    tags: ['Pronunciation', 'Listening'],
  },
  {
    id: 'anisha',
    name: 'Anisha',
    role: 'Fluency booster',
    accent: 'Indian English',
    description: "Originally from India, Anisha has traveled across several countries, teaching English and learning about different cultures. Her love for languages and personal experience as a language learner help her relate to her students' challenges and triumphs.",
    imageSrc: '/Anisha.jpg',
    traits: ['Dynamic', 'Fast-paced', 'Motivating'],
    tags: ['Fluency', 'Speaking'],
  },
  {
    id: 'darius',
    name: 'Darius',
    role: 'Confidence coach',
    accent: 'African English',
    description: 'Grew up in Chicago, Darius has a background in corporate communication. His passion for language and professionalism led him to teaching, where he helps students master English for their careers. He is dedicated to make learning applicable and relevant.',
    imageSrc: '/Darius.jpg',
    traits: ['Encouraging', 'Clear', 'Supportive'],
    tags: ['Career', 'Presentations'],
  },
  {
    id: 'hazel',
    name: 'Hazel',
    role: 'Storytelling coach',
    accent: 'British English',
    description: "Growing up in a small coastal town, Hazel developed a love for stories and languages early on. She's passionate about helping students express themselves in English and brings a fresh and natural perspective to learning. Her laid-back, friendly approach helps students feel at ease.",
    imageSrc: '/Hazel.jpg',
    traits: ['Creative', 'Imaginative', 'Warm'],
    tags: ['Stories', 'Conversation'],
  },
  {
    id: 'jasmine',
    name: 'Jasmine',
    role: 'Everyday English tutor',
    accent: 'Neutral English',
    description: 'Hailing from New Orleans, Jasmine grew up in a diverse, multicultural community, sparking her interest in languages and cultural connections. Her teaching style is relaxed and engaging, helping students feel confident in expressing themselves authentically.',
    imageSrc: '/Jasmine.jpg',
    traits: ['Relaxed', 'Friendly', 'Clear'],
    tags: ['Daily life', 'Small talk'],
  },
  {
    id: 'layla',
    name: 'Layla',
    role: 'Professional English coach',
    accent: 'Middle Eastern English',
    description: 'Growing up in Jordan, Layla has always been passionate about language and cultural exchange. After studying linguistics and teaching English abroad, she loves helping students from diverse backgrounds feel empowered and confident in their English skills. Layla bridges cultural and language gaps seamlessly, making her lessons both practical and inspiring.',
    imageSrc: '/Layla.jpg',
    traits: ['Professional', 'Structured', 'Supportive'],
    tags: ['Business', 'Interviews'],
  },
  {
    id: 'reina',
    name: 'Reina',
    role: 'Friendly conversation partner',
    accent: 'Latin American English',
    description: 'Raised in a vibrant neighborhood in Miami, Reina grew up bilingual and loves teaching students English. Known for her adventurous spirit, she has a passion for making each lesson feel like a journey, inspiring students to see language learning as an exciting, fearless pursuit.',
    imageSrc: '/Reina.jpg',
    traits: ['Cheerful', 'Chatty', 'Reassuring'],
    tags: ['Social', 'Confidence'],
  },
  {
    id: 'skye',
    name: 'Skye',
    role: 'Fast‑paced speaking coach',
    accent: 'North American English',
    description: 'Growing up along the Australian coast, Skye was always curious about the world. She spent years studying and working abroad, gaining firsthand experience in navigating different educational systems and cultural settings. Skye loves helping students prepare for their own journeys, providing practical advice and encouragement to help them thrive in new environments.',
    imageSrc: '/Skye.jpg',
    traits: ['Energetic', 'Direct', 'Motivating'],
    tags: ['Exam prep', 'Abroad'],
  },
  {
    id: 'santa-claus',
    name: 'Santa Claus',
    role: 'Holiday guest tutor',
    accent: 'Jolly North Pole English',
    description: "Santa Claus is a jolly, old man who loves to spread joy and happiness. He's known for his generous spirit and his ability to bring smiles to children's faces. Santa's cheerful demeanor and warm heart make him a beloved figure in the holiday season.",
    imageSrc: '/Santa Claus.jpg',
    traits: ['Jolly', 'Warm', 'Playful'],
    tags: ['Stories', 'Holiday'],
  },
  {
    id: 'mrs-claus',
    name: 'Mrs Claus',
    role: 'Holiday storytelling tutor',
    accent: 'Warm North Pole English',
    description: "Mrs. Claus is Santa's wife, and she shares his love for spreading happiness. Known for her kindness and patience, she helps Santa prepare for the holiday season, ensuring that every child receives a gift. Her cheerful, supportive nature makes her a valuable partner in Santa's work.",
    imageSrc: '/Mrs Claus.jpg',
    traits: ['Kind', 'Patient', 'Gentle'],
    tags: ['Holiday', 'Stories'],
  },
];

const BEGINNER_UNITS: LearningUnit[] = [
  {
    id: 'greetings',
    title: 'Greetings',
    subtitle: 'Start here',
    status: 'current',
    duration: '15 min',
  },
  {
    id: 'jobs',
    title: 'Jobs',
    subtitle: 'Talk about work',
    status: 'locked',
    duration: '18 min',
  },
  {
    id: 'introductions-1',
    title: 'Introductions I',
    subtitle: 'Share who you are',
    status: 'locked',
    duration: '20 min',
  },
  {
    id: 'favourite-room',
    title: 'A Favourite Room',
    subtitle: 'Describe your space',
    status: 'locked',
    duration: '15 min',
  },
  {
    id: 'fruits',
    title: 'Fruits',
    subtitle: 'Everyday vocabulary',
    status: 'locked',
    duration: '12 min',
  },
  {
    id: 'daily-routine-1',
    title: 'Daily Routine I',
    subtitle: 'Talk about your day',
    status: 'locked',
    duration: '18 min',
  },
];

export default function VirtualAI() {
  const [userName, setUserName] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [showNameInput, setShowNameInput] = useState(true); // Default to showing name input
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [typingAnimation, setTypingAnimation] = useState('');
  const [activeUnitIndex, setActiveUnitIndex] = useState(0);
  const [selectedTutorId, setSelectedTutorId] = useState<TutorId>('elora-x');
  const [isTutorDialogOpen, setIsTutorDialogOpen] = useState(false);
  const [isTutorSpeaking, setIsTutorSpeaking] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const nameTagRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already provided their name
    const savedName = localStorage.getItem(STORAGE_KEY);
    console.log('VirtualAI: Checking for saved name:', savedName); // Debug log
    if (savedName && savedName.trim()) {
      setUserName(savedName.trim());
      setShowNameInput(false);
      console.log('VirtualAI: Found saved name, hiding input screen'); // Debug log
    } else {
      // First visit - show name input
      setShowNameInput(true);
      console.log('VirtualAI: No saved name, showing input screen'); // Debug log
    }
    setIsInitialized(true);
  }, []);

  // Real-time typing animation effect
  useEffect(() => {
    if (inputValue.trim()) {
      let currentIndex = 0;
      const name = inputValue.trim();
      setTypingAnimation('');
      
      const typingInterval = setInterval(() => {
        if (currentIndex < name.length) {
          setTypingAnimation(name.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
        }
      }, 50); // Typing speed

      return () => clearInterval(typingInterval);
    } else {
      setTypingAnimation('');
    }
  }, [inputValue]);


  const handleContinue = () => {
    if (inputValue.trim()) {
      const name = inputValue.trim();
      // Save the name to localStorage
      localStorage.setItem(STORAGE_KEY, name);
      setUserName(name);
      setShowNameInput(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      handleContinue();
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleTutorSpeak = async () => {
    try {
      setTtsError(null);
      if (!isVirtualAITtsSupported()) {
        setTtsError('Voice is not available on this device.');
        return;
      }

      const tutor =
        TUTORS.find((t) => t.id === selectedTutorId) ?? TUTORS[1] ?? TUTORS[0];

      const introLine = userName
        ? `Hi ${userName}, I'm ${tutor.name}, your ${tutor.role}. Let's practice speaking together.`
        : `Hi, I'm ${tutor.name}, your ${tutor.role}. Let's practice speaking together.`;

      setIsTutorSpeaking(true);
      await speakTutorLine(tutor.id, introLine);
    } catch (error) {
      console.error('VirtualAI tutor TTS failed:', error);
      setTtsError('Sorry, I could not play the tutor voice.');
    } finally {
      setIsTutorSpeaking(false);
    }
  };

  // Wait for initialization to prevent flash
  if (!isInitialized) {
    return null; // Return null during initialization to prevent flash
  }

  // If user has provided their name, show the main Virtual AI interface
  if (!showNameInput && userName) {
    const activeUnit = BEGINNER_UNITS[activeUnitIndex] ?? BEGINNER_UNITS[0];
    const selectedTutor =
      TUTORS.find((tutor) => tutor.id === selectedTutorId) ?? TUTORS[1] ?? TUTORS[0];

    return (
      <AnimatedTransition show={true}>
        <div className="min-h-screen pt-28 sm:pt-32 lg:pt-36 pb-10 px-4">
          <div className="container mx-auto max-w-6xl grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            {/* Left sidebar */}
            <div className="w-full lg:col-span-3 space-y-4">
              <Card className="bg-card/90 shadow-md border border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <HomeIcon className="h-4 w-4 text-primary" />
                    <span>Home</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-primary bg-primary/5 font-medium"
                  >
                    <HomeIcon className="h-4 w-4" />
                    <span>Home</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-muted-foreground hover:bg-muted/60 transition-colors"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Progress</span>
                  </button>
                </CardContent>
              </Card>

              <Card className="bg-card/90 shadow-md border border-border/60">
                <CardContent className="pt-4 pb-4 space-y-4">
                  <div className="space-y-1 text-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Course
                    </p>
                    <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                          GB
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            English
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Beginner track
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Profile
                    </p>
                    <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/90 text-sm font-semibold text-primary-foreground">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {userName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Virtual AI learner
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full justify-between bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md hover:from-primary/90 hover:to-primary"
                    onClick={() => navigate('/pricing')}
                  >
                    <span className="flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      <span>Upgrade to Pro</span>
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-between text-xs text-muted-foreground"
                    onClick={() => {
                      localStorage.removeItem(STORAGE_KEY);
                      setShowNameInput(true);
                      setUserName('');
                      setInputValue('');
                    }}
                  >
                    <span>Change name</span>
                    <UserIcon className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Center: course path */}
            <div className="flex-1 w-full lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    Hello, {userName}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Let&apos;s continue your beginner journey.
                  </p>
                </div>
              </div>

              <Card className="bg-card/90 shadow-md border border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        Beginner
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Speaking path
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{activeUnit.duration} • Next up</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative flex flex-col items-center gap-6 py-4">
                    {/* Vertical path line */}
                    <div className="pointer-events-none absolute left-1/2 top-0 h-full w-40 -translate-x-1/2">
                      <div className="mx-auto h-full w-px rounded-full bg-gradient-to-b from-primary/40 via-muted-foreground/20 to-muted/40" />
                    </div>

                    {BEGINNER_UNITS.map((unit, index) => {
                      const isActive = index === activeUnitIndex;
                      const isLocked = unit.status === 'locked';

                      return (
                        <button
                          key={unit.id}
                          type="button"
                          disabled={isLocked}
                          onClick={() => {
                            if (!isLocked) {
                              setActiveUnitIndex(index);
                            }
                          }}
                          className={cn(
                            'relative z-10 flex w-full max-w-md items-center gap-4 rounded-full border px-4 py-3 text-left transition-all',
                            isActive
                              ? 'border-primary bg-primary/10 shadow-md'
                              : 'border-muted bg-background/80 hover:bg-muted/60',
                            isLocked && 'cursor-not-allowed opacity-60',
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-11 w-11 items-center justify-center rounded-full border text-base font-semibold',
                              isActive
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-muted-foreground/20 bg-muted/80 text-muted-foreground',
                            )}
                          >
                            {isLocked ? <Lock className="h-4 w-4" /> : index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">
                              {unit.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {unit.subtitle}
                            </p>
                          </div>
                          <div className="flex flex-col items-end text-xs text-muted-foreground">
                            <span>{unit.duration}</span>
                            {isLocked && <span>Locked</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active unit details */}
                  <div className="mt-6 rounded-2xl bg-muted/70 px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Next activity
                        </p>
                        <h2 className="text-lg font-semibold text-foreground">
                          {activeUnit.title}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Warm up with short, real-life phrases for everyday conversations.
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-xs text-muted-foreground">
                          Estimated time: {activeUnit.duration}
                        </p>
                        <Button
                          size="sm"
                          className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                          onClick={() => navigate('/lessons/1')}
                        >
                          <Play className="h-4 w-4" />
                          <span>Start lesson</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: tutor & video panel */}
            <div className="w-full lg:col-span-4 space-y-4">
              <Dialog open={isTutorDialogOpen} onOpenChange={setIsTutorDialogOpen}>
                <Card className="overflow-hidden bg-card/90 shadow-md border border-border/60">
                  <div className="relative aspect-video w-full bg-gradient-to-br from-sky-700 via-sky-800 to-slate-900">
                    <img
                      src={selectedTutor.imageSrc}
                      alt={selectedTutor.name}
                      className={cn(
                        'h-full w-full object-cover opacity-90 transition-transform',
                        isTutorSpeaking && 'scale-[1.02]',
                      )}
                    />
                    <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                      00:00
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                  </div>
                  <CardContent className="space-y-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsTutorDialogOpen(true)}
                      className="flex w-full items-center gap-3 rounded-2xl bg-muted/60 px-3 py-3 text-left shadow-sm transition-colors hover:bg-muted"
                    >
                      <Avatar
                        className={cn(
                          'h-13 w-14 border border-border/60 shadow-sm transition-transform',
                          isTutorSpeaking &&
                            'animate-pulse scale-[1.05] ring-2 ring-primary/60 ring-offset-2 ring-offset-background',
                        )}
                      >
                        <AvatarImage src={selectedTutor.imageSrc} alt={selectedTutor.name} />
                        <AvatarFallback>{selectedTutor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Your tutor
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {selectedTutor.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedTutor.accent}
                          {isTutorSpeaking && ' • Speaking'}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <p className="text-xs text-muted-foreground">
                      Short speaking sprints, pronunciation checks, and friendly feedback –
                      tailored to your level.
                    </p>
                    <Button
                      variant="outline"
                      className="flex w-full items-center justify-between rounded-xl border-dashed"
                      type="button"
                    >
                      <span className="flex items-center gap-2 text-sm">
                        <Play className="h-4 w-4 text-primary" />
                        <span>Start a quick practice</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </CardContent>
                </Card>

                <DialogContent
                  className="max-w-3xl w-[86vw] max-h-[86vh] overflow-hidden border-none bg-background p-0 shadow-2xl sm:rounded-3xl flex flex-col"
                  title="Choose your tutor"
                  description="Select the tutor personality you want to practice with."
                >
                  <DialogHeader className="border-b bg-gradient-to-r from-sky-700 via-sky-800 to-slate-900 px-6 py-6 text-white sm:px-10 sm:py-7">
                    <div className="grid gap-6 items-center sm:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)]">
                      <div className="relative mx-auto aspect-[4/3] w-full max-w-sm overflow-hidden rounded-2xl bg-slate-900/60 shadow-xl">
                        <img
                          src={selectedTutor.imageSrc}
                          alt={selectedTutor.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <button
                          type="button"
                          onClick={handleTutorSpeak}
                          disabled={isTutorSpeaking}
                          className={cn(
                            'absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-sky-700 shadow-lg transition-transform',
                            isTutorSpeaking && 'animate-pulse scale-[1.05]',
                          )}
                        >
                          <Volume2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        <DialogTitle className="text-2xl font-semibold sm:text-3xl">
                          {selectedTutor.name}
                        </DialogTitle>
                        <p className="text-xs font-semibold uppercase tracking-wide text-sky-100/80">
                          {selectedTutor.accent} • {selectedTutor.role}
                        </p>
                        <p className="max-w-xl text-sm leading-relaxed text-sky-50/90">
                          {selectedTutor.description}
                        </p>
                      </div>
                    </div>
                </DialogHeader>

                {/* Scrollable content area for tutors */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="space-y-4 px-5 pt-4 pb-5 sm:px-10 sm:pt-5 sm:pb-7 h-full flex flex-col">
                      <div className="space-y-2">
                        <p className="text-base font-semibold text-foreground">Select Tutor</p>
                        <p className="text-xs text-muted-foreground">
                          Choose the tutor you want to practice with. You can switch at any time.
                        </p>
                      </div>
                      {ttsError && (
                        <p className="text-xs text-red-500" role="alert">
                          {ttsError}
                        </p>
                      )}
                      <div className="mx-auto w-full max-w-4xl flex-1">
                        <div className="grid gap-4 pr-2 pb-2 sm:grid-cols-3">
                          {TUTORS.map((tutor) => {
                            const isActive = tutor.id === selectedTutorId;
                            return (
                              <button
                                key={tutor.id}
                                type="button"
                                onClick={() => setSelectedTutorId(tutor.id)}
                                className={cn(
                                  'flex flex-col items-stretch overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all',
                                  isActive
                                    ? 'border-sky-500 ring-2 ring-sky-200'
                                    : 'border-border/70 hover:border-sky-300 hover:shadow-md',
                                )}
                              >
                                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                                  <img
                                    src={tutor.imageSrc}
                                    alt={tutor.name}
                                    className="h-full w-full object-cover"
                                  />
                                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                </div>
                                <div className="flex flex-col gap-1 px-3 py-3">
                                  <p className="truncate text-sm font-semibold text-foreground">
                                    {tutor.name}
                                  </p>
                                  <p className="truncate text-[11px] text-muted-foreground">
                                    {tutor.accent}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">
                                    {tutor.traits.join(' • ')}
                                  </p>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {tutor.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700"
                                      >
                                        <span className="mr-1">
                                          {TAG_EMOJI[tag] ?? '•'}
                                        </span>
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="border-t bg-muted/40 px-5 py-4 sm:px-10 sm:py-5">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-muted-foreground">
                        You can switch tutors anytime. Your progress stays the same.
                      </p>
                      <div className="flex w-full gap-2 sm:w-auto">
                        <Button
                          variant="outline"
                          className="flex-1 sm:flex-none"
                          type="button"
                          onClick={() => setIsTutorDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1 sm:flex-none"
                          type="button"
                          onClick={() => setIsTutorDialogOpen(false)}
                        >
                          Continue with Elora
                        </Button>
                      </div>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Card className="bg-card/90 shadow-md border border-border/60">
                <CardContent className="space-y-2 pt-4 pb-4 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">
                    Tip for today
                  </p>
                  <p>
                    Try saying your introduction out loud three times. Focus on clear pauses:
                    <span className="font-semibold"> name • role • purpose</span>.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AnimatedTransition>
    );
  }

  // Show name input screen (first visit)
  return (
    <AnimatedTransition show={true}>
      <div className="min-h-screen flex flex-col relative">
        {/* Navigation Button */}
        <div className="absolute top-0 left-0 px-4 py-3 sm:py-4 pt-20 sm:pt-24 lg:pt-28 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-full hover:bg-primary/10 text-primary h-8 w-8 sm:h-9 sm:w-9 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Split Screen Container - Header and Content */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-screen pt-20 sm:pt-24 lg:pt-28">
          {/* Left Panel - Light Blue Background */}
          <div className="w-full lg:w-1/2 bg-sky-100 dark:bg-sky-900/30 flex flex-col">
            {/* Name Tag Content */}
            <div className="flex-1 flex items-start lg:items-start justify-center p-4 sm:p-8 lg:p-12 xl:p-16 lg:pt-24 xl:pt-28 relative overflow-hidden">
            {/* Background floating particles */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-blue-300/30 rounded-full animate-float-particle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${3 + Math.random() * 4}s`,
                  }}
                />
              ))}
            </div>
            
            <div className="max-w-md w-full py-4 sm:py-6 lg:py-8 relative z-10">
              {/* Name Tag Card */}
              <div 
                className="relative group"
                ref={nameTagRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* Enhanced 3D Shadow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-xl sm:rounded-2xl blur-2xl transform rotate-[-2deg] opacity-50 group-hover:opacity-75 transition-opacity duration-500 -z-10"></div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden transform rotate-[-2deg] group-hover:rotate-0 transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative"
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px',
                  }}
                >
                  {/* Animated Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10 animate-pulse"></div>
                  
                  {/* Name Tag Header - Blue Section */}
                  <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 p-4 sm:p-6 relative overflow-hidden group-hover:from-blue-500 group-hover:via-blue-400 group-hover:to-blue-500 transition-all duration-500">
                    {/* Animated Background Gradient Shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <div className="relative z-10">
                      {/* HELLO Text with Enhanced Interactive Effects */}
                      <h2 
                        className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white text-center mb-1 sm:mb-2 tracking-tight transition-all duration-300 transform group-hover:scale-110"
                        style={{
                          textShadow: isHovered 
                            ? '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)' 
                            : '0 2px 4px rgba(0,0,0,0.2)',
                          filter: isHovered ? 'brightness(1.2)' : 'brightness(1)',
                        }}
                      >
                        <span className="inline-block animate-hello-bounce">H</span>
                        <span className="inline-block animate-hello-bounce" style={{ animationDelay: '0.1s' }}>E</span>
                        <span className="inline-block animate-hello-bounce" style={{ animationDelay: '0.2s' }}>L</span>
                        <span className="inline-block animate-hello-bounce" style={{ animationDelay: '0.3s' }}>L</span>
                        <span className="inline-block animate-hello-bounce" style={{ animationDelay: '0.4s' }}>O</span>
                      </h2>
                      
                      {/* MY NAME IS Text with Enhanced Animation */}
                      <p 
                        className="text-[10px] sm:text-xs text-white/95 text-center font-semibold tracking-widest uppercase transition-all duration-300"
                        style={{
                          opacity: isHovered ? 1 : 0.95,
                          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        }}
                      >
                        +MY NAME IS+
                      </p>
                    </div>
                  </div>
                  
                  {/* Name Tag Body - White Section with Typing Effect */}
                  <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 min-h-[100px] sm:min-h-[120px] md:min-h-[140px] flex items-center justify-center transition-all duration-300 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 relative overflow-hidden">
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(59, 130, 246, 0.1) 10px, rgba(59, 130, 246, 0.1) 20px)',
                      }}></div>
                    </div>
                    
                    {typingAnimation || inputValue.trim() ? (
                      <div className="text-foreground text-center animate-fade-in relative z-10">
                        <p 
                          className="text-lg sm:text-xl md:text-2xl font-bold break-words px-2 transform group-hover:scale-105 transition-transform duration-300 text-black dark:text-gray-900"
                          style={{
                            fontFamily: "'Dancing Script', 'Brush Script MT', 'Lucida Handwriting', 'Kalam', cursive",
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                          }}
                        >
                          {typingAnimation || inputValue.trim()}
                          {typingAnimation && typingAnimation.length < inputValue.trim().length && (
                            <span className="inline-block w-0.5 h-6 bg-black dark:bg-gray-900 ml-1 animate-blink"></span>
                          )}
                        </p>
                      </div>
                    ) : (
                      <div className="text-muted-foreground/60 text-center relative z-10">
                        <p className="text-xs sm:text-sm italic animate-pulse">Your name will appear here</p>
                      </div>
                    )}
                    
                    {/* Celebration particles when name is entered */}
                    {inputValue.trim() && !typingAnimation && (
                      <div className="absolute inset-0 pointer-events-none">
                        {Array.from({ length: 15 }).map((_, i) => {
                          const angle = (i / 15) * Math.PI * 2;
                          const distance = 80 + Math.random() * 40;
                          const x = Math.cos(angle) * distance;
                          const y = Math.sin(angle) * distance;
                          return (
                            <div
                              key={i}
                              className="absolute w-2 h-2 rounded-full animate-celebration"
                              style={{
                                left: '50%',
                                top: '50%',
                                background: ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'][i % 4],
                                animationDelay: `${i * 0.05}s`,
                                '--end-x': `${x}px`,
                                '--end-y': `${y}px`,
                              } as React.CSSProperties}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Enhanced Animated Decorative icon in bottom-left */}
                <div 
                  className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-xl transform rotate-[-5deg] group-hover:rotate-[5deg] group-hover:scale-110 transition-all duration-300 group-hover:shadow-blue-500/50 z-20"
                  style={{
                    filter: isHovered ? 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.6))' : 'none',
                  }}
                >
                  <div className="text-white text-lg sm:text-xl md:text-2xl font-bold group-hover:animate-spin transition-transform duration-300">Q</div>
                </div>
                
                {/* Enhanced Floating Particles Effect */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full animate-particle-float"
                      style={{
                        width: `${4 + Math.random() * 4}px`,
                        height: `${4 + Math.random() * 4}px`,
                        background: ['#3b82f6', '#8b5cf6', '#ec4899'][i % 3],
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${2 + Math.random() * 2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Right Panel - White Background */}
          <div className="w-full lg:w-1/2 bg-white dark:bg-gray-900 flex flex-col">
            {/* Form Content */}
            <div className="flex-1 flex items-start lg:items-start justify-center p-4 sm:p-8 lg:p-12 xl:p-16 lg:pt-24 xl:pt-28">
              <div className="max-w-md w-full space-y-6 sm:space-y-8 md:space-y-10 py-4 sm:py-6 lg:py-8">
              {/* Question - Aligned with HELLO section */}
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-3">
                  What's your name?
                </h1>
              </div>

              {/* Input Field */}
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg px-4 sm:px-5 rounded-lg sm:rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground/60 shadow-sm"
                  autoFocus
                />

                {/* Continue Button */}
                <Button
                  onClick={handleContinue}
                  disabled={!inputValue.trim()}
                  className={cn(
                    "w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-lg sm:rounded-xl shadow-lg",
                    "bg-gradient-to-r from-blue-500 to-blue-600",
                    "hover:from-blue-600 hover:to-blue-700",
                    "text-white border-0",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-blue-600",
                    "transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  Continue
                </Button>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes sparkle-float {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1) rotate(0deg);
            opacity: 0.6;
          }
          25% {
            transform: translateY(-15px) translateX(5px) scale(1.3) rotate(90deg);
            opacity: 1;
          }
          50% {
            transform: translateY(-20px) translateX(-5px) scale(1.1) rotate(180deg);
            opacity: 0.9;
          }
          75% {
            transform: translateY(-10px) translateX(3px) scale(1.2) rotate(270deg);
            opacity: 1;
          }
        }
        
        @keyframes hello-bounce {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.1);
          }
        }
        
        @keyframes float-particle {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }
        
        @keyframes particle-float {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-50px) translateX(30px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes celebration {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(var(--end-x, 100px), var(--end-y, 100px)) scale(0) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes blink {
          0%, 50% {
            opacity: 1;
          }
          51%, 100% {
            opacity: 0;
          }
        }
        
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 60px rgba(147, 51, 234, 0.5);
          }
        }
        
        .animate-sparkle-float {
          animation: sparkle-float 3s ease-in-out infinite;
        }
        
        .animate-hello-bounce {
          animation: hello-bounce 2s ease-in-out infinite;
        }
        
        .animate-float-particle {
          animation: float-particle 8s linear infinite;
        }
        
        .animate-particle-float {
          animation: particle-float 3s ease-out infinite;
        }
        
        .animate-celebration {
          animation: celebration 1.5s ease-out forwards;
        }
        
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </AnimatedTransition>
  );
}

