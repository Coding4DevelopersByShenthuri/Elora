import type { UserCasesData, Book } from './UseCasesTypes';

export const userCasesData: UserCasesData = {
  Kids: {
    title: 'Learn & practice English words',
    subtitle: 'in a fun and simple way!',
    description: "Learning English can be exciting! With our app, you can practice speaking, listen to stories, and play word games — all without needing the internet. Imagine learning about animals, colors, and your favorite things while talking to your very own English friend on the computer or mobile.",
    quote: "Every big journey starts with small words.",
    background: 'bg-[#ff4d3c]',
    textColor: 'text-white',
    ctaText: 'SAVE TO MY MIND'
  },
  Beginners: {
    title: 'Start your English journey',
    subtitle: 'with simple words & phrases.',
    description: 'Perfect for anyone just starting out! Learn to speak and understand English step by step. Practice everyday conversations, repeat after the app, and build your confidence — all without needing the internet. Safe, private, and always ready to help.',
    quote: 'Small steps lead to big progress.',
    background: 'bg-[#d8ede7]',
    textColor: 'text-white',
    ctaText: 'BEGIN LEARNING',
    showImageGrid: true
  },
  Intermediates: {
    title: 'Practice real conversations',
    subtitle: 'and improve fluency.',
    description: 'At the intermediate level, you can go beyond basics and start having natural conversations in English. Practice speaking about daily life, share your thoughts, and answer questions with confidence — all offline, anytime you want.',
    quote: 'Fluency grows when you practice every day.',
    background: 'bg-[#f7c2d2]',
    textColor: 'text-white',
    ctaText: 'ADD NEW NOTE',
    showNotepad: true
  },
  Advanced: {
    title: 'Master fluent English &',
    subtitle: 'express your ideas clearly.',
    description: 'At the advanced level, learners practice complex conversations such as debates, storytelling, and professional discussions. Improve vocabulary, refine pronunciation, and gain confidence in expressing thoughts naturally — all offline, powered by a local language model.',
    quote: 'Confidence comes from expressing yourself without fear.',
    background: 'bg-[#e8f4f8]',
    textColor: 'text-white',
    ctaText: 'START MASTERING',
    showBrain: true
  },
  IELTS: {
    title: 'Your IELTS / PTE Companion',
    subtitle: 'Practice, prepare & track progress.',
    description: 'Get personalized speaking, writing, listening, and reading practice powered by a local AI tutor. Build confidence step by step without needing internet access.',
    quote: '“Fluency comes with consistent practice.”',
    background: 'bg-[#1a1f2c]',
    textColor: 'text-white',
    ctaText: 'Start Practicing',
    showDevTools: true
  },
  Everyone: {
    title: 'English for Everyone',
    subtitle: 'Learn, practice & improve anywhere.',
    description: 'Whether you are preparing for IELTS, PTE, or simply improving your daily English, this app adapts to your level and guides you step by step.',
    quote: '“Confidence in English opens new doors.”',
    background: 'bg-[#e8ecf0]',
    textColor: 'text-white',
    ctaText: '',
    showTags: true
  }
};

export const booksData: Book[] = [
  {
    title: "English Grammar in Use",
    author: "Raymond Murphy",
    coverColor: "bg-[#2563eb]", // blue
    textColor: "text-white",
    image: "/images/english-grammar-in-use.png"
  },
  {
    title: "Practical English Usage",
    author: "Michael Swan",
    coverColor: "bg-[#7c3aed]", // purple
    textColor: "text-white",
    image: "/images/practical-english-usage.png"
  },
  {
    title: "Word Power Made Easy",
    author: "Norman Lewis",
    coverColor: "bg-[#14b8a6]", // teal
    textColor: "text-white",
    image: "/images/word-power-made-easy.png"
  },
  {
    title: "Cambridge IELTS Practice Tests",
    author: "Cambridge University Press",
    coverColor: "bg-[#d97706]", // orange
    textColor: "text-white",
    image: "/images/cambridge-ielts-practice-tests.png"
  },
  {
    title: "Official Guide to PTE Academic",
    author: "Pearson Education",
    coverColor: "bg-[#dc2626]", // red
    textColor: "text-white",
    image: "/images/official-guide-to-pte-academic.png"
  },
  {
    title: "Check Your English Vocabulary for IELTS",
    author: "Rawdon Wyatt",
    coverColor: "bg-[#0ea5e9]", // light blue
    textColor: "text-white",
    image: "/images/check-your-english-vocabulary-for-ielts.png"
  }
];
