import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Lightbulb, Zap, ShieldCheck, Award, Globe, ArrowRight, Sparkles, Target, Brain } from 'lucide-react';


const WhyPage = () => {
  const [, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);


  const values = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-teal-700" />,
      title: "Privacy First",
      description: "Your data never leaves your device. Complete offline functionality with zero data collection."
    },
    {
      icon: <Brain className="w-6 h-6 text-teal-700" />,
      title: "AI-Powered Learning",
      description: "Advanced AI technology provides personalized feedback and adapts to your learning pace."
    },
    {
      icon: <Globe className="w-6 h-6 text-teal-700" />,
      title: "Accessible Everywhere",
      description: "Learn English anywhere, anytime, without requiring an internet connection."
    },
    {
      icon: <Award className="w-6 h-6 text-teal-700" />,
      title: "Proven Results",
      description: "Thousands of learners have improved their English skills using our platform."
    }
  ];

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] rounded-full bg-accent/10 blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24">
        {/* Hero Section - Model Image Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left Side - Student Image */}
          <div className="relative">
            <div className="relative">
              {/* Student Image */}
              <div className="w-80 h-80 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 shadow-2xl">
                <img 
                  src="/boy.jpg" 
                  alt="Student learning English" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Background shapes */}
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-primary/10 rounded-2xl rotate-12"></div>
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-secondary/10 rounded-2xl -rotate-12"></div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-6 h-6 bg-orange-400 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-4 h-4 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-8 relative">
            {/* Decorative curved line - Green */}
            <div className="absolute -top-8 -left-8 w-20 h-20 text-green-500 opacity-40 hidden md:block">
              <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                <path d="M10 90Q10 10 90 10" stroke="currentColor" strokeWidth="3" fill="none"/>
              </svg>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Our Philosophy</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 relative">
              Why <span className="text-primary">Elora</span>?
              {/* Decorative star - Orange */}
              <div className="absolute -top-4 -right-8 w-8 h-8 text-orange-500 opacity-70 hidden sm:block">
                <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
                  <path d="M50 10L60 40L90 50L60 60L50 90L40 60L10 50L40 40Z"/>
                </svg>
              </div>
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Everything we do starts with a simple question: How can we make English learning 
              more accessible, effective, and private for everyone?
            </p>

            {/* Decorative elements */}
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Main Reasons Section - Model Image Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 relative">
          {/* Decorative wavy arrow - Orange */}
          <div className="absolute top-10 -left-12 w-24 h-24 text-orange-500 opacity-40 hidden xl:block">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
              <path d="M20 20C40 10 60 30 80 20C85 18 90 22 90 25C90 30 85 35 80 30C70 25 50 15 30 25C25 27 20 25 20 20Z" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
            </svg>
          </div>
          {[
            {
              icon: <Lightbulb className="w-8 h-8 text-teal-800" />,
              title: "Because learning should be <span className='text-orange-500 font-bold'>accessible</span> to everyone",
              description: "We believe that quality English education shouldn't be limited by internet connectivity, expensive subscriptions, or privacy concerns. Our offline-first approach ensures that anyone, anywhere can learn English effectively.",
              color: "from-primary to-primary/80"
            },
            {
              icon: <Heart className="w-8 h-8 text-teal-800" />,
              title: "Because we care about your <span className='text-orange-500 font-bold'>privacy</span> and data",
              description: "Your learning journey is personal. That's why all your data stays on your device. No cloud storage, no data collection, no tracking. Just pure, private learning.",
              color: "from-primary to-primary/80"
            },
            {
              icon: <Zap className="w-8 h-8 text-teal-800" />,
              title: "Because AI should <span className='text-orange-500 font-bold'>empower</span>, not replace human learning",
              description: "Our AI technology enhances your learning experience by providing instant feedback and personalized guidance, while keeping you in control of your educational journey.",
              color: "from-primary to-primary/80"
            },
            {
              icon: <Target className="w-8 h-8 text-teal-800" />,
              title: "Because every learner deserves <span className='text-orange-500 font-bold'>personalized</span> attention",
              description: "Whether you're a child starting out, an adult improving your skills, or preparing for exams, our AI adapts to your pace and learning style for maximum effectiveness.",
              color: "from-primary to-primary/80"
            }
          ].map((reason, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm relative">
              {/* Alternating decorative elements */}
              {index === 0 && (
                <div className="absolute -top-3 -right-3 w-10 h-10 text-green-500 opacity-60">
                  <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                    <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="3" strokeDasharray="10,5"/>
                  </svg>
                </div>
              )}
              {index === 1 && (
                <div className="absolute -bottom-3 -left-3 w-8 h-8 text-orange-500 opacity-70">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                </div>
              )}
              {index === 2 && (
                <div className="absolute top-4 right-4 w-10 h-10 text-green-500 opacity-50">
                  <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                    <path d="M10 50Q30 20 50 50T90 50" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
              )}
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${reason.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                    {reason.icon}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-teal-600" dangerouslySetInnerHTML={{ __html: reason.title }} />
                <p className="text-muted-foreground leading-relaxed text-lg">{reason.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Values Section */}
        <div className="mb-20 relative">
          {/* Decorative circles - Green and Orange */}
          <div className="absolute -top-6 right-20 w-12 h-12 text-orange-500 opacity-30 hidden lg:block">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3"/>
            </svg>
          </div>
          <div className="absolute top-1/2 -left-10 w-16 h-16 text-green-500 opacity-30 hidden xl:block">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
              <path d="M50 10L60 40L90 50L60 60L50 90L40 60L10 50L40 40Z" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Our Core <span className="text-primary">Values</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              These principles guide everything we do and every decision we make.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyPage;
