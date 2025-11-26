/**
 * Listening Practice Modules Configuration
 * Main configuration file that references individual module JSON files
 */

export interface ListeningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  level: string;
  icon: string;
  color: string;
  category: string;
  audioUrl?: string;
  transcriptUrl?: string;
}

export interface ListeningExercise {
  id: string;
  type: 'comprehension' | 'fill-blank' | 'multiple-choice' | 'true-false' | 'dictation';
  question: string;
  audioSegment?: {
    start: number;
    end: number;
  };
  options?: string[];
  correctAnswer: string | number | boolean;
  explanation?: string;
  points: number;
}

export interface ListeningModuleData {
  module: ListeningModule;
  exercises: ListeningExercise[];
  transcript: string;
  vocabulary: Array<{
    word: string;
    definition: string;
    example?: string;
  }>;
  tips: string[];
}

// Import individual module data
import businessMeetingsData from './modules/business-meetings.json';
import dailyConversationsData from './modules/daily-conversations.json';
import academicLecturesData from './modules/academic-lectures.json';
import newsReportsData from './modules/news-reports.json';
import phoneConversationsData from './modules/phone-conversations.json';
import interviewsData from './modules/interviews.json';

export const listeningModules: ListeningModule[] = [
  {
    id: 'business-meetings',
    title: 'Business Meetings',
    description: 'Practice understanding professional meeting discussions, presentations, and negotiations',
    difficulty: 'intermediate',
    duration: '20-25 min',
    level: 'Professional',
    icon: '💼',
    color: 'from-blue-500 to-indigo-600',
    category: 'Business',
  },
  {
    id: 'daily-conversations',
    title: 'Daily Conversations',
    description: 'Improve your listening skills with everyday conversations and social interactions',
    difficulty: 'beginner',
    duration: '15-20 min',
    level: 'Foundation',
    icon: '💬',
    color: 'from-cyan-500 to-blue-600',
    category: 'Daily Life',
  },
  {
    id: 'academic-lectures',
    title: 'Academic Lectures',
    description: 'Enhance comprehension of academic presentations and educational content',
    difficulty: 'advanced',
    duration: '25-30 min',
    level: 'Academic',
    icon: '🎓',
    color: 'from-purple-500 to-pink-600',
    category: 'Education',
  },
  {
    id: 'news-reports',
    title: 'News Reports',
    description: 'Listen to news broadcasts and improve understanding of current events',
    difficulty: 'intermediate',
    duration: '18-22 min',
    level: 'Intermediate',
    icon: '📰',
    color: 'from-emerald-500 to-teal-600',
    category: 'Media',
  },
  {
    id: 'phone-conversations',
    title: 'Phone Conversations',
    description: 'Master phone communication skills for professional and personal calls',
    difficulty: 'beginner',
    duration: '12-18 min',
    level: 'Foundation',
    icon: '📞',
    color: 'from-amber-500 to-orange-600',
    category: 'Communication',
  },
  {
    id: 'interviews',
    title: 'Job Interviews',
    description: 'Practice understanding interview questions and professional dialogues',
    difficulty: 'intermediate',
    duration: '20-25 min',
    level: 'Professional',
    icon: '🎤',
    color: 'from-rose-500 to-red-600',
    category: 'Career',
  },
];

// Module data loader
export const getListeningModuleData = async (moduleId: string): Promise<ListeningModuleData | null> => {
  try {
    switch (moduleId) {
      case 'business-meetings':
        return businessMeetingsData as unknown as ListeningModuleData;
      case 'daily-conversations':
        return dailyConversationsData as unknown as ListeningModuleData;
      case 'academic-lectures':
        return academicLecturesData as unknown as ListeningModuleData;
      case 'news-reports':
        return newsReportsData as unknown as ListeningModuleData;
      case 'phone-conversations':
        return phoneConversationsData as unknown as ListeningModuleData;
      case 'interviews':
        return interviewsData as unknown as ListeningModuleData;
      default:
        return null;
    }
  } catch (error) {
    console.error(`Failed to load module ${moduleId}:`, error);
    return null;
  }
};

export default listeningModules;

