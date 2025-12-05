import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Volume2, Mic, CheckCircle, Clock, ArrowLeft, ArrowRight, MessageCircle,
  BookOpen, Languages, Zap, Star, Target,
  Users, Lightbulb, AlertCircle, Briefcase, ShoppingBag, Globe, PlayCircle, MicOff,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { IntegratedProgressService } from '@/services/IntegratedProgressService';
import { useToast } from '@/hooks/use-toast';
import OnlineTTS from '@/services/OnlineTTS';
import SpeechService from '@/services/SpeechService';
import { checkSpeechRecognitionSupport, getMicrophonePermissionStatus, getSafariGuidance } from '@/utils/microphonePermission';

// Daily Conversation Topics
const dailyConversationTopics = [
  {
    id: 'greetings',
    title: 'Greetings & Introductions',
    description: 'Master professional greetings and introductions',
    duration: '10-15 min',
    level: 'Foundation+',
    icon: Users,
    color: 'from-cyan-500 to-blue-600',
    scenarios: [
      {
        title: 'Meeting Someone New at a Professional Event',
        partnerName: 'Alex',
        dialogue: [
          { speaker: 'Partner', text: "Hello! I'm Alex. Nice to meet you!" },
          { speaker: 'You', text: "Hello, I'm [Your Name]. Nice to meet you too." },
          { speaker: 'Partner', text: "It's great to be here. Is this your first time at this conference?" },
          { speaker: 'You', text: "Yes, it's my first time. I'm really excited to learn from the speakers." },
          { speaker: 'Partner', text: "That's wonderful! What brings you here today?" },
          { speaker: 'You', text: "I'm interested in learning about digital marketing strategies." },
          { speaker: 'Partner', text: "Oh, that's my field! I work in marketing. What do you do for a living?" },
          { speaker: 'You', text: "I work in [Your Field]. How about you? What's your role in marketing?" },
          { speaker: 'Partner', text: "I'm a marketing manager at a tech company. It's quite interesting!" },
          { speaker: 'You', text: "That sounds like a challenging but rewarding position." },
          { speaker: 'Partner', text: "It definitely is! How long have you been in your current role?" },
          { speaker: 'You', text: "I've been working there for about three years now." },
          { speaker: 'Partner', text: "That's impressive! You must really enjoy what you do." },
          { speaker: 'You', text: "Yes, I do. It's been a great learning experience." },
          { speaker: 'Partner', text: "Well, it was lovely meeting you. I hope we can stay in touch!" },
          { speaker: 'You', text: "Absolutely! It was great meeting you too. Have a wonderful day!" }
        ]
      },
      {
        title: 'Casual Greetings with a Colleague',
        partnerName: 'Sarah',
        dialogue: [
          { speaker: 'Partner', text: "Hey there! I'm Sarah. How's it going?" },
          { speaker: 'You', text: "Hey Sarah! I'm doing well, thanks. How about you?" },
          { speaker: 'Partner', text: "Pretty good, thanks! I'm just getting back from lunch." },
          { speaker: 'You', text: "Oh nice! Where did you go?" },
          { speaker: 'Partner', text: "I tried that new Italian restaurant down the street. It was delicious!" },
          { speaker: 'You', text: "I've been meaning to try that place. Would you recommend it?" },
          { speaker: 'Partner', text: "Absolutely! The pasta is amazing. You should definitely check it out." },
          { speaker: 'You', text: "Thanks for the recommendation! I'll probably go there this weekend." },
          { speaker: 'Partner', text: "Great! Let me know what you think. What have you been up to today?" },
          { speaker: 'You', text: "Can't complain! Just working on some projects. What about you?" },
          { speaker: 'Partner', text: "Same here. Just working on a new project. It's keeping me busy." },
          { speaker: 'You', text: "That sounds interesting. What kind of project is it?" },
          { speaker: 'Partner', text: "It's a website redesign for one of our clients. Lots of planning involved." },
          { speaker: 'You', text: "That does sound like a lot of work. I'm sure it will turn out great though." },
          { speaker: 'Partner', text: "Thanks! I hope so. Well, I should get back to it. See you around!" },
          { speaker: 'You', text: "See you! Good luck with your project!" }
        ]
      }
    ]
  },
  {
    id: 'work',
    title: 'Work & Professional Life',
    description: 'Master workplace conversations and professional communication',
    duration: '12-18 min',
    level: 'Foundation+',
    icon: Briefcase,
    color: 'from-purple-500 to-pink-600',
    scenarios: [
      {
        title: 'Job Interview - Discussing Your Experience',
        partnerName: 'Emma',
        dialogue: [
          { speaker: 'Partner', text: "Good morning! Thank you for coming in today. I'm Emma, the hiring manager." },
          { speaker: 'You', text: "Good morning, Emma. It's a pleasure to meet you. Thank you for this opportunity." },
          { speaker: 'Partner', text: "Of course! Let's start with your background. Can you tell me about your current position?" },
          { speaker: 'You', text: "I currently work as a project manager at a software company. I've been there for about four years." },
          { speaker: 'Partner', text: "That's great experience. What are your main responsibilities in that role?" },
          { speaker: 'You', text: "I manage multiple projects simultaneously, coordinate with different teams, and ensure we meet deadlines and quality standards." },
          { speaker: 'Partner', text: "That sounds challenging. What do you enjoy most about your current job?" },
          { speaker: 'You', text: "I really enjoy working with diverse teams and solving complex problems. It's very rewarding when a project succeeds." },
          { speaker: 'Partner', text: "Excellent! What made you interested in this position with our company?" },
          { speaker: 'You', text: "I'm looking for new challenges and opportunities to grow. Your company's innovative approach really appeals to me." },
          { speaker: 'Partner', text: "That's wonderful to hear. Do you have any questions about the role or our company?" },
          { speaker: 'You', text: "Yes, I'd like to know more about the team structure and what success looks like in this position." },
          { speaker: 'Partner', text: "Great question! The team is collaborative, and success means delivering results while maintaining strong relationships." },
          { speaker: 'You', text: "That aligns perfectly with my work style. I'm very interested in moving forward with the next steps." },
          { speaker: 'Partner', text: "Perfect! We'll be in touch soon. Thank you for your time today." },
          { speaker: 'You', text: "Thank you so much, Emma. I look forward to hearing from you. Have a great day!" }
        ]
      },
      {
        title: 'Team Meeting - Presenting Your Ideas',
        partnerName: 'Michael',
        dialogue: [
          { speaker: 'Partner', text: "Good morning, everyone! Thanks for joining. Let's start with the quarterly review." },
          { speaker: 'You', text: "Good morning, Michael. I'd like to share some ideas about improving our workflow." },
          { speaker: 'Partner', text: "That sounds great! Please go ahead and present your suggestions." },
          { speaker: 'You', text: "I've noticed we're spending a lot of time on manual processes. I think we could automate some of these tasks." },
          { speaker: 'Partner', text: "That's an interesting point. Can you elaborate on which processes you're referring to?" },
          { speaker: 'You', text: "Specifically, our data entry and report generation. These could be automated, saving us about 10 hours per week." },
          { speaker: 'Partner', text: "That's significant time savings. How would you propose we implement this?" },
          { speaker: 'You', text: "I suggest we start with a pilot program for one department, then expand if it's successful." },
          { speaker: 'Partner', text: "That's a smart approach. What would be the estimated cost and timeline?" },
          { speaker: 'You', text: "Based on my research, the initial investment would be around $5,000, and we could see results within three months." },
          { speaker: 'Partner', text: "That seems reasonable. I'd like you to prepare a detailed proposal for next week's meeting." },
          { speaker: 'You', text: "Absolutely! I'll have the proposal ready by Friday. I'll include cost analysis and implementation steps." },
          { speaker: 'Partner', text: "Perfect! Thank you for bringing this to our attention. Does anyone else have questions or suggestions?" },
          { speaker: 'You', text: "I'm happy to answer any questions or provide more details if needed." },
          { speaker: 'Partner', text: "Excellent work! Let's move on to the next agenda item." }
        ]
      }
    ]
  },
  {
    id: 'daily-routines',
    title: 'Daily Routines',
    description: 'Master conversations about daily activities, schedules, and lifestyle habits',
    duration: '10-15 min',
    level: 'Foundation+',
    icon: Clock,
    color: 'from-emerald-500 to-teal-600',
    scenarios: [
      {
        title: 'Discussing Morning Routines',
        partnerName: 'Taylor',
        dialogue: [
          { speaker: 'Partner', text: "Good morning! I'm Taylor. How's your morning going?" },
          { speaker: 'You', text: "Good morning, Taylor! It's going well, thanks for asking. How about yours?" },
          { speaker: 'Partner', text: "Pretty good! I'm curious, what time do you usually wake up?" },
          { speaker: 'You', text: "I typically wake up around 6:30 AM on weekdays. What about you?" },
          { speaker: 'Partner', text: "That's early! I usually wake up at 7:00 AM. What do you do first after waking up?" },
          { speaker: 'You', text: "I start by drinking a glass of water, then I do some light stretching or exercise for about 20 minutes." },
          { speaker: 'Partner', text: "That's a great habit! I should try that. Do you have breakfast before or after exercise?" },
          { speaker: 'You', text: "I usually have breakfast after my workout. I find it gives me more energy for the day." },
          { speaker: 'Partner', text: "That makes sense. What do you typically have for breakfast?" },
          { speaker: 'You', text: "I usually have oatmeal with fruits, or sometimes eggs with toast. It depends on how much time I have." },
          { speaker: 'Partner', text: "Sounds healthy! How long does your whole morning routine take?" },
          { speaker: 'You', text: "Usually about an hour and a half from waking up to leaving for work. I try to be efficient." },
          { speaker: 'Partner', text: "That's impressive! I take about two hours, but I'm not as organized. Do you have any tips?" },
          { speaker: 'You', text: "I prepare my clothes and work bag the night before. That saves a lot of time in the morning." },
          { speaker: 'Partner', text: "That's a smart idea! I'll definitely try that. Thanks for sharing your routine!" },
          { speaker: 'You', text: "You're welcome! Good luck with your morning routine. Have a great day!" }
        ]
      },
      {
        title: 'Evening Activities and Weekend Plans',
        partnerName: 'Jordan',
        dialogue: [
          { speaker: 'Partner', text: "Hey there! I'm Jordan. How was your day?" },
          { speaker: 'You', text: "Hi Jordan! It was pretty busy but productive. How about yours?" },
          { speaker: 'Partner', text: "It was good, thanks! What do you usually do in the evenings after work?" },
          { speaker: 'You', text: "I usually relax for a bit, then I cook dinner. After that, I might watch a show or read a book." },
          { speaker: 'Partner', text: "That sounds nice and balanced. Do you cook every day?" },
          { speaker: 'You', text: "I try to cook most days, but sometimes I order takeout if I'm too tired. What about you?" },
          { speaker: 'Partner', text: "I cook about three times a week. The other days I eat out or order food. Do you have any favorite dishes you like to cook?" },
          { speaker: 'You', text: "I really enjoy making pasta dishes and stir-fries. They're quick and healthy. Do you like cooking?" },
          { speaker: 'Partner', text: "I do, but I'm still learning. Maybe you could share some recipes sometime!" },
          { speaker: 'You', text: "Absolutely! I'd be happy to. What do you usually do on weekends?" },
          { speaker: 'Partner', text: "On Saturdays, I like to sleep in and then go grocery shopping. Sundays are for relaxing and preparing for the week. How about you?" },
          { speaker: 'You', text: "I usually do some house cleaning on Saturday mornings, then I meet friends or do something fun in the afternoon." },
          { speaker: 'Partner', text: "That sounds like a good balance of productivity and fun. Do you have any weekend hobbies?" },
          { speaker: 'You', text: "I enjoy hiking when the weather is nice, and I also like trying new restaurants in the city." },
          { speaker: 'Partner', text: "Those are great activities! Maybe we could go hiking together sometime." },
          { speaker: 'You', text: "That would be wonderful! I'd love that. Let me know when you're free." }
        ]
      }
    ]
  },
  {
    id: 'hobbies',
    title: 'Hobbies & Interests',
    description: 'Master conversations about leisure activities, interests, and personal passions',
    duration: '10-15 min',
    level: 'Foundation+',
    icon: Star,
    color: 'from-amber-500 to-orange-600',
    scenarios: [
      {
        title: 'Discovering Shared Interests',
        partnerName: 'Casey',
        dialogue: [
          { speaker: 'Partner', text: "Hi there! I'm Casey. It's nice to meet you. What do you like to do in your free time?" },
          { speaker: 'You', text: "Hi Casey! Nice to meet you too. I have several hobbies, but I really love reading and photography." },
          { speaker: 'Partner', text: "That's great! What kind of books do you enjoy reading?" },
          { speaker: 'You', text: "I'm really into science fiction and mystery novels. I find them very engaging and thought-provoking." },
          { speaker: 'Partner', text: "Interesting! I prefer non-fiction, especially biographies and history books. How long have you been reading?" },
          { speaker: 'You', text: "I've been an avid reader since I was a teenager. It's been about 15 years now. What about photography?" },
          { speaker: 'Partner', text: "Photography sounds fascinating! What do you like to photograph?" },
          { speaker: 'You', text: "I mostly take pictures of nature and landscapes. I love capturing beautiful sunsets and mountain views." },
          { speaker: 'Partner', text: "That must be amazing! Do you travel a lot for photography?" },
          { speaker: 'You', text: "Yes, I try to go on photography trips a few times a year. It's a great way to combine my love for travel and photography." },
          { speaker: 'Partner', text: "That sounds like a wonderful hobby! Have you ever had your photos published or exhibited?" },
          { speaker: 'You', text: "I've had a few photos featured in local magazines, and I also share them on social media. It's very rewarding." },
          { speaker: 'Partner', text: "That's impressive! Do you have any other hobbies besides reading and photography?" },
          { speaker: 'You', text: "I also enjoy cooking and trying new recipes. It's relaxing and I love sharing meals with friends." },
          { speaker: 'Partner', text: "That's wonderful! It sounds like you have a great balance of creative and relaxing activities." },
          { speaker: 'You', text: "Thank you! What about you? What are your main interests and hobbies?" }
        ]
      },
      {
        title: 'Discussing Sports and Fitness Activities',
        partnerName: 'Morgan',
        dialogue: [
          { speaker: 'Partner', text: "Hello! I'm Morgan. I heard you're interested in fitness. Is that true?" },
          { speaker: 'You', text: "Hi Morgan! Yes, I'm quite active. I enjoy playing tennis and going to the gym regularly." },
          { speaker: 'Partner', text: "That's fantastic! How often do you play tennis?" },
          { speaker: 'You', text: "I play tennis twice a week, usually on weekends. It's a great way to stay fit and have fun." },
          { speaker: 'Partner', text: "I've always wanted to try tennis. Is it difficult to learn?" },
          { speaker: 'You', text: "It takes some practice, but it's definitely learnable. I'd be happy to show you the basics if you're interested." },
          { speaker: 'Partner', text: "That would be amazing! What about the gym? What kind of workouts do you do?" },
          { speaker: 'You', text: "I focus on strength training and cardio. I usually spend about an hour there, three times a week." },
          { speaker: 'Partner', text: "That's a good routine! Do you work out alone or with a trainer?" },
          { speaker: 'You', text: "Mostly alone, but I sometimes work out with friends. It's more motivating that way." },
          { speaker: 'Partner', text: "I agree! Working out with others can be more fun. Have you been doing this for a long time?" },
          { speaker: 'You', text: "I've been active for about five years now. It's become an important part of my lifestyle." },
          { speaker: 'Partner', text: "That's inspiring! Do you follow any specific diet or nutrition plan?" },
          { speaker: 'You', text: "I try to eat balanced meals with plenty of protein and vegetables. I'm not too strict, but I focus on healthy choices." },
          { speaker: 'Partner', text: "That sounds like a sensible approach. Maybe we could work out together sometime!" },
          { speaker: 'You', text: "Absolutely! I'd love that. Let's plan something for next week." }
        ]
      }
    ]
  },
  {
    id: 'travel',
    title: 'Travel & Transportation',
    description: 'Master conversations about travel, transportation, and exploring new places',
    duration: '12-18 min',
    level: 'Foundation+',
    icon: Globe,
    color: 'from-blue-500 to-indigo-600',
    scenarios: [
      {
        title: 'Planning a Trip and Booking Travel',
        partnerName: 'Sam',
        dialogue: [
          { speaker: 'Partner', text: "Hello! I'm Sam. I heard you're planning a trip. Where are you thinking of going?" },
          { speaker: 'You', text: "Hi Sam! Yes, I'm planning to visit Japan next month. I've always wanted to see Tokyo and Kyoto." },
          { speaker: 'Partner', text: "That sounds amazing! Japan is beautiful. Have you been there before?" },
          { speaker: 'You', text: "No, this will be my first time. I'm really excited but also a bit nervous about the language barrier." },
          { speaker: 'Partner', text: "Don't worry! Many people speak English in tourist areas. How are you planning to get there?" },
          { speaker: 'You', text: "I'm going to fly. I found a good deal on a direct flight that takes about 12 hours." },
          { speaker: 'Partner', text: "That's a long flight! Have you booked your tickets yet?" },
          { speaker: 'You', text: "Yes, I booked them last week. I also reserved a hotel in Tokyo for the first few nights." },
          { speaker: 'Partner', text: "Great planning! What about transportation within Japan? Are you going to use the train system?" },
          { speaker: 'You', text: "Yes, I'm planning to get a Japan Rail Pass. I heard it's very convenient for traveling between cities." },
          { speaker: 'Partner', text: "That's a smart choice! The bullet trains are amazing. How long are you planning to stay?" },
          { speaker: 'You', text: "I'll be there for two weeks. I want to spend about a week in Tokyo and another week exploring other cities." },
          { speaker: 'Partner', text: "That's a good amount of time. Have you made a list of places you want to visit?" },
          { speaker: 'You', text: "Yes, I have a long list! I want to see the temples in Kyoto, visit Mount Fuji, and try lots of local food." },
          { speaker: 'Partner', text: "That sounds like a perfect itinerary! Japanese food is incredible. Are you traveling alone or with someone?" },
          { speaker: 'You', text: "I'm going with a friend. We've been planning this trip together for months." },
          { speaker: 'Partner', text: "That's wonderful! Traveling with a friend makes it even more enjoyable. I'm sure you'll have an amazing time!" },
          { speaker: 'You', text: "Thank you! I'm really looking forward to it. Have you been to Japan before?" }
        ]
      },
      {
        title: 'At the Airport and Hotel Check-in',
        partnerName: 'Alex',
        dialogue: [
          { speaker: 'Partner', text: "Good morning! Welcome to our hotel. How can I help you today?" },
          { speaker: 'You', text: "Good morning! I have a reservation under the name [Your Name]. I'd like to check in, please." },
          { speaker: 'Partner', text: "Of course! Let me look that up for you. Yes, I found your reservation for three nights. Is that correct?" },
          { speaker: 'You', text: "Yes, that's correct. I'll be checking out on Friday morning." },
          { speaker: 'Partner', text: "Perfect! I have a room on the fifth floor with a city view. Would that be suitable?" },
          { speaker: 'You', text: "That sounds great! Does the room have Wi-Fi and air conditioning?" },
          { speaker: 'Partner', text: "Yes, both are included. The Wi-Fi password is in your room information folder." },
          { speaker: 'You', text: "Excellent! What time is breakfast served?" },
          { speaker: 'Partner', text: "Breakfast is served from 7:00 AM to 10:00 AM in the restaurant on the ground floor." },
          { speaker: 'You', text: "Perfect, thank you. Is there a gym or fitness center in the hotel?" },
          { speaker: 'Partner', text: "Yes, we have a fully equipped gym on the third floor, open 24 hours. There's also a swimming pool on the rooftop." },
          { speaker: 'You', text: "That's wonderful! I'll definitely check those out. What about parking? Do you have parking available?" },
          { speaker: 'Partner', text: "Yes, we have underground parking. It's $20 per night. Would you like to reserve a spot?" },
          { speaker: 'You', text: "No, thank you. I'm using public transportation. Could you tell me the best way to get to the city center?" },
          { speaker: 'Partner', text: "Absolutely! There's a metro station just two blocks away. The train takes about 15 minutes to the city center." },
          { speaker: 'You', text: "That's very convenient. Thank you for all the information. I'm looking forward to my stay." },
          { speaker: 'Partner', text: "You're very welcome! Here's your room key. If you need anything, just call the front desk. Enjoy your stay!" },
          { speaker: 'You', text: "Thank you so much! I'm sure I will." }
        ]
      }
    ]
  },
  {
    id: 'shopping',
    title: 'Shopping & Dining',
    description: 'Master conversations about shopping, dining out, and customer service interactions',
    duration: '10-15 min',
    level: 'Foundation+',
    icon: ShoppingBag,
    color: 'from-rose-500 to-pink-600',
    scenarios: [
      {
        title: 'Fine Dining Experience - Ordering and Special Requests',
        partnerName: 'Marcus',
        dialogue: [
          { speaker: 'Partner', text: "Good evening! Welcome to our restaurant. I'm Marcus, your server for tonight. Do you have a reservation?" },
          { speaker: 'You', text: "Good evening! Yes, I have a reservation under the name [Your Name] for 7:30 PM." },
          { speaker: 'Partner', text: "Perfect! I have your table ready. Would you prefer a table by the window or something more private?" },
          { speaker: 'You', text: "A table by the window would be lovely, thank you." },
          { speaker: 'Partner', text: "Excellent choice! Right this way. Here are your menus. Can I start you off with something to drink?" },
          { speaker: 'You', text: "Yes, I'd like to see your wine list, please. Do you have any recommendations?" },
          { speaker: 'Partner', text: "We have an excellent selection. For red wine, I'd recommend our house Cabernet Sauvignon. For white, our Chardonnay is very popular." },
          { speaker: 'You', text: "I'll have a glass of the Chardonnay, please. Also, could you tell me about today's specials?" },
          { speaker: 'Partner', text: "Of course! Today we have a grilled salmon with seasonal vegetables, and our chef's special pasta with truffle sauce. Both are excellent." },
          { speaker: 'You', text: "The salmon sounds delicious. Is it possible to have it without dairy? I have a dietary restriction." },
          { speaker: 'Partner', text: "Absolutely! I'll make sure the kitchen prepares it without any dairy products. Would you like a side salad with that?" },
          { speaker: 'You', text: "Yes, a side salad would be perfect. What kind of dressing do you have?" },
          { speaker: 'Partner', text: "We have Italian, Caesar, balsamic vinaigrette, and a house-made lemon herb dressing." },
          { speaker: 'You', text: "I'll have the balsamic vinaigrette, please. And could I get the salmon medium-well?" },
          { speaker: 'Partner', text: "Certainly! I'll make a note of that. Is there anything else I can help you with?" },
          { speaker: 'You', text: "That's all for now, thank you. Everything sounds wonderful!" },
          { speaker: 'Partner', text: "Perfect! I'll put your order in right away. Your wine will be here shortly. Enjoy your evening!" }
        ]
      },
      {
        title: 'Shopping for Clothes - Finding the Right Size and Style',
        partnerName: 'Emma',
        dialogue: [
          { speaker: 'Partner', text: "Hello! Welcome to our store. I'm Emma. How can I help you today?" },
          { speaker: 'You', text: "Hi Emma! I'm looking for a professional blazer for work. Do you have any in stock?" },
          { speaker: 'Partner', text: "Yes, we have a great selection! What size are you looking for?" },
          { speaker: 'You', text: "I usually wear a medium, but I'd like to try on a few sizes to make sure." },
          { speaker: 'Partner', text: "Of course! Let me show you what we have. We have blazers in navy, black, and gray. Which color would you prefer?" },
          { speaker: 'You', text: "I'm interested in navy or black. Do you have both in medium?" },
          { speaker: 'Partner', text: "Yes, we do! Let me get those for you. Would you like to try them on?" },
          { speaker: 'You', text: "Yes, please. Where are the fitting rooms?" },
          { speaker: 'Partner', text: "They're right over there, to your left. I'll bring the blazers to you. Is there a specific style you're looking for?" },
          { speaker: 'You', text: "I prefer something classic and well-fitted, not too tight or too loose." },
          { speaker: 'Partner', text: "Perfect! These are our classic fit blazers. They're very popular for professional settings. Let me know if you need a different size." },
          { speaker: 'You', text: "Thank you! Actually, could I also see the gray one? I'd like to compare all three colors." },
          { speaker: 'Partner', text: "Absolutely! I'll bring that as well. What's the occasion, if you don't mind me asking?" },
          { speaker: 'You', text: "I have an important presentation next week, and I want to look professional and confident." },
          { speaker: 'Partner', text: "That's a great choice! A well-fitted blazer always makes a strong impression. I'm sure you'll look great!" },
          { speaker: 'You', text: "Thank you! I'll try these on and let you know if I need any adjustments." },
          { speaker: 'Partner', text: "Perfect! Take your time. I'll be here if you need anything else." }
        ]
      }
    ]
  }
];


const QuickPracticeSession = () => {
  const { sessionType: paramSessionType } = useParams<{ sessionType: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract sessionType from URL pathname if not in params
  const sessionType = paramSessionType || (location.pathname.includes('daily-conversation') ? 'daily-conversation' : undefined);
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; delay: number; opacity: number }>>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [userResponses, setUserResponses] = useState<Record<number, string>>({});
  const [practiceScores, setPracticeScores] = useState<Record<number, number>>({});
  const [isSpeaking, setIsSpeaking] = useState<Record<number, boolean>>({});
  const [isListening, setIsListening] = useState<Record<number, boolean>>({});
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [ttsInitialized, setTtsInitialized] = useState(false);
  const [sttAvailable, setSttAvailable] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [completedLines, setCompletedLines] = useState<Set<number>>(new Set());
  const [showInstructions, setShowInstructions] = useState(false);
  const [topicProgress, setTopicProgress] = useState<any>({});
  const dialogueEndRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Record<number, HTMLDivElement>>({});
  const recognitionRef = useRef<any>(null);

  // Redirect invalid or deprecated routes back to adults page
  // Only allow daily-conversation session type
  useEffect(() => {
    // Only redirect if we have a sessionType that's not daily-conversation
    // Don't redirect if sessionType is undefined (might be loading)
    if (sessionType && sessionType !== 'daily-conversation') {
      navigate('/adults', { replace: true });
    }
  }, [sessionType, navigate]);

  // Initialize TTS and STT
  useEffect(() => {
    const initServices = async () => {
      // Initialize TTS
      try {
        await OnlineTTS.initialize();
        setTtsInitialized(true);
        console.log('✅ TTS initialized for practice session');
      } catch (error) {
        console.error('Failed to initialize TTS:', error);
        toast({
          title: "Audio Not Available",
          description: "Text-to-speech is not available in your browser.",
          variant: "default"
        });
      }

      // Check STT availability with enhanced permission checking
      const speechCheck = checkSpeechRecognitionSupport();
      setSttAvailable(speechCheck.supported);
      if (!speechCheck.supported) {
        const status = getMicrophonePermissionStatus();
        let description = speechCheck.error || "Your browser doesn't support speech recognition.";
        if (status.errorType === 'not-secure') {
          description = "Speech recognition requires HTTPS (secure connection). Please use https:// to access this site.";
        }
        toast({
          title: "Speech Recognition Not Available",
          description: description,
          variant: "default",
          duration: 10000
        });
      }
    };
    initServices();
  }, [toast]);

  // Load topic progress from localStorage
  useEffect(() => {
    try {
      const progress = JSON.parse(
        localStorage.getItem('dailyConversationProgress') || '{}'
      );
      setTopicProgress(progress);
    } catch (error) {
      console.error('Error loading topic progress:', error);
      setTopicProgress({});
    }
  }, []);

  // Listen for progress updates
  useEffect(() => {
    const handleProgressUpdate = () => {
      try {
        const progress = JSON.parse(
          localStorage.getItem('dailyConversationProgress') || '{}'
        );
        setTopicProgress(progress);
      } catch (error) {
        console.error('Error updating topic progress:', error);
      }
    };
    
    window.addEventListener('dailyConversationProgressUpdated', handleProgressUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === 'dailyConversationProgress') {
        handleProgressUpdate();
      }
    });
    
    return () => {
      window.removeEventListener('dailyConversationProgressUpdated', handleProgressUpdate);
    };
  }, []);

  // Restore session from cache if available
  useEffect(() => {
    if (selectedTopic && currentScenarioData) {
      const cachedSession = localStorage.getItem('dailyConversationSession');
      if (cachedSession) {
        try {
          const session = JSON.parse(cachedSession);
          if (session.topic === selectedTopic && session.scenario === currentScenario) {
            setIsSessionActive(true);
            setSessionStartTime(new Date(session.startTime));
            if (session.user_responses) setUserResponses(session.user_responses);
            if (session.practice_scores) setPracticeScores(session.practice_scores);
            if (session.score) setOverallScore(session.score);
          }
        } catch (e) {
          console.error('Error restoring session from cache:', e);
        }
      }
    }
  }, [selectedTopic, currentScenario]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors
        }
      }
    };
  }, []);

  // Generate animated stars
  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 200 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 3,
        opacity: Math.random() * 0.8 + 0.2
      }));
      setStars(newStars);
    };
    generateStars();
  }, []);

  // Get session configuration based on type
  const getSessionConfig = () => {
    switch (sessionType) {
      case 'daily-conversation':
        return {
          title: 'Daily Conversation',
          description: 'Practice professional speaking about everyday topics',
          icon: MessageCircle,
          color: 'from-cyan-500 to-blue-600',
          topics: dailyConversationTopics
        };
      case 'grammar':
        return {
          title: 'Grammar Challenge',
          description: 'Test and improve your professional grammar skills',
          icon: BookOpen,
          color: 'from-purple-500 to-pink-600',
          topics: []
        };
      case 'vocabulary':
        return {
          title: 'Vocabulary Builder',
          description: 'Learn professional terminology in context',
          icon: Languages,
          color: 'from-amber-500 to-orange-600',
          topics: []
        };
      default:
        return {
          title: 'Practice Session',
          description: 'Select a practice session to begin',
          icon: Target,
          color: 'from-cyan-500 to-blue-600',
          topics: []
        };
    }
  };

  const config = getSessionConfig();
  const Icon = config.icon;
  const selectedTopicData = dailyConversationTopics.find(t => t.id === selectedTopic);
  const currentScenarioData = selectedTopicData?.scenarios[currentScenario];
  const scenarioAdvanceRef = useRef(false); // Prevent multiple triggers

  // Check for scenario completion and auto-advance (runs when practiceScores change)
  useEffect(() => {
    if (!isSessionActive || !currentScenarioData || !selectedTopicData) {
      scenarioAdvanceRef.current = false;
      return;
    }
    
    const allUserLines = currentScenarioData.dialogue
      .map((line, idx) => line.speaker === 'You' ? idx : -1)
      .filter(idx => idx !== -1);
    
    if (allUserLines.length === 0) return;
    
    const completedUserLines = allUserLines.filter(idx => {
      const lineScore = practiceScores[idx];
      return lineScore !== undefined && lineScore >= 50;
    });
    
    // If all user lines completed with 50% or higher, auto-advance to next scenario
    if (completedUserLines.length === allUserLines.length && 
        allUserLines.length > 0 &&
        currentScenario < selectedTopicData.scenarios.length - 1 &&
        !scenarioAdvanceRef.current) {
      scenarioAdvanceRef.current = true; // Prevent multiple triggers
      console.log('✅ All lines completed! Triggering Scenario 2 advance via useEffect...', {
        completedLines: completedUserLines.length,
        totalLines: allUserLines.length,
        currentScenario,
        nextScenario: currentScenario + 1,
        totalScenarios: selectedTopicData.scenarios.length
      });
      
      toast({
        title: "🎉 Scenario Complete!",
        description: `All ${allUserLines.length} responses passed (≥50%)! Moving to next scenario...`,
      });
      
      setTimeout(() => {
        console.log('Executing Scenario 2 advance...');
        const nextScenario = currentScenario + 1;
        const nextScenarioData = selectedTopicData.scenarios[nextScenario];
        
        setCurrentScenario(nextScenario);
        setCurrentDialogueIndex(0); // Reset to first line
        setCompletedLines(new Set());
        setUserResponses({});
        setPracticeScores({});
        setOverallScore(0);
        
        // Reset the ref after a delay to allow for new scenario
        setTimeout(() => {
          scenarioAdvanceRef.current = false;
        }, 1000);
        
        // Scroll to top of new scenario
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Save Scenario 1 progress before moving to Scenario 2
        const scenario1UserLines = currentScenarioData.dialogue
          .map((line, idx) => line.speaker === 'You' ? idx : -1)
          .filter(idx => idx !== -1);
        const scenario1Scores = scenario1UserLines
          .map(idx => practiceScores[idx])
          .filter((score): score is number => typeof score === 'number' && score >= 0);
        const scenario1Percentage = scenario1Scores.length > 0
          ? Math.round(scenario1Scores.reduce((sum, score) => sum + score, 0) / scenario1Scores.length)
          : 0;
        const scenario1Points = Math.round(scenario1Percentage / 10) + (scenario1Scores.length * 2);
        saveScenarioProgress(0, scenario1Points, scenario1Percentage);
        
        // Auto-start first conversation line if it's from Partner/AI
        if (nextScenarioData && nextScenarioData.dialogue.length > 0) {
          const firstLine = nextScenarioData.dialogue[0];
          if (firstLine && firstLine.speaker !== 'You' && ttsInitialized) {
            setTimeout(async () => {
              console.log('Auto-starting first line of Scenario 2:', firstLine.text);
              await speakText(firstLine.text, 0);
              setCurrentDialogueIndex(1);
              
              // Check if next line is user's turn
              if (nextScenarioData.dialogue.length > 1) {
                const nextLine = nextScenarioData.dialogue[1];
                if (nextLine.speaker === 'You') {
                  setTimeout(() => {
                    scrollToLine(1);
                    toast({
                      title: "Your Turn! 🎤",
                      description: `Speak: "${nextLine.text}"`,
                    });
                  }, 1000);
                }
              }
            }, 1000);
          }
        }
      }, 2500);
    }
  }, [practiceScores, isSessionActive, currentScenarioData, selectedTopicData, currentScenario, toast]);
  
  // Reset the ref when scenario changes
  useEffect(() => {
    scenarioAdvanceRef.current = false;
  }, [currentScenario]);

  // Auto-start first conversation line when scenario changes (if it's from Partner/AI)
  // This handles manual scenario changes (not auto-advance, which is handled in the setTimeout above)
  useEffect(() => {
    // Only trigger if we're in a session, have scenario data, TTS is ready, and we're at the start
    // Also check that we didn't just auto-advance (which has its own logic)
    if (isSessionActive && currentScenarioData && ttsInitialized && currentDialogueIndex === 0) {
      const firstLine = currentScenarioData.dialogue[0];
      if (firstLine && firstLine.speaker !== 'You') {
        // Use a ref to prevent double-triggering with auto-advance logic
        const shouldAutoStart = !scenarioAdvanceRef.current;
        
        if (shouldAutoStart) {
          // Small delay to ensure state is settled after scenario change
          setTimeout(async () => {
            console.log('Auto-starting first line of new scenario:', firstLine.text);
            await speakText(firstLine.text, 0);
            setCurrentDialogueIndex(1);
            
            // Check if next line is user's turn
            if (currentScenarioData.dialogue.length > 1) {
              const nextLine = currentScenarioData.dialogue[1];
              if (nextLine.speaker === 'You') {
                setTimeout(() => {
                  scrollToLine(1);
                  toast({
                    title: "Your Turn! 🎤",
                    description: `Speak: "${nextLine.text}"`,
                  });
                }, 1000);
              }
            }
          }, 500);
        }
      }
    }
  }, [currentScenario, isSessionActive, currentScenarioData, ttsInitialized, currentDialogueIndex]);

  const handleStartPractice = (topicId: string) => {
    setSelectedTopic(topicId);
    setCurrentScenario(0);
    setCurrentDialogueIndex(0);
    setCompletedLines(new Set());
    setUserResponses({});
    setPracticeScores({});
    setOverallScore(0);
  };

  const handleNextScenario = () => {
    if (selectedTopicData && currentScenario < selectedTopicData.scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
      setCurrentDialogueIndex(0);
      setCompletedLines(new Set());
      setUserResponses({});
      setPracticeScores({});
    }
  };

  const handlePreviousScenario = () => {
    if (currentScenario > 0) {
      setCurrentScenario(currentScenario - 1);
      setCurrentDialogueIndex(0);
      setCompletedLines(new Set());
      setUserResponses({});
      setPracticeScores({});
    }
  };

  // If no session type, show selection (but not if we're on daily-conversation route)
  if (!sessionType && !location.pathname.includes('daily-conversation')) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {stars.map((star, index) => (
            <div
              key={index}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                opacity: star.opacity,
                boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.opacity})`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 pb-12 pt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/adults')}
              className="mb-8 text-cyan-300 hover:text-cyan-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Adults Page
            </Button>

            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                Quick Practice Sessions
              </h1>
              <p className="text-cyan-100/80 text-lg">Select a practice session to begin</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                { type: 'daily-conversation', title: 'Daily Conversation', icon: MessageCircle, color: 'from-cyan-500 to-blue-600' },
                { type: 'grammar', title: 'Grammar Challenge', icon: BookOpen, color: 'from-purple-500 to-pink-600' },
                { type: 'vocabulary', title: 'Vocabulary Builder', icon: Languages, color: 'from-amber-500 to-orange-600' }
              ].map((session) => {
                const SessionIcon = session.icon;
                return (
                  <Card
                    key={session.type}
                    className="group cursor-pointer bg-slate-900/60 backdrop-blur-xl border-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
                    onClick={() => navigate(`/adults/practice/${session.type}`)}
                  >
                    <CardContent className="p-8">
                      <div className={cn("w-16 h-16 rounded-xl flex items-center justify-center mb-6 text-white bg-gradient-to-r", session.color)}>
                        <SessionIcon className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">{session.title}</h3>
                      <Button className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600">
                        Start Practice
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Speak text using TTS
  const speakText = async (text: string, index: number) => {
    if (!ttsInitialized) {
      toast({
        title: "Audio Not Ready",
        description: "Please wait for audio to initialize",
        variant: "default"
      });
      return;
    }

    try {
      setIsSpeaking(prev => ({ ...prev, [index]: true }));
      
      // Use a professional adult voice profile
      const adultVoiceProfile = {
        name: 'Professional',
        pitch: 1.0,
        rate: 0.9, // Slightly slower for clarity
        volume: 1.0,
        voiceName: 'Microsoft Zira - English (United States)',
        description: 'Professional adult conversation voice'
      };

      await OnlineTTS.speak(text, adultVoiceProfile);
    } catch (error) {
      console.error('Error speaking text:', error);
      toast({
        title: "Audio Error",
        description: "Failed to play audio. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSpeaking(prev => ({ ...prev, [index]: false }));
    }
  };

  // Calculate score for user response
  const calculateResponseScore = (userResponse: string, expectedText: string): number => {
    if (!userResponse.trim()) return 0;
    
    const userLower = userResponse.toLowerCase().trim();
    const expectedLower = expectedText.toLowerCase().trim();
    
    // Exact match
    if (userLower === expectedLower) return 100;
    
    // Check for key phrases
    const keyPhrases = expectedLower.split(/[.!?]/).filter(p => p.trim().length > 5);
    let matches = 0;
    keyPhrases.forEach(phrase => {
      if (userLower.includes(phrase.trim())) matches++;
    });
    
    // Word overlap
    const userWords = new Set(userLower.split(/\s+/));
    const expectedWords = new Set(expectedLower.split(/\s+/));
    const commonWords = [...userWords].filter(w => expectedWords.has(w));
    const wordScore = (commonWords.length / Math.max(expectedWords.size, 1)) * 50;
    
    // Phrase match score
    const phraseScore = (matches / Math.max(keyPhrases.length, 1)) * 30;
    
    // Length similarity (20 points)
    const lengthDiff = Math.abs(userResponse.length - expectedText.length);
    const maxLength = Math.max(userResponse.length, expectedText.length);
    const lengthScore = Math.max(0, 20 - (lengthDiff / maxLength) * 20);
    
    return Math.min(100, Math.round(wordScore + phraseScore + lengthScore));
  };

  // Start listening for user speech
  const startListening = async (index: number) => {
    if (!sttAvailable) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Please use Chrome or Edge browser for voice practice.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsListening(prev => ({ ...prev, [index]: true }));
      setInterimTranscript('');

      const result = await SpeechService.startRecognition({
        lang: 'en-US',
        interimResults: true,
        continuous: false,
        timeoutMs: 15000, // 15 seconds max
        autoStopOnSilence: true,
        silenceTimeoutMs: 2000, // Stop after 2 seconds of silence
        onInterimResult: (transcript, isFinal) => {
          if (!isFinal) {
            setInterimTranscript(transcript);
          }
        }
      });

      // Process the result
      const spokenText = result.transcript.trim();
      if (spokenText) {
        handlePracticeResponse(index, spokenText);
        toast({
          title: "Response Recorded",
          description: `You said: "${spokenText.substring(0, 50)}${spokenText.length > 50 ? '...' : ''}"`,
        });
      } else {
        toast({
          title: "No Speech Detected",
          description: "Please try speaking again.",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Speech recognition error:', error);
      if (error.message !== 'STT timeout' && error.message !== 'No speech detected') {
        let errorMessage = error.message || "Failed to recognize speech. Please try again.";
        let duration = 5000;
        
        // Provide more helpful error messages
        if (errorMessage.includes('denied') || errorMessage.includes('not-allowed')) {
          errorMessage = "Microphone access denied. Please allow microphone access in your browser settings.";
          duration = 8000;
          
          // Add Safari-specific guidance
          const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
          if (isSafari) {
            const safariGuidance = getSafariGuidance();
            // Safari guidance is HTML, so we'll just mention it in the toast
            errorMessage += " (Safari users: Check Settings > Safari > Camera & Microphone)";
          }
        } else if (errorMessage.includes('HTTPS') || errorMessage.includes('secure')) {
          errorMessage = "Speech recognition requires HTTPS (secure connection). Please use https:// to access this site.";
          duration = 8000;
        }
        
        toast({
          title: "Recognition Error",
          description: errorMessage,
          variant: "destructive",
          duration: duration
        });
      }
    } finally {
      setIsListening(prev => ({ ...prev, [index]: false }));
      setInterimTranscript('');
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
    }
    setIsListening({});
    setInterimTranscript('');
  };

  // Smooth scroll to a specific line
  const scrollToLine = (index: number) => {
    const lineElement = lineRefs.current[index];
    if (lineElement) {
      lineElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
    }
  };

  // Handle user practice response (from speech or manual)
  const handlePracticeResponse = async (index: number, response: string) => {
    setUserResponses(prev => ({ ...prev, [index]: response }));
    
    if (currentScenarioData) {
      const expectedLine = currentScenarioData.dialogue[index];
      if (expectedLine && expectedLine.speaker === 'You') {
        const score = calculateResponseScore(response, expectedLine.text);
        const updatedScores = { ...practiceScores, [index]: score };
        setPracticeScores(updatedScores);
        
        // Update overall score
        const allScores = updatedScores;
        const userLines = currentScenarioData.dialogue
          .map((line, idx) => line.speaker === 'You' ? idx : -1)
          .filter(idx => idx !== -1);
        const userScores = userLines.map(idx => allScores[idx] || 0);
        const avgScore = userScores.length > 0 
          ? Math.round(userScores.reduce((a, b) => a + b, 0) / userScores.length)
          : 0;
        setOverallScore(avgScore);

        // Auto-advance to next line if score is good (50% or higher)
        if (score >= 50 && index < currentScenarioData.dialogue.length - 1) {
          // Only mark as completed if score is 50% or higher
          setCompletedLines(prev => new Set([...prev, index]));
          const nextIndex = index + 1;
          setCurrentDialogueIndex(nextIndex);
          
          // Scroll to next line smoothly
          setTimeout(() => scrollToLine(nextIndex), 300);
          
          if (nextIndex < currentScenarioData.dialogue.length) {
            const nextLine = currentScenarioData.dialogue[nextIndex];
            
            // If next line is from partner, auto-play it
            if (nextLine.speaker !== 'You') {
              setTimeout(async () => {
                await speakText(nextLine.text, nextIndex);
                
                // After partner speaks, check if next is user line
                const userLineIndex = nextIndex + 1;
                if (userLineIndex < currentScenarioData.dialogue.length) {
                  const userLine = currentScenarioData.dialogue[userLineIndex];
                  if (userLine.speaker === 'You') {
                    setTimeout(() => {
                      scrollToLine(userLineIndex);
                      toast({
                        title: "Your Turn! 🎤",
                        description: `Speak: "${userLine.text}"`,
                      });
                    }, 1000);
                  }
                }
              }, 500);
            } else {
              // Next line is also "You" - prompt immediately
              setTimeout(() => {
                scrollToLine(nextIndex);
                toast({
                  title: "Your Turn! 🎤",
                  description: `Speak: "${nextLine.text}"`,
                });
              }, 500);
            }
          }
          
          // Check if we've completed all lines in current scenario with 50% or higher
          const allUserLines = currentScenarioData.dialogue
            .map((line, idx) => line.speaker === 'You' ? idx : -1)
            .filter(idx => idx !== -1);
          
          // Get all scores including the current one
          const allScores = updatedScores;
          
          // Check which user lines are completed with 50% or higher
          // A line is considered completed if:
          // 1. It has been attempted (has a score)
          // 2. The score is >= 50%
          const completedUserLines = allUserLines.filter(idx => {
            const lineScore = allScores[idx];
            return lineScore !== undefined && lineScore >= 50;
          });
          
          // Debug: Log the completion status
          console.log('Scenario Completion Check:', {
            totalUserLines: allUserLines.length,
            completedLines: completedUserLines.length,
            allUserLineIndices: allUserLines,
            scores: allUserLines.map(idx => ({ index: idx, score: allScores[idx] })),
            completedIndices: completedUserLines
          });
          
          // Note: Scenario auto-advance is now handled by useEffect hook
          // This check is kept for logging purposes
          if (completedUserLines.length === allUserLines.length && 
              allUserLines.length > 0 &&
              currentScenario < (selectedTopicData?.scenarios.length || 1) - 1) {
            console.log('✅ All lines completed! useEffect will handle Scenario 2 advance...');
          } else if (completedUserLines.length < allUserLines.length) {
            // Show progress if not all lines completed
            const remaining = allUserLines.length - completedUserLines.length;
            console.log(`Progress: ${completedUserLines.length}/${allUserLines.length} lines completed. ${remaining} remaining.`);
          }
        } else if (score < 50) {
          // If score is low, encourage retry
          toast({
            title: "Keep Practicing! 💪",
            description: `Your score: ${score}%. You need 50% or higher to advance. Try again!`,
            variant: "default"
          });
        }
      }
    }
  };


  const handleStartPracticeSession = async () => {
    try {
      setIsSessionActive(true);
      setSessionStartTime(new Date());
      setUserResponses({});
      setPracticeScores({});
      setOverallScore(0);
      setCurrentDialogueIndex(0);
      setCompletedLines(new Set());
      
      // Save to local cache
      const sessionData = {
        topic: selectedTopic,
        scenario: currentScenario,
        startTime: new Date().toISOString(),
        userId: user?.id || 'guest'
      };
      localStorage.setItem('dailyConversationSession', JSON.stringify(sessionData));
      
      // Auto-play first line if it's from partner
      if (currentScenarioData) {
        const firstLine = currentScenarioData.dialogue[0];
        if (firstLine && firstLine.speaker !== 'You') {
          setTimeout(async () => {
            await speakText(firstLine.text, 0);
            // Check if next line is user's turn
            if (currentScenarioData.dialogue.length > 1) {
              const nextLine = currentScenarioData.dialogue[1];
              if (nextLine.speaker === 'You') {
                setTimeout(() => {
                  scrollToLine(1);
                  toast({
                    title: "Your Turn! 🎤",
                    description: `Speak: "${nextLine.text}"`,
                  });
                }, 1000);
              }
            }
          }, 500);
        }
      }
      
      toast({
        title: "Practice Session Started",
        description: "Listen to the dialogue, then practice your responses. You'll get points based on accuracy!",
      });
    } catch (error) {
      console.error('Error starting practice session:', error);
      toast({
        title: "Error",
        description: "Failed to start practice session. Please try again.",
        variant: "destructive"
      });
      setIsSessionActive(false);
      setSessionStartTime(null);
    }
  };

  // Save scenario progress to localStorage
  const saveScenarioProgress = (scenarioIndex: number, scenarioPoints: number, scenarioPercentage: number, completedSentencesCount?: number) => {
    if (!selectedTopic) return;
    
    try {
      // Get existing progress
      const progressData = JSON.parse(
        localStorage.getItem('dailyConversationProgress') || '{}'
      );
      
      // Initialize topic if not exists
      if (!progressData[selectedTopic]) {
        progressData[selectedTopic] = {
          scenario1: { points: 0, percentage: 0 },
          scenario2: { points: 0, percentage: 0 },
          average: 0,
          enrolled: false,
          completed: false,
          completedSentences: {
            scenario1: 0,
            scenario2: 0,
            total: 0
          },
          lastUpdated: new Date().toISOString()
        };
      }
      
      // Initialize completedSentences if not exists
      if (!progressData[selectedTopic].completedSentences) {
        progressData[selectedTopic].completedSentences = {
          scenario1: 0,
          scenario2: 0,
          total: 0
        };
      }
      
      // Update specific scenario
      const scenarioKey = scenarioIndex === 0 ? 'scenario1' : 'scenario2';
      progressData[selectedTopic][scenarioKey] = {
        points: scenarioPoints,
        percentage: Math.min(100, scenarioPercentage) // Cap at 100%
      };
      
      // Calculate average of both scenarios
      const avgPercentage = (
        progressData[selectedTopic].scenario1.percentage + 
        progressData[selectedTopic].scenario2.percentage
      ) / 2;
      
      progressData[selectedTopic].average = Math.round(avgPercentage);
      
      // Calculate total points
      const totalPoints = (progressData[selectedTopic].scenario1.points || 0) + 
                          (progressData[selectedTopic].scenario2.points || 0);
      
      // Count completed sentences - initialize if not exists
      if (!progressData[selectedTopic].completedSentences) {
        progressData[selectedTopic].completedSentences = {
          scenario1: 0,
          scenario2: 0,
          total: 0
        };
      }
      
      // Update completed sentences count for current scenario
      // Count sentences with score >= 50% from practiceScores
      if (currentScenarioData) {
        // Count all user lines that have been completed (score >= 50)
        const completed = Object.entries(practiceScores).filter(([idx, score]) => {
          const index = parseInt(idx);
          const line = currentScenarioData.dialogue[index];
          return line && line.speaker === 'You' && typeof score === 'number' && score >= 50;
        }).length;
        
        if (scenarioIndex === 0) {
          progressData[selectedTopic].completedSentences.scenario1 = completed;
        } else if (scenarioIndex === 1) {
          progressData[selectedTopic].completedSentences.scenario2 = completed;
        }
      }
      
      // Preserve previous scenario counts if not being updated
      // This ensures we don't lose counts when switching scenarios
      if (scenarioIndex === 0) {
        // When updating scenario 1, preserve scenario 2 count if it exists
        if (!progressData[selectedTopic].completedSentences.scenario2) {
          progressData[selectedTopic].completedSentences.scenario2 = 0;
        }
      } else if (scenarioIndex === 1) {
        // When updating scenario 2, preserve scenario 1 count if it exists
        if (progressData[selectedTopic].completedSentences.scenario1 === undefined) {
          progressData[selectedTopic].completedSentences.scenario1 = 0;
        }
      }
      
      // Calculate total completed sentences across both scenarios
      progressData[selectedTopic].completedSentences.total = 
        (progressData[selectedTopic].completedSentences.scenario1 || 0) +
        (progressData[selectedTopic].completedSentences.scenario2 || 0);
      
      // Mark as enrolled if user has completed at least 10 sentences (with score >= 50%)
      const isEnrolled = progressData[selectedTopic].completedSentences.total >= 10;
      
      console.log('Enrollment check:', {
        topic: selectedTopic,
        scenario1: progressData[selectedTopic].completedSentences.scenario1,
        scenario2: progressData[selectedTopic].completedSentences.scenario2,
        total: progressData[selectedTopic].completedSentences.total,
        isEnrolled
      });
      
      // Mark as completed if both scenarios are done (≥50% each)
      const bothCompleted = 
        progressData[selectedTopic].scenario1.percentage >= 50 &&
        progressData[selectedTopic].scenario2.percentage >= 50;
      
      progressData[selectedTopic].enrolled = isEnrolled;
      progressData[selectedTopic].completed = bothCompleted;
      progressData[selectedTopic].lastUpdated = new Date().toISOString();
      
      // Save to localStorage
      localStorage.setItem('dailyConversationProgress', JSON.stringify(progressData));
      
      // Dispatch custom event to notify other tabs/components
      window.dispatchEvent(new Event('dailyConversationProgressUpdated'));
      
      console.log('Scenario progress saved:', {
        topic: selectedTopic,
        scenario: scenarioKey,
        points: scenarioPoints,
        percentage: scenarioPercentage,
        average: progressData[selectedTopic].average,
        completedSentences: {
          scenario1: progressData[selectedTopic].completedSentences.scenario1,
          scenario2: progressData[selectedTopic].completedSentences.scenario2,
          total: progressData[selectedTopic].completedSentences.total
        },
        enrolled: isEnrolled,
        completed: bothCompleted
      });
      
      // Sync with server if available
      if (user?.id && IntegratedProgressService) {
        IntegratedProgressService.recordPracticeSession(user.id, {
          type: 'conversation',
          duration: Math.max(1, sessionStartTime ? Math.round((new Date().getTime() - sessionStartTime.getTime()) / 60000) : 1),
          score: scenarioPercentage,
          sentences_practiced: Object.keys(userResponses).length,
          details: {
            topic: selectedTopic,
            topic_title: selectedTopicData?.title,
            scenario: scenarioIndex,
            scenario_title: currentScenarioData?.title,
            points: scenarioPoints,
            percentage: scenarioPercentage
          }
        }).catch(err => console.error('Failed to sync progress:', err));
      }
    } catch (error) {
      console.error('Error saving scenario progress:', error);
    }
  };

  const handleEndPracticeSession = async () => {
    if (!sessionStartTime) {
      toast({
        title: "No Active Session",
        description: "Please start a practice session first",
        variant: "destructive"
      });
      return;
    }

    const durationMinutes = Math.max(1, Math.round((new Date().getTime() - sessionStartTime.getTime()) / 60000));
    const finalScore = overallScore > 0 ? overallScore : 85; // Default score if no practice done
    const sentencesPracticed = Object.keys(userResponses).length;
    
    // Calculate points based on score
    const pointsEarned = Math.round(finalScore / 10) + (sentencesPracticed * 2);
    
    // Calculate scenario percentage (based on average score of all user lines)
    const allUserLineScores = Object.values(practiceScores).filter((score): score is number => 
      typeof score === 'number' && score >= 0
    );
    const scenarioPercentage = allUserLineScores.length > 0
      ? Math.round(allUserLineScores.reduce((sum, score) => sum + score, 0) / allUserLineScores.length)
      : 0;
    
    // Save current scenario progress
    saveScenarioProgress(currentScenario, pointsEarned, scenarioPercentage);
    
    // If we completed Scenario 2, also ensure Scenario 1 is saved (in case user went back)
    if (currentScenario === 1 && selectedTopicData) {
      // Check if we have Scenario 1 data in the session history
      const sessionHistory = JSON.parse(
        localStorage.getItem('dailyConversationHistory') || '[]'
      );
      const scenario1Session = sessionHistory
        .filter((s: any) => s.topic === selectedTopic && s.scenario === 0)
        .sort((a: any, b: any) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0];
      
      if (scenario1Session && scenario1Session.practice_scores) {
        const scenario1Scores = Object.values(scenario1Session.practice_scores).filter((score): score is number => 
          typeof score === 'number' && score >= 0
        );
        const scenario1Percentage = scenario1Scores.length > 0
          ? Math.round(scenario1Scores.reduce((sum, score) => sum + score, 0) / scenario1Scores.length)
          : 0;
        const scenario1Points = Math.round(scenario1Percentage / 10) + (scenario1Scores.length * 2);
        saveScenarioProgress(0, scenario1Points, scenario1Percentage);
      }
    }
    
    // Save to local cache instead of MySQL
    const sessionData = {
      userId: user?.id || 'guest',
      type: 'conversation',
      duration: durationMinutes,
      score: finalScore,
      sentences_practiced: sentencesPracticed,
      points_earned: pointsEarned,
      topic: selectedTopic,
      scenario: currentScenario,
      topic_title: selectedTopicData?.title,
      scenario_title: currentScenarioData?.title,
      practice_scores: practiceScores,
      user_responses: userResponses,
      completed_at: new Date().toISOString()
    };
    
    try {
      // Get existing sessions from cache
      const existingSessions = JSON.parse(
        localStorage.getItem('dailyConversationHistory') || '[]'
      );
      
      // Add new session
      existingSessions.push(sessionData);
      
      // Keep only last 50 sessions
      const recentSessions = existingSessions.slice(-50);
      
      // Save to local cache
      localStorage.setItem('dailyConversationHistory', JSON.stringify(recentSessions));
      
      // Also save current session state
      localStorage.setItem('dailyConversationSession', JSON.stringify({
        ...sessionData,
        startTime: sessionStartTime.toISOString()
      }));
      
      toast({
        title: "🎉 Session Saved Successfully!",
        description: `Score: ${finalScore}% | Points: ${pointsEarned} | Duration: ${durationMinutes} min | Sentences: ${sentencesPracticed}`,
      });
      
      // Reset session state
      setIsSessionActive(false);
      setSessionStartTime(null);
      setUserResponses({});
      setPracticeScores({});
      setOverallScore(0);
      setCurrentDialogueIndex(0);
      setCompletedLines(new Set());
      
      // Clear session cache
      localStorage.removeItem('dailyConversationSession');
    } catch (error) {
      console.error('Error saving practice session to cache:', error);
      toast({
        title: "Error",
        description: "An error occurred while saving your session.",
        variant: "destructive"
      });
    }
  };

  // Show Daily Conversation content
  if (sessionType === 'daily-conversation') {
    return (
      <div className="relative overflow-hidden min-h-screen">
        {/* Background Elements - Matching Adults Page */}
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl -z-10"></div>
        <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] rounded-full bg-accent/10 blur-3xl -z-10"></div>

        <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 pt-24 pb-16 space-y-10">
          {/* Back Button */}
          <div className="mb-4 sm:mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/adults')}
              className="text-primary hover:text-primary/80 hover:bg-primary/10 text-xs sm:text-sm dark:text-emerald-300 dark:hover:text-emerald-200 dark:hover:bg-emerald-500/20"
              size="sm"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Adults Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>

          {/* Top Container - Only show when no topic is selected */}
            {!selectedTopic && (
            <section>
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#10b981] text-white shadow-xl dark:from-[#022c22] dark:via-[#065f46] dark:to-[#059669]">
                <span className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" aria-hidden />
                <span className="absolute -left-20 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-3xl" aria-hidden />
                <CardHeader className="space-y-2 py-3 sm:py-4 md:py-5 relative z-10">
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <div className="space-y-1 sm:space-y-2">
                      <Badge className="bg-white/25 text-white uppercase tracking-wide text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1">
                        Daily Conversation Practice
                      </Badge>
                      <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold text-white leading-tight">
                    {config.title}
                      </CardTitle>
                      <CardDescription className="text-white/85 text-sm sm:text-base leading-relaxed">
                        {config.description}
                      </CardDescription>
                </div>
              </div>
                </CardHeader>
              </Card>
            </section>
            )}

            {!selectedTopic ? (
              /* Topic Selection */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {dailyConversationTopics.map((topic) => {
                  const TopicIcon = topic.icon;
                  // Check if topic is enrolled from state
                  const currentTopicProgress = topicProgress[topic.id];
                  // Check enrollment status - either from enrolled flag or by counting completed sentences
                  const completedSentencesTotal = currentTopicProgress?.completedSentences?.total || 0;
                  const isEnrolled = currentTopicProgress?.enrolled || completedSentencesTotal >= 10;
                  const totalPoints = (currentTopicProgress?.scenario1?.points || 0) + (currentTopicProgress?.scenario2?.points || 0);
                  
                  // Debug log for enrollment status
                  if (completedSentencesTotal > 0) {
                    console.log(`Topic ${topic.title}: ${completedSentencesTotal} completed sentences, enrolled: ${isEnrolled}`);
                  }
                  
                  return (
                    <Card
                      key={topic.id}
                    className="group cursor-pointer bg-card/80 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl relative dark:bg-slate-900/60 dark:border-emerald-500/30 dark:hover:border-emerald-400/50"
                      onClick={() => handleStartPractice(topic.id)}
                    >
                      {/* Enrolled Badge - Top Right */}
                      {isEnrolled && (
                        <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-gradient-to-r from-emerald-600 to-green-600 text-white border-0 shadow-lg px-2 py-1 text-xs dark:from-emerald-500 dark:to-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Enrolled
                          </Badge>
                        </div>
                      )}
                    <CardContent className="p-4 sm:p-5 md:p-6">
                      <div className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 text-white bg-gradient-to-r", topic.color)}>
                        <TopicIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                        </div>
                      <h3 className="text-lg sm:text-xl font-bold text-foreground dark:text-white mb-2">{topic.title}</h3>
                      <p className="text-sm text-muted-foreground dark:text-cyan-100/70 mb-4">{topic.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-xs dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30">
                            {topic.duration}
                          </Badge>
                        <Badge variant="outline" className="bg-secondary/20 text-secondary border-secondary/30 text-xs dark:bg-green-500/20 dark:text-green-300 dark:border-green-400/30">
                            {topic.level}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              /* Practice Interface - Wider Container */
              <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto">
              <Card className="bg-card/80 backdrop-blur-xl border-primary/30 shadow-2xl dark:bg-slate-900/60 dark:border-emerald-500/30">
                  <CardContent className="p-4 sm:p-6 md:p-8">
                    {/* Topic Header - Scenario title on left, Change Topic button on right */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
                      {currentScenarioData && (
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground dark:text-white leading-tight">
                          {currentScenarioData.title}
                        </h2>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedTopic(null);
                          setCurrentScenario(0);
                          setCurrentDialogueIndex(0);
                          setCompletedLines(new Set());
                          setUserResponses({});
                          setPracticeScores({});
                          setOverallScore(0);
                          setIsSessionActive(false);
                          setSessionStartTime(null);
                        }}
                        className="border-primary/30 text-primary hover:bg-primary/20 w-full sm:w-auto shrink-0 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                      >
                        Change Topic
                      </Button>
                    </div>

                    {/* Scenario Navigation */}
                    {selectedTopicData && selectedTopicData.scenarios.length > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
                        <Button
                          variant="outline"
                          onClick={handlePreviousScenario}
                          disabled={currentScenario === 0}
                          className="border-primary/30 text-primary hover:bg-primary/20 w-full sm:w-auto text-sm sm:text-base dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                        >
                          Previous
                        </Button>
                        <span className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/70 text-center">
                          Scenario {currentScenario + 1} of {selectedTopicData.scenarios.length}
                        </span>
                        <Button
                          variant="outline"
                          onClick={handleNextScenario}
                          disabled={currentScenario === selectedTopicData.scenarios.length - 1}
                          className="border-primary/30 text-primary hover:bg-primary/20 w-full sm:w-auto text-sm sm:text-base dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                        >
                          Next
                        </Button>
                      </div>
                    )}

                    {/* Current Scenario */}
                    {currentScenarioData && (
                      <div className="space-y-3 sm:space-y-4">
                        {/* Dialogue - Chat Style */}
                        <div>
                          <div className="flex items-center justify-end mb-3 sm:mb-4">
                            {ttsInitialized && currentScenarioData && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  for (let i = 0; i < currentScenarioData.dialogue.length; i++) {
                                    await speakText(currentScenarioData.dialogue[i].text, i);
                                    // Small delay between lines
                                    await new Promise(resolve => setTimeout(resolve, 500));
                                  }
                                }}
                                className="border-primary/30 text-primary hover:bg-primary/20 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                              >
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Play All Dialogue
                              </Button>
                            )}
                          </div>
                          
                          {/* Instructions */}
                          {!isSessionActive && (
                            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-primary/20 border border-primary/30 rounded-lg dark:bg-emerald-500/20 dark:border-emerald-400/30">
                              <div className="flex items-start gap-2 sm:gap-3">
                                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-primary dark:text-emerald-300 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <h4 className="font-semibold text-foreground dark:text-white mb-1 text-xs sm:text-sm">Ready to Practice?</h4>
                                  <p className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/80">
                                    Click "Start Practice Session" to begin. You'll be able to listen to each line and practice your responses!
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {isSessionActive && (
                            <div className="mb-3 sm:mb-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowInstructions(!showInstructions)}
                                className="w-full sm:w-auto text-primary hover:text-primary/80 hover:bg-primary/10 mb-2 text-xs sm:text-sm dark:text-emerald-300 dark:hover:text-emerald-200 dark:hover:bg-emerald-500/20"
                              >
                                <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                                {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
                                {showInstructions ? (
                                  <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
                                ) : (
                                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
                                )}
                              </Button>
                              {showInstructions && (
                                <div className="p-4 bg-primary/20 border border-primary/30 rounded-lg dark:bg-emerald-500/20 dark:border-emerald-400/30">
                                  <div className="flex items-start gap-3">
                                    <Lightbulb className="w-5 h-5 text-primary dark:text-emerald-300 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-foreground dark:text-white mb-2 text-sm">How to Practice (Voice Mode):</h4>
                                      <ul className="text-xs sm:text-sm text-muted-foreground dark:text-cyan-100/80 space-y-2 list-disc list-inside mb-3">
                                        <li>Click the speaker icon 🔊 to hear each line read aloud</li>
                                        <li>For "You" lines, click the microphone 🎤 button and <strong>speak</strong> your response</li>
                                        <li>The system will listen and transcribe what you say</li>
                                        <li>Get instant feedback and scores (0-100%) based on accuracy</li>
                                        <li><strong>Auto-Advance:</strong> If you score 50% or higher, the conversation automatically moves to the next line</li>
                                        <li><strong>Scenario Completion:</strong> Complete all user lines with ≥50% each to automatically move to Scenario 2</li>
                                        <li><strong>Points Formula:</strong> (Score ÷ 10) + (2 points per sentence practiced)</li>
                                        <li>Example: 85% score + 3 sentences = 8 + 6 = <strong>14 points</strong></li>
                                      </ul>
                                      {!sttAvailable && (
                                        <div className="mt-2 p-2 bg-amber-500/20 border border-amber-400/30 rounded text-xs text-amber-800 dark:text-amber-200">
                                          ⚠️ Speech recognition requires Chrome or Edge browser
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Score Display */}
                          {isSessionActive && overallScore > 0 && (
                            <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-emerald-600/20 to-green-600/20 border border-emerald-500/30 rounded-lg dark:from-emerald-500/20 dark:to-green-500/20 dark:border-emerald-400/30">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                                <div className="flex-1">
                                  <div className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 font-medium">Current Score</div>
                                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{overallScore}%</div>
                                </div>
                                <div className="text-left sm:text-right">
                                  <div className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 font-medium">Points Earned</div>
                                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                    {Math.round(overallScore / 10) + (Object.keys(userResponses).length * 2)}
                                  </div>
                                </div>
                              </div>
                              {/* Progress Indicator */}
                              {currentScenarioData && (() => {
                                const allUserLines = currentScenarioData.dialogue
                                  .map((line, idx) => line.speaker === 'You' ? idx : -1)
                                  .filter(idx => idx !== -1);
                                const completedLines = allUserLines.filter(idx => {
                                  const lineScore = practiceScores[idx];
                                  return lineScore !== undefined && lineScore >= 50;
                                });
                                const progress = allUserLines.length > 0 
                                  ? Math.round((completedLines.length / allUserLines.length) * 100)
                                  : 0;
                                return (
                                  <div className="mt-3 pt-3 border-t border-emerald-400/20">
                                    <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                                      <span className="text-emerald-700 dark:text-emerald-200/80">Scenario Progress</span>
                                      <span className="text-emerald-800 dark:text-emerald-300 font-semibold">
                                        {completedLines.length} / {allUserLines.length} lines completed (≥50%)
                                      </span>
                                    </div>
                                    <Progress 
                                      value={progress} 
                                      className="h-2 bg-muted dark:bg-slate-700/50"
                                    />
                                    {completedLines.length === allUserLines.length && allUserLines.length > 0 && (
                                      <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-2 text-center animate-pulse">
                                        ✨ All lines completed! Moving to Scenario 2...
                                      </p>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {/* Interactive Conversation Interface */}
                          <div className="space-y-4 sm:space-y-5 bg-gradient-to-b from-card/30 via-card/50 to-card/30 rounded-2xl p-4 sm:p-5 md:p-6 border border-primary/20 shadow-lg max-h-[500px] sm:max-h-[600px] md:max-h-[700px] overflow-y-auto dark:from-slate-800/30 dark:via-slate-800/50 dark:to-slate-800/30 dark:border-emerald-500/20">
                            {currentScenarioData.dialogue.map((line, index) => {
                              const isUser = line.speaker === 'You';
                              const isPartner = line.speaker === 'Partner' || line.speaker === 'Interviewer' || line.speaker === 'Waiter';
                              const isUserLine = line.speaker === 'You';
                              const userResponse = userResponses[index] || '';
                              const lineScore = practiceScores[index];
                              const isCurrentlySpeaking = isSpeaking[index];
                              const isCompleted = completedLines.has(index);
                              const isActive = index === currentDialogueIndex;
                              
                              // Get display name: use partner name if it's a partner/ai speaker and partnerName exists
                              const displayName = isPartner && currentScenarioData.partnerName 
                                ? currentScenarioData.partnerName 
                                : line.speaker;
                              
                              return (
                                <div 
                                  key={index} 
                                  ref={(el) => {
                                    if (el) lineRefs.current[index] = el;
                                  }}
                                  className={cn(
                                    "space-y-3 transition-all duration-500 ease-in-out",
                                    isActive && "scale-[1.01]",
                                    isCompleted && "opacity-60"
                                  )}
                                >
                                  {/* Message Row */}
                                    <div className={cn(
                                    "flex items-start gap-3 sm:gap-4",
                                    isUser && "flex-row-reverse"
                                    )}>
                                    {/* Avatar - Outside Message Bubble (Modern Chat Style) */}
                                      <div className={cn(
                                      "flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-md transition-transform duration-300",
                                        isUser
                                        ? "bg-gradient-to-br from-primary to-primary/80 ring-2 ring-primary/30 dark:from-emerald-500 dark:to-emerald-600 dark:ring-emerald-400/30"
                                        : "bg-gradient-to-br from-secondary to-secondary/80 ring-2 ring-secondary/30 dark:from-green-500 dark:to-green-600 dark:ring-green-400/30",
                                      isActive && "ring-4 scale-110",
                                      isCompleted && "opacity-70"
                                        )}>
                                          {isUser ? (
                                        <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                                          ) : (
                                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                                          )}
                                        </div>
                                        
                                    {/* Message Bubble Container */}
                                    <div className={cn(
                                      "flex-1 max-w-[85%] sm:max-w-[80%] md:max-w-[75%] transition-all duration-300",
                                      isUser && "flex justify-end"
                                    )}>
                                      <div className={cn(
                                        "group relative rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl w-full",
                                        // User messages: Right-aligned, blue/primary theme
                                        isUser && cn(
                                          "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground",
                                          "dark:from-emerald-500 dark:to-emerald-600 dark:text-white",
                                          "rounded-br-sm", // Chat bubble tail effect
                                          isActive && "ring-4 ring-primary/30 dark:ring-emerald-400/30 scale-105"
                                        ),
                                        // AI messages: Left-aligned, gray/secondary theme
                                        !isUser && cn(
                                          "bg-gradient-to-br from-muted to-muted/80 text-foreground",
                                          "dark:from-slate-700 dark:to-slate-800 dark:text-white",
                                          "rounded-bl-sm", // Chat bubble tail effect
                                          isActive && "ring-4 ring-secondary/30 dark:ring-green-400/30 scale-105"
                                        ),
                                        isCompleted && "opacity-75"
                                      )}>
                                        {/* Message Header */}
                                        <div className={cn(
                                          "flex items-center justify-between gap-2 px-3 sm:px-4 pt-3 sm:pt-4 pb-1",
                                          isUser && "flex-row-reverse"
                                        )}>
                                          <div className={cn(
                                            "font-semibold text-xs sm:text-sm",
                                            isUser 
                                              ? "text-primary-foreground dark:text-white"
                                              : "text-foreground dark:text-white"
                                          )}>
                                            {displayName}
                                        </div>
                                          {/* Audio Button - Compact */}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => speakText(line.text, index)}
                                          disabled={isCurrentlySpeaking || !ttsInitialized}
                                          className={cn(
                                              "h-6 w-6 sm:h-7 sm:w-7 p-0 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity",
                                              isCurrentlySpeaking && "opacity-100 animate-pulse"
                                          )}
                                        >
                                          {isCurrentlySpeaking ? (
                                              <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                                          ) : (
                                            <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                          )}
                                        </Button>
                                      </div>
                                        
                                        {/* Message Text */}
                                        <div className={cn(
                                          "px-3 sm:px-4 pb-3 sm:pb-4 text-sm sm:text-base leading-relaxed break-words",
                                          isUser 
                                            ? "text-primary-foreground dark:text-white"
                                            : "text-foreground dark:text-white"
                                        )}>
                                          {line.text}
                                        </div>

                                        {/* Timestamp/Status Indicator */}
                                        <div className={cn(
                                          "px-3 sm:px-4 pb-2 flex items-center gap-2 text-[10px] sm:text-xs opacity-60",
                                          isUser && "justify-end"
                                        )}>
                                          {isCompleted && (
                                            <CheckCircle className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                                          )}
                                          {isActive && !isUser && (
                                            <div className="flex gap-1">
                                              <div className="w-1 h-1 rounded-full bg-current animate-pulse" style={{ animationDelay: '0ms' }} />
                                              <div className="w-1 h-1 rounded-full bg-current animate-pulse" style={{ animationDelay: '150ms' }} />
                                              <div className="w-1 h-1 rounded-full bg-current animate-pulse" style={{ animationDelay: '300ms' }} />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Voice Practice for "You" lines - Aligned with User Message */}
                                  {isSessionActive && isUserLine && (
                                    <div className={cn(
                                      "flex justify-end ml-11 sm:ml-14 md:ml-16",
                                      "transition-all duration-300"
                                    )}>
                                      <div className={cn(
                                        "p-3 sm:p-4 rounded-xl shadow-md border transition-all duration-300 space-y-2 sm:space-y-3",
                                        "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
                                        "border-primary/30 dark:from-emerald-500/10 dark:via-emerald-500/5 dark:border-emerald-400/30",
                                        "max-w-[85%] sm:max-w-[80%] md:max-w-[75%]",
                                        isActive && "ring-2 ring-primary/30 dark:ring-emerald-400/30 scale-[1.02]"
                                      )}>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                                          <div className="flex-1">
                                            <div className="text-xs sm:text-sm font-semibold text-foreground dark:text-white mb-1">Your Response:</div>
                                            <div className="text-xs text-muted-foreground dark:text-cyan-200/70 mb-2 break-words">Try to say: "{line.text}"</div>
                                          </div>
                                          {!sttAvailable && (
                                            <Badge variant="outline" className="bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-400/30 text-xs w-fit">
                                              Use Chrome/Edge
                                            </Badge>
                                          )}
                                        </div>
                                        
                                        {/* Show what user said */}
                                        {(userResponse || interimTranscript) && (
                                          <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-card/50 rounded-lg border border-primary/20 dark:bg-slate-700/50 dark:border-emerald-500/20">
                                            <div className="text-xs text-muted-foreground dark:text-cyan-200/60 mb-1">You said:</div>
                                            <div className="text-xs sm:text-sm text-foreground dark:text-white font-medium break-words">
                                              {interimTranscript || userResponse}
                                              {interimTranscript && <span className="animate-pulse">|</span>}
                                            </div>
                                          </div>
                                        )}

                                        {/* Microphone Button */}
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                                          <Button
                                            onClick={() => {
                                              if (isListening[index]) {
                                                stopListening();
                                              } else {
                                                startListening(index);
                                              }
                                            }}
                                            disabled={!sttAvailable || isSpeaking[index]}
                                            className={cn(
                                              "flex-1 py-4 sm:py-5 md:py-6 text-sm sm:text-base font-semibold transition-all duration-300",
                                              isListening[index]
                                                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                                                : "bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
                                            )}
                                          >
                                            {isListening[index] ? (
                                              <>
                                                <MicOff className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-pulse" />
                                                <span className="hidden sm:inline">Listening... Click to Stop</span>
                                                <span className="sm:hidden">Stop</span>
                                              </>
                                            ) : (
                                              <>
                                                <Mic className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                                <span className="hidden sm:inline">Click to Speak</span>
                                                <span className="sm:hidden">Speak</span>
                                              </>
                                            )}
                                          </Button>
                                          
                                          {/* Score Display */}
                                          {lineScore !== undefined && (
                                            <div className={cn(
                                              "px-3 sm:px-4 py-4 sm:py-5 md:py-6 rounded-lg text-base sm:text-lg md:text-xl font-bold min-w-[60px] sm:min-w-[80px] text-center border-2 flex items-center justify-center",
                                              lineScore >= 80 ? "bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border-emerald-400/50" :
                                              lineScore >= 60 ? "bg-amber-500/30 text-amber-700 dark:text-amber-300 border-amber-400/50" :
                                              "bg-rose-500/30 text-rose-700 dark:text-rose-300 border-rose-400/50"
                                            )}>
                                              {lineScore}%
                                            </div>
                                          )}
                                        </div>

                                        {/* Feedback */}
                                        {lineScore !== undefined && (
                                          <div className="mt-3">
                                            {lineScore === 100 ? (
                                              <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-lg flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
                                                <span className="text-sm text-emerald-800 dark:text-emerald-200 font-medium">Perfect! Excellent pronunciation! 🎉</span>
                                              </div>
                                            ) : lineScore >= 80 ? (
                                              <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-lg">
                                                <div className="text-sm text-emerald-800 dark:text-emerald-200 font-medium mb-1">Great job! Very close!</div>
                                                <div className="text-xs text-emerald-700 dark:text-emerald-200/70">Try to match: "{line.text}"</div>
                                              </div>
                                            ) : lineScore >= 60 ? (
                                              <div className="p-3 bg-amber-500/20 border border-amber-400/30 rounded-lg">
                                                <div className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-1">Good effort! Keep practicing!</div>
                                                <div className="text-xs text-amber-700 dark:text-amber-200/70">Expected: "{line.text}"</div>
                                              </div>
                                            ) : (
                                              <div className="p-3 bg-rose-500/20 border border-rose-400/30 rounded-lg">
                                                <div className="text-sm text-rose-800 dark:text-rose-200 font-medium mb-1">Keep trying! Listen to the example again.</div>
                                                <div className="text-xs text-rose-700 dark:text-rose-200/70">Click the speaker icon above to hear: "{line.text}"</div>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* Instructions */}
                                        {!userResponse && !isListening[index] && (
                                          <div className="mt-3 text-xs text-muted-foreground dark:text-cyan-200/60 flex items-center gap-2">
                                            <Lightbulb className="w-3 h-3" />
                                            <span>Click the microphone button and speak your response clearly</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Practice Button */}
                        <div className="pt-4 sm:pt-6 border-t border-primary/20 dark:border-emerald-500/20">
                          {!isSessionActive ? (
                            <div className="space-y-3">
                              <div className="space-y-3">
                                <Button
                                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 sm:py-4 md:py-6 text-sm sm:text-base md:text-lg dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600"
                                  onClick={handleStartPracticeSession}
                                >
                                  <Mic className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                  <span className="hidden sm:inline">Start Voice Practice Session</span>
                                  <span className="sm:hidden">Start Practice</span>
                                </Button>
                                {sttAvailable && (
                                  <p className="text-xs sm:text-sm text-center text-muted-foreground dark:text-cyan-200/70 px-2">
                                    🎤 Voice recognition ready! Speak correctly (≥50% score) to auto-advance. Complete all lines to move to Scenario 2!
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center justify-center gap-2 text-primary dark:text-emerald-300">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse dark:bg-emerald-400" />
                                <span className="text-xs sm:text-sm md:text-base">
                                  Session in progress... ({sessionStartTime ? Math.max(1, Math.round((new Date().getTime() - sessionStartTime.getTime()) / 60000)) : 0} min)
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                <Button
                                  variant="outline"
                                  className="w-full border-primary/30 text-primary hover:bg-primary/20 py-3 sm:py-4 md:py-6 text-sm sm:text-base md:text-lg dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                                  onClick={() => {
                                    setIsSessionActive(false);
                                    setSessionStartTime(null);
                                    toast({
                                      title: "Session Cancelled",
                                      description: "Your session has been cancelled. No data was saved.",
                                    });
                                  }}
                                >
                                  Cancel Session
                                </Button>
                                <Button
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 sm:py-4 md:py-6 text-sm sm:text-base md:text-lg dark:bg-emerald-500 dark:hover:bg-emerald-600"
                                  onClick={handleEndPracticeSession}
                                >
                                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                  <span className="hidden sm:inline">Complete & Save ({overallScore > 0 ? overallScore : 85}% Score)</span>
                                  <span className="sm:hidden">Save ({overallScore > 0 ? overallScore : 85}%)</span>
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
      </div>
    );
  }

  // Placeholder for other session types
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      <div className="relative z-10 pb-12 pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/adults')}
            className="mb-8 text-cyan-300 hover:text-cyan-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Adults Dashboard
          </Button>

          <Card className="bg-slate-900/60 backdrop-blur-xl border-purple-500/30 max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white bg-gradient-to-r", config.color)}>
                <Icon className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">{config.title}</h1>
              <p className="text-cyan-100/70 mb-6">{config.description}</p>
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <p className="text-cyan-100/60">This practice session is coming soon!</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuickPracticeSession;

