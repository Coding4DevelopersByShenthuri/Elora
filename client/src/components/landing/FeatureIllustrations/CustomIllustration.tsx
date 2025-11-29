// CustomIllustration.tsx
import React from 'react';
import { FeatureIcon } from './FeatureIcon';
import { cn } from '@/lib/utils';
import {
  FileText, Database, FileUp, ArrowRight, Puzzle, Layers, Brain, Mic, Users, Search,
  Lock, Award, Grid, BookOpen, Zap, Sun, Moon, Sparkles, MessageSquare, TrendingUp, Trophy, Star, Medal
} from 'lucide-react';

interface CustomIllustrationProps {
  featureIndex: number;
  className?: string;
}

export const CustomIllustration: React.FC<CustomIllustrationProps> = ({
  featureIndex,
  className
}) => {
  const bgColors = [
    'from-blue-500/20 to-purple-500/20',
    'from-teal-500/20 to-blue-500/20',
    'from-purple-500/20 to-pink-500/20',
    'from-indigo-500/20 to-blue-500/20',
    'from-amber-500/20 to-orange-500/20',
    'from-teal-500/20 to-teal-600/20',
    'from-blue-500/20 to-indigo-500/20',
    'from-violet-500/20 to-purple-500/20',
    'from-emerald-500/20 to-teal-500/20',
    'from-rose-500/20 to-pink-500/20',
    'from-cyan-500/20 to-blue-500/20',
    'from-orange-500/20 to-amber-500/20',
    'from-sky-500/20 to-cyan-500/20',
    'from-cyan-500/20 to-teal-500/20',
    'from-fuchsia-500/20 to-pink-500/20',
    'from-yellow-500/20 to-amber-500/20'
  ];

  const titles = [
    "Online First", "Voice Recognition", "AI Coaching", "Learning Levels", "Intelligence",
    "Interactive Dialogues", "Progress Tracking", "Search", "Contextual Learning",
    "Private & Secure", "Gamified Practice", "D/L mode", "Multi-Mode Practice",
    "Online Dictionary", "Roleplay Modes"
  ];

  const descriptions = [
    "Practice anywhere with an AI coach powered by always-on cloud intelligence.",
    "Speak naturally and get instant feedback on pronunciation and fluency.",
    "Personalized guidance on grammar, vocabulary, and sentence structure.",
    "Beginner, intermediate, and advanced modes tailored to your journey.",
    "AI-powered insights that extract what they mention from every pinned topic.",
    "Collect data from any source or device directly into your second brain.",
    "Clip any type of content with built-in extraction tools.",
    "Find what you're looking for with intelligent, precision-focused search capabilities.",
    "Keep all your work secure in a private, controlled space.",
    "Identify and extract text from images, videos, and more.",
    "Share thoughts and ideas to collaborate seamlessly.",
    "Toggle between dark and simplified interface with custom color modes for focus.",
    "Switch between multiple learning modes for better practice.",
    "Access a live dictionary anytime for quick reference.",
    "Engage in roleplay scenarios to boost conversational skills."
  ];

  const bgColor = bgColors[featureIndex % bgColors.length];
  const title = titles[featureIndex % titles.length];
  const description = descriptions[featureIndex % descriptions.length];

  const renderDiagram = (index: number) => {
    switch (index) {
      case 0: // Online First
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">

      {/* Main Neural Hub */}
      <div className="neural-node w-24 h-24 flex items-center justify-center mb-6 shimmer">
        <Brain className="text-primary w-12 h-12 animate-pulse" />
      </div>

      {/* Document, Data, Import Panels */}
      <div className="grid grid-cols-3 gap-6 w-3/4">
        <div className="glass-panel shimmer p-3 rounded-md flex flex-col items-center">
          <FileText className="text-primary w-10 h-10 mb-2 animate-pulse" />
          <span className="text-xs">Documents</span>
        </div>
        <div className="glass-panel shimmer p-3 rounded-md flex flex-col items-center">
          <Database className="text-primary w-10 h-10 mb-2 animate-pulse" />
          <span className="text-xs">Data</span>
        </div>
        <div className="glass-panel shimmer p-3 rounded-md flex flex-col items-center">
          <FileUp className="text-primary w-10 h-10 mb-2 animate-pulse" />
          <span className="text-xs">Imports</span>
        </div>
      </div>

      {/* Arrows / Connections */}
      <ArrowRight className="absolute left-1/4 top-1/2 transform -translate-y-1/2 text-primary w-6 h-6 animate-pulse-slow" />
      <ArrowRight className="absolute right-1/4 top-1/2 transform -translate-y-1/2 text-primary w-6 h-6 animate-pulse-slow delay-300" />

      {/* Floating Highlights */}
      <div className="absolute top-[10%] left-[20%] w-6 h-6 rounded-full bg-primary/30 shimmer animate-pulse-slow"></div>
      <div className="absolute bottom-[15%] right-[25%] w-5 h-5 rounded-full bg-primary/20 shimmer animate-pulse-slow delay-500"></div>

      {/* Footer Note */}
      <div className="absolute bottom-10 right-10 text-xs bg-primary/10 p-2 rounded animate-pulse">
        Always connected experience
      </div>

      {/* Shimmer CSS */}
      <style>{`
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: -150%;
          width: 150%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          animation: shimmer 2.5s infinite;
        }
        @keyframes shimmer {
          100% {
            left: 150%;
          }
        }
      `}</style>
    </div>
  );



      case 1: // Voice Recognition
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">

      {/* Central Neural Hub */}
      <div className="neural-node w-24 h-24 flex items-center justify-center mb-6 shimmer">
        <Mic className="text-primary w-12 h-12 animate-pulse" />
      </div>

      {/* Feature Panels */}
      <div className="grid grid-cols-3 gap-6 w-3/4">
        {["Mic", "Layers", "Plugins"].map((label, idx) => {
          const Icon = [Mic, Layers, Puzzle][idx];
          return (
            <div key={idx} className="glass-panel shimmer p-3 rounded-md flex flex-col items-center">
              <Icon className="text-primary w-10 h-10 mb-2 animate-pulse" />
              <span className="text-xs">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Arrows / Connections */}
      <ArrowRight className="absolute left-1/4 top-1/2 transform -translate-y-1/2 text-primary w-6 h-6 animate-pulse-slow" />
      <ArrowRight className="absolute right-1/4 top-1/2 transform -translate-y-1/2 text-primary w-6 h-6 animate-pulse-slow delay-300" />

      {/* Floating Highlights */}
      <div className="absolute top-[15%] left-[25%] w-6 h-6 rounded-full bg-primary/30 shimmer animate-pulse-slow"></div>
      <div className="absolute bottom-[20%] right-[20%] w-5 h-5 rounded-full bg-primary/20 shimmer animate-pulse-slow delay-500"></div>

      {/* Footer Note */}
      <div className="absolute bottom-10 right-10 text-xs bg-primary/10 p-2 rounded animate-pulse">
        Recognize and process voice commands
      </div>

      {/* Shimmer CSS */}
      <style>{`
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: -150%;
          width: 150%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          animation: shimmer 2.5s infinite;
        }
        @keyframes shimmer {
          100% {
            left: 150%;
          }
        }
      `}</style>
    </div>
  );



      case 2: // AI Coaching
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">

      {/* Central AI Coaching Hub */}
      <div className="glass-panel shimmer rounded-full w-28 h-28 flex items-center justify-center mb-6 animate-pulse">
        <Sparkles className="text-primary w-14 h-14 animate-pulse" />
      </div>

      {/* Feature Panels */}
      <div className="grid grid-cols-2 gap-4 w-3/4">
        {["Grammar Guidance", "Vocabulary Tips", "Sentence Structure", "Pronunciation Help"].map((label, idx) => (
          <div
            key={idx}
            className="glass-panel shimmer p-3 rounded-md h-16 flex items-center justify-center animate-pulse"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Floating Nodes */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 glass-panel shimmer w-12 h-12 rounded-full flex items-center justify-center animate-pulse-slow">
        <FeatureIcon index={index} size={16} />
      </div>
      <div className="absolute top-1/2 -left-6 -translate-y-1/2 glass-panel shimmer w-12 h-12 rounded-full flex items-center justify-center animate-pulse-slow">
        <FeatureIcon index={index} size={16} />
      </div>
      <div className="absolute bottom-1/2 -right-6 translate-y-1/2 glass-panel shimmer w-12 h-12 rounded-full flex items-center justify-center animate-pulse-slow">
        <FeatureIcon index={index} size={16} />
      </div>
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 glass-panel shimmer w-12 h-12 rounded-full flex items-center justify-center animate-pulse-slow">
        <FeatureIcon index={index} size={16} />
      </div>

      {/* Background Highlights */}
      <div className="absolute top-[15%] right-[20%] w-6 h-6 rounded-full bg-primary/20 shimmer animate-pulse-slow"></div>
      <div className="absolute bottom-[20%] left-[25%] w-5 h-5 rounded-full bg-primary/30 shimmer animate-pulse-slow delay-400"></div>

      {/* Description Label */}
      <div className="absolute bottom-4 text-xs bg-primary/10 p-2 rounded text-center animate-pulse">
        Personalized guidance on grammar, vocabulary, and sentence structure
      </div>
    </div>
  );


      case 3: // Learning Levels
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">

      {/* Header / Placeholder */}
      <div className="glass-panel shimmer rounded-full px-4 py-2 w-3/4 flex items-center mb-6 justify-center animate-pulse">
        <div className="h-5 w-full bg-primary/10 rounded"></div>
      </div>

      {/* Learning Levels Grid */}
      <div className="grid grid-cols-3 gap-4 w-3/4">
        {["Beginner", "Intermediate", "Advanced"].map((level, idx) => (
          <div
            key={idx}
            className="glass-panel shimmer p-3 rounded-md h-16 flex items-center justify-center animate-pulse"
          >
            {level}
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="absolute bottom-10 right-10 text-xs bg-primary/10 p-2 rounded animate-pulse">
        Select your learning level
      </div>

      {/* Shimmer CSS */}
      <style>{`
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: -150%;
          width: 150%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          animation: shimmer 2.5s infinite;
        }
        @keyframes shimmer {
          100% {
            left: 150%;
          }
        }
      `}</style>
    </div>
  );



      case 4: // Intelligence
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">

      {/* Header */}
      <div className="glass-panel shimmer rounded-full px-4 py-2 w-3/4 flex items-center mb-6 animate-pulse">
        <Brain className="text-primary w-5 h-5 mr-2" />
        <div className="h-5 w-full bg-primary/10 rounded"></div>
      </div>

      {/* Intelligence Hub */}
      <div className="relative w-3/4 h-64 flex items-center justify-center">

        {/* Central Brain */}
        <div className="glass-panel shimmer rounded-full w-24 h-24 flex items-center justify-center animate-pulse">
          <Brain className="text-primary w-12 h-12" />
        </div>

        {/* Surrounding Nodes */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 glass-panel shimmer w-12 h-12 rounded-full flex items-center justify-center animate-pulse-slow">
          <FeatureIcon index={index} size={16} />
        </div>
        <div className="absolute top-1/2 -left-6 -translate-y-1/2 glass-panel shimmer w-12 h-12 rounded-full flex items-center justify-center animate-pulse-slow">
          <FeatureIcon index={index} size={16} />
        </div>
        <div className="absolute bottom-1/2 -right-6 translate-y-1/2 glass-panel shimmer w-12 h-12 rounded-full flex items-center justify-center animate-pulse-slow">
          <FeatureIcon index={index} size={16} />
        </div>
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 glass-panel shimmer w-12 h-12 rounded-full flex items-center justify-center animate-pulse-slow">
          <FeatureIcon index={index} size={16} />
        </div>
      </div>

      {/* Footer Note */}
      <div className="absolute bottom-10 right-10 text-xs bg-primary/10 p-2 rounded animate-pulse">
        Neural intelligence at work
      </div>

      {/* Shimmer CSS */}
      <style>{`
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: -150%;
          width: 150%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          animation: shimmer 2.5s infinite;
        }
        @keyframes shimmer {
          100% {
            left: 150%;
          }
        }
      `}</style>
    </div>
  );


      case 5: // Interactive Dialogues
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      
      {/* Header */}
      <div className="glass-panel rounded-full px-4 py-2 w-3/4 flex items-center mb-6">
        <MessageSquare className="text-primary w-5 h-5 mr-2" />
        <div className="h-5 w-full bg-primary/10 rounded"></div>
      </div>

      {/* Dialogue Bubbles */}
      <div className="w-3/4 flex flex-col gap-4">
        <div className="glass-panel p-3 rounded-lg h-12 flex items-center justify-start">
          <div className="h-4 w-3/4 bg-primary/10 rounded"></div>
        </div>
        <div className="glass-panel p-3 rounded-lg h-12 flex items-center justify-end">
          <div className="h-4 w-1/2 bg-primary/10 rounded"></div>
        </div>
        <div className="glass-panel p-3 rounded-lg h-12 flex items-center justify-start">
          <div className="h-4 w-2/3 bg-primary/10 rounded"></div>
        </div>
        <div className="glass-panel p-3 rounded-lg h-12 flex items-center justify-end">
          <div className="h-4 w-1/3 bg-primary/10 rounded"></div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="absolute bottom-10 right-10 text-xs bg-primary/10 p-2 rounded">
        Real-time interactive dialogues
      </div>
    </div>
  );


      case 6: // Progress Tracking
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      
      {/* Header */}
      <div className="glass-panel rounded-full px-4 py-2 w-3/4 flex items-center mb-6">
        <TrendingUp className="text-primary w-5 h-5 mr-2" />
        <div className="h-5 w-full bg-primary/10 rounded"></div>
      </div>

      {/* Progress Bars */}
      <div className="w-3/4 flex flex-col gap-4">
        <div className="glass-panel p-2 rounded-md h-6">
          <div className="h-full w-2/3 bg-primary/40 rounded"></div>
        </div>
        <div className="glass-panel p-2 rounded-md h-6">
          <div className="h-full w-1/2 bg-primary/30 rounded"></div>
        </div>
        <div className="glass-panel p-2 rounded-md h-6">
          <div className="h-full w-3/4 bg-primary/50 rounded"></div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="absolute bottom-10 right-10 text-xs bg-primary/10 p-2 rounded">
        Track your learning journey
      </div>
    </div>
  );


      case 7: // Search
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <div className="glass-panel rounded-full px-4 py-2 w-3/4 flex items-center mb-6">
              <Search className="text-primary w-5 h-5 mr-2" />
              <div className="h-5 w-full bg-primary/10 rounded"></div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-3/4">
              {Array(4).fill(0).map((_, idx) => (
                <div key={idx} className="glass-panel p-3 rounded-md h-10"></div>
              ))}
            </div>
            <div className="absolute bottom-10 right-10 text-xs bg-primary/10 p-2 rounded">Smart search results</div>
          </div>
        );

      case 8: // Contextual Learning
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      
      {/* Header */}
      <div className="glass-panel rounded-full px-4 py-2 w-3/4 flex items-center mb-6">
        <FeatureIcon index={index} size={20} className="text-primary mr-2" />
        <div className="h-5 w-full bg-primary/10 rounded"></div>
      </div>

      {/* Context Cards */}
      <div className="grid grid-cols-2 gap-4 w-3/4">
        <div className="glass-panel p-3 rounded-md h-16 flex items-center justify-start">
          <div className="h-4 w-2/3 bg-primary/10 rounded"></div>
        </div>
        <div className="glass-panel p-3 rounded-md h-16 flex items-center justify-end">
          <div className="h-4 w-1/2 bg-primary/10 rounded"></div>
        </div>
        <div className="glass-panel p-3 rounded-md h-16 flex items-center justify-start">
          <div className="h-4 w-3/4 bg-primary/10 rounded"></div>
        </div>
        <div className="glass-panel p-3 rounded-md h-16 flex items-center justify-end">
          <div className="h-4 w-1/3 bg-primary/10 rounded"></div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="absolute bottom-10 right-10 text-xs bg-primary/10 p-2 rounded">
        Adaptive learning in context
      </div>
    </div>
  );


      case 9: // Private & Secure
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      
      {/* Header */}
      <div className="glass-panel shimmer rounded-full px-4 py-2 w-3/4 flex items-center mb-6">
        <Lock className="text-primary w-5 h-5 mr-2 animate-pulse" />
        <div className="h-5 w-full bg-primary/10 rounded"></div>
      </div>

      {/* Secure Panels */}
      <div className="grid grid-cols-2 gap-4 w-3/4">
        <div className="glass-panel shimmer p-3 rounded-md h-16 flex items-center justify-center">
          <Lock className="text-primary w-4 h-4 mr-2 animate-pulse" />
          <div className="h-4 w-1/2 bg-primary/10 rounded"></div>
        </div>
        <div className="glass-panel shimmer p-3 rounded-md h-16 flex items-center justify-center">
          <Lock className="text-primary w-4 h-4 mr-2 animate-pulse" />
          <div className="h-4 w-1/3 bg-primary/10 rounded"></div>
        </div>
        <div className="glass-panel shimmer p-3 rounded-md h-16 flex items-center justify-center">
          <Lock className="text-primary w-4 h-4 mr-2 animate-pulse" />
          <div className="h-4 w-2/3 bg-primary/10 rounded"></div>
        </div>
        <div className="glass-panel shimmer p-3 rounded-md h-16 flex items-center justify-center">
          <Lock className="text-primary w-4 h-4 mr-2 animate-pulse" />
          <div className="h-4 w-1/4 bg-primary/10 rounded"></div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="absolute bottom-10 right-10 text-xs bg-primary/10 p-2 rounded animate-pulse">
        Your data stays private & secure
      </div>

      {/* Shimmer CSS */}
      <style>{`
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: -150%;
          width: 150%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          animation: shimmer 2.5s infinite;
        }
        @keyframes shimmer {
          100% {
            left: 150%;
          }
        }
      `}</style>
    </div>
  );


      case 10: // Gamified Practice
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      
      {/* Header Badge */}
      <div className="glass-panel shimmer rounded-full px-4 py-2 w-3/4 flex items-center mb-6">
        <Award className="text-primary w-5 h-5 mr-2 animate-bounce" />
        <div className="h-5 w-full bg-primary/10 rounded"></div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 gap-4 w-3/4">
        <div className="glass-panel shimmer p-3 rounded-md h-16 flex items-center justify-center">
          <Zap className="text-yellow-400 w-4 h-4 mr-2 animate-pulse" />
          <div className="h-4 w-1/2 bg-primary/10 rounded"></div>
        </div>
        <div className="glass-panel shimmer p-3 rounded-md h-16 flex items-center justify-center">
          <Trophy className="text-primary w-4 h-4 mr-2 animate-pulse" />
          <div className="h-4 w-1/3 bg-primary/10 rounded"></div>
        </div>
        <div className="glass-panel shimmer p-3 rounded-md h-16 flex items-center justify-center">
          <Star className="text-yellow-300 w-4 h-4 mr-2 animate-pulse" />
          <div className="h-4 w-2/3 bg-primary/10 rounded"></div>
        </div>
        <div className="glass-panel shimmer p-3 rounded-md h-16 flex items-center justify-center">
          <Medal className="text-primary w-4 h-4 mr-2 animate-pulse" />
          <div className="h-4 w-1/4 bg-primary/10 rounded"></div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="absolute bottom-10 right-10 text-xs bg-primary/10 p-2 rounded animate-bounce">
        Level up with gamified practice
      </div>

      {/* Shimmer CSS */}
      <style>{`
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: -150%;
          width: 150%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          animation: shimmer 2.5s infinite;
        }
        @keyframes shimmer {
          100% {
            left: 150%;
          }
        }
      `}</style>
    </div>
  );


     case 11: // D/L mode
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">

      {/* Header Toggle */}
      <div className="glass-panel shimmer rounded-full px-4 py-2 w-3/4 flex items-center mb-6 justify-between">
        <Sun className="text-yellow-400 w-5 h-5 animate-pulse" />
        <div className="h-5 w-full bg-primary/10 mx-2 rounded"></div>
        <Moon className="text-blue-400 w-5 h-5 animate-pulse" />
      </div>

      {/* Mode Panels */}
      <div className="grid grid-cols-2 gap-4 w-3/4">
        <div className="glass-panel shimmer p-3 rounded-md h-16 flex items-center justify-center">
          <Sun className="text-yellow-400 w-4 h-4 mr-2 animate-pulse" />
          <div className="h-4 w-1/2 bg-primary/10 rounded"></div>
        </div>
        <div className="glass-panel shimmer p-3 rounded-md h-16 flex items-center justify-center">
          <Moon className="text-blue-400 w-4 h-4 mr-2 animate-pulse" />
          <div className="h-4 w-1/2 bg-primary/10 rounded"></div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="absolute bottom-10 right-10 text-xs bg-primary/10 p-2 rounded animate-pulse">
        Switch between Day & Night mode
      </div>

      {/* Shimmer CSS */}
      <style>{`
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: -150%;
          width: 150%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          animation: shimmer 2.5s infinite;
        }
        @keyframes shimmer {
          100% {
            left: 150%;
          }
        }
      `}</style>
    </div>
  );


      case 12: // Multi-Mode Practice
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">

      {/* Header */}
      <div className="glass-panel shimmer rounded-full px-4 py-2 w-3/4 flex items-center mb-6">
        <Grid className="text-primary w-5 h-5 mr-2 animate-bounce" />
        <div className="h-5 w-full bg-primary/10 rounded"></div>
      </div>

      {/* Multi-Mode Grid */}
      <div className="grid grid-cols-2 gap-4 w-3/4">
        {Array(4).fill(0).map((_, idx) => (
          <div key={idx} className="glass-panel shimmer p-3 rounded-md h-16 flex items-center justify-center">
            <div className="h-4 w-2/3 bg-primary/10 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="absolute bottom-10 right-10 text-xs bg-primary/10 p-2 rounded animate-pulse">
        Practice in multiple modes simultaneously
      </div>

      {/* Shimmer CSS */}
      <style>{`
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: -150%;
          width: 150%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          animation: shimmer 2.5s infinite;
        }
        @keyframes shimmer {
          100% {
            left: 150%;
          }
        }
      `}</style>
    </div>
  );


      case 13: // Offline Dictionary
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">

      {/* Header */}
      <div className="glass-panel shimmer rounded-full px-4 py-2 w-3/4 flex items-center mb-6">
        <BookOpen className="text-primary w-5 h-5 mr-2 animate-pulse" />
        <div className="h-5 w-full bg-primary/10 rounded"></div>
      </div>

      {/* Dictionary Panels */}
      <div className="grid grid-cols-2 gap-4 w-3/4">
        {Array(2).fill(0).map((_, idx) => (
          <div key={idx} className="glass-panel shimmer p-3 rounded-md h-16 flex items-center justify-center">
            <div className="h-4 w-2/3 bg-primary/10 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="absolute bottom-10 right-10 text-xs bg-primary/10 p-2 rounded animate-pulse">
        Access words instantly online
      </div>

      {/* Shimmer CSS */}
      <style>{`
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: -150%;
          width: 150%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          animation: shimmer 2.5s infinite;
        }
        @keyframes shimmer {
          100% {
            left: 150%;
          }
        }
      `}</style>
    </div>
  );


      case 14: // Roleplay Modes
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">

      {/* Header */}
      <div className="glass-panel shimmer rounded-full px-4 py-2 w-3/4 flex items-center mb-6">
        <Users className="text-primary w-5 h-5 mr-2 animate-bounce" />
        <div className="h-5 w-full bg-primary/10 rounded"></div>
      </div>

      {/* Roleplay Mode Panels */}
      <div className="grid grid-cols-2 gap-4 w-3/4">
        {Array(2).fill(0).map((_, idx) => (
          <div key={idx} className="glass-panel shimmer p-3 rounded-md h-16 flex items-center justify-center">
            <div className="h-4 w-2/3 bg-primary/10 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="absolute bottom-10 right-10 text-xs bg-primary/10 p-2 rounded animate-pulse">
        Engage in interactive roleplay modes
      </div>

      {/* Shimmer CSS */}
      <style>{`
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: -150%;
          width: 150%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          animation: shimmer 2.5s infinite;
        }
        @keyframes shimmer {
          100% {
            left: 150%;
          }
        }
      `}</style>
    </div>
  );


      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "w-full rounded-xl overflow-hidden shadow-xl bg-card/30 backdrop-blur-sm border border-border/50",
      className
    )}>
      <div className={cn("relative h-48 sm:h-56 md:h-64 w-full bg-gradient-to-br p-4 sm:p-6 md:p-8", bgColor)}>
        <div className="absolute inset-0 w-full h-full overflow-hidden opacity-40">
          <div className="absolute top-[20%] left-[15%] w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/30 animate-pulse-slow"></div>
          <div className="absolute top-[60%] left-[25%] w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-primary/20 animate-pulse-slow delay-300"></div>
          <div className="absolute top-[30%] left-[60%] w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/30 animate-pulse-slow delay-700"></div>
          <div className="absolute top-[70%] right-[20%] w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/20 animate-pulse-slow delay-500"></div>
          <div className="absolute top-[40%] right-[30%] w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-primary/30 animate-pulse-slow delay-200"></div>
          <div className="absolute top-[20%] right-[10%] w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary/20 animate-pulse-slow delay-600"></div>
        </div>
        <div className="relative z-10 h-full">{renderDiagram(featureIndex)}</div>
      </div>
      <div className="p-3 sm:p-4 bg-card/50 backdrop-blur-sm">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-foreground">{title}</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default CustomIllustration;
