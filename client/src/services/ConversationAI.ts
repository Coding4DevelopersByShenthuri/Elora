/*
  ConversationAI: AI-powered conversation practice
  Generates contextual responses and provides feedback
*/

import { TransformersService } from './TransformersService';
import { SLMEvaluator } from './SLMEvaluator';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  feedback?: {
    grammar: number;
    vocabulary: number;
    fluency: number;
    suggestions: string[];
  };
}

export interface ConversationTopic {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'daily' | 'business' | 'travel' | 'academic' | 'social';
  prompts: string[];
  vocabulary: string[];
}

class ConversationAIClass {
  private conversationHistory: ConversationMessage[] = [];
  private currentTopic: ConversationTopic | null = null;

  /**
   * Predefined conversation topics
   */
  private topics: ConversationTopic[] = [
    {
      id: 'intro',
      title: 'Introducing Yourself',
      description: 'Practice introducing yourself and talking about your background',
      difficulty: 'beginner',
      category: 'daily',
      prompts: [
        'Tell me about yourself.',
        'What do you do for work or study?',
        'What are your hobbies?',
        'Where are you from?'
      ],
      vocabulary: ['name', 'work', 'study', 'hobby', 'from', 'live', 'family']
    },
    {
      id: 'daily_routine',
      title: 'Daily Routine',
      description: 'Discuss your typical day and daily activities',
      difficulty: 'beginner',
      category: 'daily',
      prompts: [
        'What time do you usually wake up?',
        'What do you do in the morning?',
        'How do you spend your evenings?',
        'What\'s your favorite part of the day?'
      ],
      vocabulary: ['wake up', 'breakfast', 'work', 'lunch', 'dinner', 'sleep', 'routine']
    },
    {
      id: 'travel',
      title: 'Travel and Tourism',
      description: 'Talk about travel experiences and plans',
      difficulty: 'intermediate',
      category: 'travel',
      prompts: [
        'Have you traveled anywhere interesting recently?',
        'What\'s your dream destination?',
        'Do you prefer beach or mountain vacations?',
        'Tell me about a memorable trip.'
      ],
      vocabulary: ['travel', 'destination', 'vacation', 'flight', 'hotel', 'sightseeing', 'culture']
    },
    {
      id: 'job_interview',
      title: 'Job Interview',
      description: 'Practice common job interview questions',
      difficulty: 'advanced',
      category: 'business',
      prompts: [
        'Tell me about your strengths and weaknesses.',
        'Why do you want this position?',
        'Describe a challenging situation you faced at work.',
        'Where do you see yourself in 5 years?'
      ],
      vocabulary: ['experience', 'skills', 'achievement', 'challenge', 'teamwork', 'leadership']
    },
    {
      id: 'restaurant',
      title: 'At a Restaurant',
      description: 'Practice ordering food and restaurant conversations',
      difficulty: 'beginner',
      category: 'daily',
      prompts: [
        'What would you like to order?',
        'Do you have any dietary restrictions?',
        'How would you like your steak cooked?',
        'Would you like dessert?'
      ],
      vocabulary: ['menu', 'order', 'appetizer', 'main course', 'dessert', 'bill', 'tip']
    },
    {
      id: 'ielts_speaking',
      title: 'IELTS Speaking Practice',
      description: 'Practice IELTS-style speaking questions',
      difficulty: 'advanced',
      category: 'academic',
      prompts: [
        'Describe a person who has influenced you.',
        'What are the advantages and disadvantages of social media?',
        'How has technology changed education?',
        'Discuss the importance of environmental protection.'
      ],
      vocabulary: ['influence', 'advantage', 'disadvantage', 'technology', 'education', 'environment']
    }
  ];

  /**
   * Get all available topics
   */
  getTopics(): ConversationTopic[] {
    return this.topics;
  }

  /**
   * Get topics by difficulty
   */
  getTopicsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): ConversationTopic[] {
    return this.topics.filter(t => t.difficulty === difficulty);
  }

  /**
   * Get topics by category
   */
  getTopicsByCategory(category: ConversationTopic['category']): ConversationTopic[] {
    return this.topics.filter(t => t.category === category);
  }

  /**
   * Start a new conversation
   */
  startConversation(topicId: string): ConversationMessage {
    const topic = this.topics.find(t => t.id === topicId);
    if (!topic) {
      throw new Error('Topic not found');
    }

    this.currentTopic = topic;
    this.conversationHistory = [];

    // Add system message
    const systemMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role: 'system',
      content: `Starting conversation about: ${topic.title}`,
      timestamp: new Date().toISOString()
    };

    // Add first prompt
    const firstPrompt = topic.prompts[0];
    const assistantMessage: ConversationMessage = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: firstPrompt,
      timestamp: new Date().toISOString()
    };

    this.conversationHistory.push(systemMessage, assistantMessage);
    return assistantMessage;
  }

  /**
   * Process user response and generate AI reply
   */
  async processUserResponse(userInput: string): Promise<{
    aiResponse: ConversationMessage;
    feedback: ConversationMessage['feedback'];
  }> {
    if (!this.currentTopic) {
      throw new Error('No active conversation');
    }

    // Add user message to history
    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userInput,
      timestamp: new Date().toISOString()
    };

    // Evaluate user's response
    const evaluation = await SLMEvaluator.evaluateResponse(userInput, {
      targetWords: this.currentTopic.vocabulary
    });

    userMessage.feedback = {
      grammar: evaluation.grammar,
      vocabulary: evaluation.vocabulary,
      fluency: evaluation.fluency,
      suggestions: [evaluation.feedback]
    };

    this.conversationHistory.push(userMessage);

    // Generate AI response
    const aiResponse = await this.generateResponse(userInput);
    
    const assistantMessage: ConversationMessage = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    };

    this.conversationHistory.push(assistantMessage);

    return {
      aiResponse: assistantMessage,
      feedback: userMessage.feedback
    };
  }

  /**
   * Generate contextual AI response
   */
  private async generateResponse(userInput: string): Promise<string> {
    if (!this.currentTopic) {
      return 'Let\'s start a conversation!';
    }

    // Get conversation context
    const messageCount = this.conversationHistory.filter(m => m.role !== 'system').length;
    const promptIndex = Math.min(Math.floor(messageCount / 2), this.currentTopic.prompts.length - 1);

    // Use predefined prompts for structure
    if (promptIndex < this.currentTopic.prompts.length) {
      const nextPrompt = this.currentTopic.prompts[promptIndex];
      
      // Add contextual acknowledgment
      const acknowledgments = [
        'That\'s interesting! ',
        'I see. ',
        'Great! ',
        'Thank you for sharing. ',
        'That sounds nice. '
      ];
      
      const randomAck = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
      return `${randomAck}${nextPrompt}`;
    }

    // Generate follow-up questions based on topic
    const followUps = this.generateFollowUpQuestions(userInput);
    return followUps[Math.floor(Math.random() * followUps.length)];
  }

  /**
   * Generate follow-up questions
   */
  private generateFollowUpQuestions(userInput: string): string[] {
    const questions = [
      'Can you tell me more about that?',
      'That\'s interesting. What else can you share?',
      'How do you feel about that?',
      'What made you think that way?',
      'Could you give me an example?',
      'What would you do differently?',
      'Have you always felt this way?',
      'What do you think will happen next?'
    ];

    return questions;
  }

  /**
   * Get conversation history
   */
  getHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Get conversation summary
   */
  getSummary(): {
    messageCount: number;
    averageGrammar: number;
    averageVocabulary: number;
    averageFluency: number;
    duration: number;
  } {
    const userMessages = this.conversationHistory.filter(m => m.role === 'user' && m.feedback);
    
    if (userMessages.length === 0) {
      return {
        messageCount: 0,
        averageGrammar: 0,
        averageVocabulary: 0,
        averageFluency: 0,
        duration: 0
      };
    }

    const totalGrammar = userMessages.reduce((sum, m) => sum + (m.feedback?.grammar || 0), 0);
    const totalVocabulary = userMessages.reduce((sum, m) => sum + (m.feedback?.vocabulary || 0), 0);
    const totalFluency = userMessages.reduce((sum, m) => sum + (m.feedback?.fluency || 0), 0);

    const firstMessage = this.conversationHistory[0];
    const lastMessage = this.conversationHistory[this.conversationHistory.length - 1];
    const duration = new Date(lastMessage.timestamp).getTime() - new Date(firstMessage.timestamp).getTime();

    return {
      messageCount: userMessages.length,
      averageGrammar: totalGrammar / userMessages.length,
      averageVocabulary: totalVocabulary / userMessages.length,
      averageFluency: totalFluency / userMessages.length,
      duration: Math.round(duration / 1000) // seconds
    };
  }

  /**
   * End conversation and get final feedback
   */
  endConversation(): {
    summary: ReturnType<typeof this.getSummary>;
    overallFeedback: string;
    recommendations: string[];
  } {
    const summary = this.getSummary();
    
    const avgScore = (summary.averageGrammar + summary.averageVocabulary + summary.averageFluency) / 3;
    
    let overallFeedback = '';
    const recommendations: string[] = [];

    if (avgScore >= 80) {
      overallFeedback = 'Excellent conversation! You demonstrated strong communication skills.';
      recommendations.push('Try more advanced topics to challenge yourself.');
    } else if (avgScore >= 60) {
      overallFeedback = 'Good effort! You\'re making progress in your conversation skills.';
      if (summary.averageGrammar < 70) {
        recommendations.push('Focus on grammar accuracy in your responses.');
      }
      if (summary.averageVocabulary < 70) {
        recommendations.push('Expand your vocabulary by learning new words daily.');
      }
    } else {
      overallFeedback = 'Keep practicing! Conversation skills improve with regular practice.';
      recommendations.push('Start with simpler topics and build confidence.');
      recommendations.push('Practice speaking slowly and clearly.');
    }

    if (summary.messageCount < 5) {
      recommendations.push('Try to have longer conversations for better practice.');
    }

    return {
      summary,
      overallFeedback,
      recommendations
    };
  }

  /**
   * Reset conversation
   */
  reset(): void {
    this.conversationHistory = [];
    this.currentTopic = null;
  }
}

// Singleton instance
export const ConversationAI = new ConversationAIClass();
export default ConversationAI;

