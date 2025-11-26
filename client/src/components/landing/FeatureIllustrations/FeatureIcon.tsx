import React from 'react';
import { 
  Wifi, Mic, Sparkles, Layers, BrainCircuit, 
  MessageSquare, TrendingUp, FileText, Lock, Award, 
  Grid, Search, BookOpen, Users, Zap, Sun 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureIconProps {
  index: number;
  size?: number;
  className?: string;
}

export const FeatureIcon: React.FC<FeatureIconProps> = ({ 
  index, 
  size = 64,
  className 
}) => {
  const icons = [
    <Wifi key="Online" size={size} strokeWidth={1.5} />,         // Online
    <Mic key="mic" size={size} strokeWidth={1.5} />,                 // Voice Recognition
    <Sparkles key="ai" size={size} strokeWidth={1.5} />,             // AI Coaching
    <Layers key="levels" size={size} strokeWidth={1.5} />,           // Learning Levels
    <BrainCircuit key="intelligence" size={size} strokeWidth={1.5} />, // Intelligence
    <MessageSquare key="dialogue" size={size} strokeWidth={1.5} />,  // Interactive Dialogues
    <TrendingUp key="progress" size={size} strokeWidth={1.5} />,     // Progress Tracking
    <Search key="search" size={size} strokeWidth={1.5} />,           // Search
    <FileText key="contextual" size={size} strokeWidth={1.5} />,     // Contextual Learning
    <Lock key="private" size={size} strokeWidth={1.5} />,            // Private & Secure
    <Award key="gamified" size={size} strokeWidth={1.5} />,          // Gamified Practice
    <Sun key="dlmode" size={size} strokeWidth={1.5} />,              // D/L mode
    <Grid key="multi-mode" size={size} strokeWidth={1.5} />,         // Multi-Mode Practice
    <BookOpen key="dictionary" size={size} strokeWidth={1.5} />,     // Offline Dictionary
    <Users key="roleplay" size={size} strokeWidth={1.5} />,          // Roleplay Modes
    <Zap key="flashcards" size={size} strokeWidth={1.5} />           // Flashcards
  ];

  return <div className={cn("text-primary", className)}>{icons[index % icons.length]}</div>;
};
