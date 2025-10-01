
import { useState, useEffect } from 'react';
import { useAnimateIn } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { ExternalLink, Heart, Lightbulb, RefreshCw, Stars, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const WhySection = ({
  title,
  content,
  icon,
  id
}: {
  title: string,
  content: React.ReactNode,
  icon: React.ReactNode,
  id: string
}) => {
  return (
    <div id={id} className="mb-20 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
          {icon}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-primary">{title}</h2>
      </div>
      <div className="text-foreground/80 space-y-4">
        {content}
      </div>
    </div>
  );
};

const WhyPage = () => {
  const [loading, setLoading] = useState(true);
  const showContent = useAnimateIn(false, 300);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/3 left-0 w-[250px] h-[250px] rounded-full bg-accent/5 blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24">
        <div className="flex flex-col items-center text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground bg-clip-text">
            Why?
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything we do starts with this question.
          </p>

          <div className="mt-10 glass-panel p-8 md:p-10 rounded-lg max-w-3xl mx-auto shadow-lg border-2 border-primary/20">
            <p className="text-xl md:text-2xl text-foreground/90">
              Why should this app exist? Why should anyone care to use it? Why is privacy so important to us?
            </p>
            <p className="text-xl md:text-2xl text-foreground/90 mt-6">
              Eventually, the "why" led us here.
            </p>
          </div>
        </div>

        <WhySection
          id="why-1"
          icon={<Lightbulb className="w-6 h-6 text-primary" />}
          title={
            <span className="text-teal-600">
              Because why not make learning English truly accessible?
            </span>
          }
          content={
            <>
              <p>
                We've always approached language learning this way. We looked at the current tools and asked ourselves: why must learning spoken English rely on internet connectivity? Why are expensive cloud subscriptions required? Why do many apps collect user data unnecessarily? Are these features helping learners—or just creating clutter? What if we did it differently?
              </p>
              <p>
                With Speak Bee, we asked ourselves: why not? Why not build a fully offline, AI-powered trainer that runs entirely on your device? Why not make it private, fast, and available anytime, anywhere? Why not create tailored lessons for kids, adults, and exam aspirants that actually help them speak English confidently? Forget how it’s usually done—let’s make learning better, simpler, and more engaging.
              </p>
              <div className="mt-6">
                <Button variant="outline" className="gap-2" asChild>
                  <Link to="/how">
                    MORE ON HOW WE THINK
                    <ExternalLink size={16} />
                  </Link>
                </Button>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p className="font-medium">The beginning — How did we end up creating Speak Bee?</p>
                <p className="mt-2 font-medium">A letter — How can we help you speak confidently, anywhere, anytime, without relying on the internet?</p>
              </div>
            </>
          }
        />

        <WhySection
          id="why-2"
          icon={<Heart className="w-6 h-6 text-primary" />}
          title={
            <span className="text-teal-600">
              Because we need better relationships with technology.
            </span>
          }
          content={
            <>
              <p>
                Once, learning English was simple. You had a book, a lesson, a tutor, and the joy of speaking each word correctly. You practiced, learned, and then moved on, knowing exactly what you had accomplished.
              </p>
              <p>
                Today, language apps are different. They demand constant attention, endless scrolling, and internet connectivity. They track your data, push notifications, and often distract you from real learning. Instead of helping you, they make you adapt to them.
              </p>
              <p>
                We asked ourselves—what if it could be different? What if technology could truly serve you? That’s why we built our Spoken English Training App. Fully offline, AI-powered, and designed to guide you step by step. Lessons tailored to your level, instant feedback on pronunciation, fluency, and grammar, and interactive practice that builds confidence naturally. Learning English, simplified, personal, and always at your fingertips.
              </p>
              <p>
                We decided we could.
              </p>
              <div className="mt-6">
                <Button variant="outline" className="gap-2" asChild>
                  <Link to="/how">
                    HOW WE MAKE OUR DECISIONS
                    <ExternalLink size={16} />
                  </Link>
                </Button>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p className="font-medium">Our promise from us to you</p>
                <p className="mt-2 font-medium">Our commitment to your English learning journey</p>
                <p className="mt-2 font-medium">Focused on improving your spoken English, without distractions</p>
                <p className="mt-2 font-medium">A tool that adapts to your pace, fully offline and private</p>
              </div>
            </>
          }
        />

        <WhySection
          id="why-3"
          icon={<RefreshCw className="w-6 h-6 text-primary" />}
          title={
            <span className="text-teal-600">
              Because new beginnings are beautiful.
            </span>
          }
          content={
            <>
              <p>
                Our app starts you on a clean slate—no complicated setups, no constant internet required. Whether you're a beginner or looking to improve your fluency, you can focus entirely on learning and practicing spoken English.
              </p>
              <p>
                By keeping your learning offline and personalized, we remove distractions and digital clutter. Each lesson, conversation, and exercise is designed to help you build confidence, track progress, and speak naturally.
              </p>
            </>
          }
        />

        <WhySection
          id="why-4"
          icon={<Zap className="w-6 h-6 text-primary" />}
          title={
            <span className="text-teal-600">
              Because learning English should empower you, not distract you.
            </span>
          }
          content={
            <>
              <p>
                We built this app for learners of all ages who want to improve their spoken English without relying on constant internet access. It’s designed to help you focus on speaking, listening, and practicing naturally.
              </p>
              <p>
                The app works silently in the background, offering feedback, pronunciation guidance, and conversation practice. It doesn’t demand attention, notifications, or unnecessary interaction—it’s here to serve your learning.
              </p>
              <p>
                At its core, it’s a tool to help you gain confidence, fluency, and mastery of English. Whether you’re a child learning basics, an adult improving your skills, or an exam aspirant preparing for IELTS/PTE, this app supports you to practice, progress, and succeed.
              </p>
            </>
          }
        />


        <div className="mt-16 text-center">
          <Button size="lg" className="gap-2" asChild>
            <Link to="/">
              Start Your Journey
              <Stars size={18} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WhyPage;
