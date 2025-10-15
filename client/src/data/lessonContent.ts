/*
  Comprehensive Lesson Content for All User Levels
  Organized by audience: Kids, Adults (Beginner/Intermediate/Advanced), IELTS/PTE
*/

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  audience: 'kids' | 'adults' | 'ielts';
  duration: number; // minutes
  category: 'vocabulary' | 'grammar' | 'pronunciation' | 'conversation' | 'reading' | 'writing';
  content: {
    introduction: string;
    exercises: Exercise[];
    vocabulary: VocabularyItem[];
    tips: string[];
  };
  points: number;
}

export interface Exercise {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'speak' | 'listen' | 'write' | 'match';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  audioPrompt?: string;
}

export interface VocabularyItem {
  word: string;
  definition: string;
  example: string;
  phonetic?: string;
}

// ==================== KIDS LESSONS ====================

export const kidsLessons: Lesson[] = [
  {
    id: 'kids-colors',
    title: 'Learning Colors',
    description: 'Learn the names of different colors',
    level: 'beginner',
    audience: 'kids',
    duration: 10,
    category: 'vocabulary',
    content: {
      introduction: 'Today we will learn about colors! Colors are all around us.',
      exercises: [
        {
          id: 'ex1',
          type: 'multiple-choice',
          question: 'What color is the sky?',
          options: ['Red', 'Blue', 'Green', 'Yellow'],
          correctAnswer: 'Blue',
          explanation: 'The sky is blue!'
        },
        {
          id: 'ex2',
          type: 'speak',
          question: 'Say the color: RED',
          correctAnswer: 'red',
          explanation: 'Great job saying "red"!'
        }
      ],
      vocabulary: [
        { word: 'red', definition: 'The color of apples', example: 'The apple is red.' },
        { word: 'blue', definition: 'The color of the sky', example: 'The sky is blue.' },
        { word: 'green', definition: 'The color of grass', example: 'The grass is green.' }
      ],
      tips: ['Practice saying colors out loud', 'Look for colors around you']
    },
    points: 50
  },
  {
    id: 'kids-animals',
    title: 'Animal Names',
    description: 'Learn the names of common animals',
    level: 'beginner',
    audience: 'kids',
    duration: 15,
    category: 'vocabulary',
    content: {
      introduction: 'Let\'s learn about animals! Animals are living creatures.',
      exercises: [
        {
          id: 'ex1',
          type: 'multiple-choice',
          question: 'Which animal says "Meow"?',
          options: ['Dog', 'Cat', 'Cow', 'Bird'],
          correctAnswer: 'Cat',
          explanation: 'Cats say "Meow"!'
        }
      ],
      vocabulary: [
        { word: 'cat', definition: 'A small furry pet', example: 'The cat is sleeping.' },
        { word: 'dog', definition: 'A friendly pet that barks', example: 'The dog is playing.' }
      ],
      tips: ['Make animal sounds', 'Draw your favorite animal']
    },
    points: 50
  }
];

// ==================== ADULT BEGINNER LESSONS ====================

export const adultBeginnerLessons: Lesson[] = [
  {
    id: 'adult-intro',
    title: 'Introducing Yourself',
    description: 'Learn how to introduce yourself in English',
    level: 'beginner',
    audience: 'adults',
    duration: 20,
    category: 'conversation',
    content: {
      introduction: 'Learn essential phrases for introducing yourself.',
      exercises: [
        {
          id: 'ex1',
          type: 'fill-blank',
          question: 'My name ___ John.',
          options: ['is', 'are', 'am', 'be'],
          correctAnswer: 'is',
          explanation: 'Use "is" after "My name"'
        },
        {
          id: 'ex2',
          type: 'speak',
          question: 'Introduce yourself: "My name is..."',
          correctAnswer: 'My name is',
          explanation: 'Practice saying your name clearly'
        }
      ],
      vocabulary: [
        { word: 'name', definition: 'What you are called', example: 'My name is Sarah.' },
        { word: 'work', definition: 'Your job', example: 'I work as a teacher.' },
        { word: 'live', definition: 'Where you stay', example: 'I live in Mumbai.' }
      ],
      tips: [
        'Speak slowly and clearly',
        'Practice with a friend',
        'Record yourself speaking'
      ]
    },
    points: 100
  },
  {
    id: 'adult-present-simple',
    title: 'Present Simple Tense',
    description: 'Master the present simple tense',
    level: 'beginner',
    audience: 'adults',
    duration: 25,
    category: 'grammar',
    content: {
      introduction: 'The present simple tense is used for habits and facts.',
      exercises: [
        {
          id: 'ex1',
          type: 'multiple-choice',
          question: 'She ___ to school every day.',
          options: ['go', 'goes', 'going', 'went'],
          correctAnswer: 'goes',
          explanation: 'Add "s" for he/she/it in present simple'
        }
      ],
      vocabulary: [
        { word: 'every day', definition: 'Daily', example: 'I study English every day.' },
        { word: 'usually', definition: 'Most of the time', example: 'I usually wake up at 7 AM.' }
      ],
      tips: [
        'Remember to add "s" for he/she/it',
        'Use present simple for routines',
        'Practice with daily activities'
      ]
    },
    points: 100
  }
];

// ==================== ADULT INTERMEDIATE LESSONS ====================

export const adultIntermediateLessons: Lesson[] = [
  {
    id: 'adult-past-perfect',
    title: 'Past Perfect Tense',
    description: 'Learn to talk about actions before other past actions',
    level: 'intermediate',
    audience: 'adults',
    duration: 30,
    category: 'grammar',
    content: {
      introduction: 'Use past perfect to show which action happened first.',
      exercises: [
        {
          id: 'ex1',
          type: 'fill-blank',
          question: 'By the time I arrived, they ___ already left.',
          options: ['have', 'had', 'has', 'having'],
          correctAnswer: 'had',
          explanation: 'Use "had" + past participle for past perfect'
        }
      ],
      vocabulary: [
        { word: 'already', definition: 'Before now or before then', example: 'I had already eaten.' },
        { word: 'by the time', definition: 'Before a specific time', example: 'By the time I arrived, it was over.' }
      ],
      tips: [
        'Use past perfect for the earlier action',
        'Common structure: had + past participle',
        'Often used with "by the time", "before", "after"'
      ]
    },
    points: 150
  }
];

// ==================== ADULT ADVANCED LESSONS ====================

export const adultAdvancedLessons: Lesson[] = [
  {
    id: 'adult-idioms',
    title: 'Common English Idioms',
    description: 'Master frequently used idiomatic expressions',
    level: 'advanced',
    audience: 'adults',
    duration: 35,
    category: 'vocabulary',
    content: {
      introduction: 'Idioms are expressions with meanings different from the literal words.',
      exercises: [
        {
          id: 'ex1',
          type: 'multiple-choice',
          question: 'What does "break the ice" mean?',
          options: [
            'To break actual ice',
            'To start a conversation',
            'To be cold',
            'To stop talking'
          ],
          correctAnswer: 'To start a conversation',
          explanation: '"Break the ice" means to initiate conversation in a social setting'
        }
      ],
      vocabulary: [
        {
          word: 'break the ice',
          definition: 'To initiate conversation',
          example: 'He told a joke to break the ice.'
        },
        {
          word: 'piece of cake',
          definition: 'Something very easy',
          example: 'The exam was a piece of cake.'
        }
      ],
      tips: [
        'Learn idioms in context',
        'Don\'t translate idioms literally',
        'Practice using idioms in sentences'
      ]
    },
    points: 200
  }
];

// ==================== IELTS/PTE LESSONS ====================

export const ieltsLessons: Lesson[] = [
  {
    id: 'ielts-speaking-part1',
    title: 'IELTS Speaking Part 1',
    description: 'Master the introduction and interview section',
    level: 'advanced',
    audience: 'ielts',
    duration: 40,
    category: 'conversation',
    content: {
      introduction: 'Part 1 covers familiar topics about yourself and your life.',
      exercises: [
        {
          id: 'ex1',
          type: 'speak',
          question: 'Describe your hometown. (Speak for 1-2 minutes)',
          correctAnswer: 'hometown description',
          explanation: 'Include: location, size, what it\'s famous for, why you like/dislike it'
        },
        {
          id: 'ex2',
          type: 'speak',
          question: 'What do you do in your free time?',
          correctAnswer: 'free time activities',
          explanation: 'Give specific examples and explain why you enjoy them'
        }
      ],
      vocabulary: [
        {
          word: 'bustling',
          definition: 'Full of activity',
          example: 'My hometown is a bustling city.',
          phonetic: '/ˈbʌs.lɪŋ/'
        },
        {
          word: 'picturesque',
          definition: 'Visually attractive',
          example: 'The village is picturesque.',
          phonetic: '/ˌpɪk.tʃəˈresk/'
        }
      ],
      tips: [
        'Extend your answers with examples',
        'Use varied vocabulary',
        'Speak naturally, don\'t memorize',
        'Practice common Part 1 topics'
      ]
    },
    points: 250
  },
  {
    id: 'ielts-writing-task2',
    title: 'IELTS Writing Task 2',
    description: 'Learn to write effective essays',
    level: 'advanced',
    audience: 'ielts',
    duration: 45,
    category: 'writing',
    content: {
      introduction: 'Task 2 requires you to write an essay in response to a point of view, argument, or problem.',
      exercises: [
        {
          id: 'ex1',
          type: 'write',
          question: 'Some people believe that technology has made our lives easier. Others think it has made life more complicated. Discuss both views and give your opinion. (Write 250+ words)',
          correctAnswer: 'essay',
          explanation: 'Include: introduction, both viewpoints, your opinion, conclusion'
        }
      ],
      vocabulary: [
        {
          word: 'Furthermore',
          definition: 'In addition',
          example: 'Furthermore, technology improves communication.'
        },
        {
          word: 'Nevertheless',
          definition: 'However',
          example: 'Nevertheless, some challenges remain.'
        }
      ],
      tips: [
        'Plan your essay (5 minutes)',
        'Write 4-5 paragraphs',
        'Use linking words',
        'Check grammar and spelling',
        'Aim for 250-280 words'
      ]
    },
    points: 300
  },
  {
    id: 'pte-speaking-describe',
    title: 'PTE Describe Image',
    description: 'Learn to describe images effectively',
    level: 'advanced',
    audience: 'ielts',
    duration: 30,
    category: 'conversation',
    content: {
      introduction: 'You have 25 seconds to prepare and 40 seconds to describe an image.',
      exercises: [
        {
          id: 'ex1',
          type: 'speak',
          question: 'Describe a bar chart showing smartphone usage by age group.',
          correctAnswer: 'chart description',
          explanation: 'Include: overview, key trends, specific data, conclusion'
        }
      ],
      vocabulary: [
        {
          word: 'depicts',
          definition: 'Shows or represents',
          example: 'The chart depicts smartphone usage.'
        },
        {
          word: 'significantly',
          definition: 'In a notable way',
          example: 'Usage increased significantly.'
        }
      ],
      tips: [
        'Start with overview',
        'Mention key trends',
        'Use specific numbers',
        'Speak continuously for 40 seconds',
        'Practice with various chart types'
      ]
    },
    points: 250
  }
];

// ==================== ALL LESSONS EXPORT ====================

export const allLessons: Lesson[] = [
  ...kidsLessons,
  ...adultBeginnerLessons,
  ...adultIntermediateLessons,
  ...adultAdvancedLessons,
  ...ieltsLessons
];

// Helper functions
export const getLessonsByAudience = (audience: Lesson['audience']): Lesson[] => {
  return allLessons.filter(lesson => lesson.audience === audience);
};

export const getLessonsByLevel = (level: Lesson['level']): Lesson[] => {
  return allLessons.filter(lesson => lesson.level === level);
};

export const getLessonsByCategory = (category: Lesson['category']): Lesson[] => {
  return allLessons.filter(lesson => lesson.category === category);
};

export const getLessonById = (id: string): Lesson | undefined => {
  return allLessons.find(lesson => lesson.id === id);
};

