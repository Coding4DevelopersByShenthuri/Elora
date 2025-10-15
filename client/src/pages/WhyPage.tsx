import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Heart, Lightbulb, RefreshCw, Stars, Zap, ShieldCheck, Lock, Award, Users as UsersIcon, CheckCircle, Globe, Star, TrendingUp } from 'lucide-react';
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
  const [, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      //@ts-ignore
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
          //@ts-ignore
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
          //@ts-ignore
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
          //@ts-ignore
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
          //@ts-ignore
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


        {/* Trust & Security Section */}
        <div className="mt-24 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-teal-600">
            Built on Trust, Security, and Privacy
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="glass-panel rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600/20 to-teal-600/10 flex items-center justify-center mx-auto mb-4 text-teal-600">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Privacy Certified</h3>
              <p className="text-muted-foreground text-sm">Your data never leaves your device. 100% offline processing.</p>
            </div>

            <div className="glass-panel rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600/20 to-teal-600/10 flex items-center justify-center mx-auto mb-4 text-teal-600">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Secure by Design</h3>
              <p className="text-muted-foreground text-sm">Built with security best practices. No data collection or tracking.</p>
            </div>

            <div className="glass-panel rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600/20 to-teal-600/10 flex items-center justify-center mx-auto mb-4 text-teal-600">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Quality Assured</h3>
              <p className="text-muted-foreground text-sm">Developed by certified language educators and AI experts.</p>
            </div>

            <div className="glass-panel rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600/20 to-teal-600/10 flex items-center justify-center mx-auto mb-4 text-teal-600">
                <UsersIcon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Community Trusted</h3>
              <p className="text-muted-foreground text-sm">Thousands of learners worldwide improving their English daily.</p>
            </div>
          </div>

          {/* Statistics */}
          <div className="glass-panel rounded-2xl p-8 md:p-12 mb-12 bg-gradient-to-br from-teal-600/5 to-transparent">
            <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center text-teal-600">
              Trusted by Learners Worldwide
            </h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-teal-600/20 flex items-center justify-center mx-auto mb-3 text-teal-600">
                  <UsersIcon className="w-6 h-6" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-teal-600 mb-1">10,000+</div>
                <div className="text-sm text-muted-foreground">Active Learners</div>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-teal-600/20 flex items-center justify-center mx-auto mb-3 text-teal-600">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-teal-600 mb-1">50+</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-teal-600/20 flex items-center justify-center mx-auto mb-3 text-teal-600">
                  <Star className="w-6 h-6" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-teal-600 mb-1">4.8/5</div>
                <div className="text-sm text-muted-foreground">User Rating</div>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-teal-600/20 flex items-center justify-center mx-auto mb-3 text-teal-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-teal-600 mb-1">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Privacy & Security Guarantees */}
          <div className="glass-panel rounded-2xl p-8 md:p-12 bg-gradient-to-br from-teal-600/5 to-transparent">
            <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center text-teal-600">
              Your Privacy & Security Guaranteed
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-600/20 flex items-center justify-center flex-shrink-0 mt-1 text-teal-600">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">No Data Collection</h4>
                  <p className="text-muted-foreground">
                    We don't collect, store, or transmit your personal data. Everything happens on your device.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-600/20 flex items-center justify-center flex-shrink-0 mt-1 text-teal-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Offline-First Architecture</h4>
                  <p className="text-muted-foreground">
                    All AI processing happens locally. Your voice recordings and progress stay on your device.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-600/20 flex items-center justify-center flex-shrink-0 mt-1 text-teal-600">
                  <UsersIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Parental Controls</h4>
                  <p className="text-muted-foreground">
                    Safe environment for kids with age-appropriate content and full parental oversight.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-600/20 flex items-center justify-center flex-shrink-0 mt-1 text-teal-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">No Third-Party Trackers</h4>
                  <p className="text-muted-foreground">
                    Zero analytics, no ad networks, no tracking pixels. Your privacy is absolute.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

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
