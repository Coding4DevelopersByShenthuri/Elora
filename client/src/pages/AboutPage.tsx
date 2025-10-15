import { useState, useEffect } from 'react';
import { Target, Heart, Users, Lightbulb, Award, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  const [, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const values = [
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Innovation",
      description: "Pioneering offline AI technology to make language learning accessible everywhere."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Empathy",
      description: "Understanding the challenges learners face and building solutions that truly help."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Inclusivity",
      description: "Creating tools for everyone—kids, adults, and exam candidates—regardless of background."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Excellence",
      description: "Delivering high-quality learning experiences with proven results and effectiveness."
    }
  ];

  const milestones = [
    {
      year: "2024",
      title: "Speak Bee Launch",
      description: "Released the world's first fully offline AI-powered English trainer for all platforms."
    },
    {
      year: "2024",
      title: "Multi-Platform Support",
      description: "Expanded to Android, iOS, Windows, macOS, and Progressive Web App."
    },
    {
      year: "2025",
      title: "Growing Community",
      description: "Thousands of learners worldwide improving their English skills with Speak Bee."
    },
    {
      year: "Future",
      title: "Vision Ahead",
      description: "Expanding to more languages and advanced AI capabilities while staying offline-first."
    }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/3 left-0 w-[250px] h-[250px] rounded-full bg-accent/5 blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-1.5 bg-teal-600/10 rounded-xl mb-6">
            <div className="bg-background px-4 py-2 rounded-lg shadow-sm">
              <Globe2 size={22} className="inline-block mr-2 text-teal-600" />
              <span className="font-semibold text-teal-600">About Us</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-teal-600">
            Our Mission: English for Everyone
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We believe that learning English should be accessible to everyone, everywhere—without barriers of internet connectivity, 
            cost, or privacy concerns.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="glass-panel rounded-2xl p-8 md:p-10 hover:shadow-xl transition-all duration-300 group">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-600/20 to-teal-600/10 flex items-center justify-center mb-6 text-teal-600 group-hover:scale-110 transition-transform duration-300">
              <Target className="w-8 h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-teal-600">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              To democratize English language learning by providing a powerful, AI-driven platform that works completely offline. 
              We're committed to breaking down barriers—whether it's lack of internet access, privacy concerns, or expensive subscriptions—and 
              making quality English education available to learners worldwide, regardless of their circumstances.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-8 md:p-10 hover:shadow-xl transition-all duration-300 group">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-600/20 to-teal-600/10 flex items-center justify-center mb-6 text-teal-600 group-hover:scale-110 transition-transform duration-300">
              <Lightbulb className="w-8 h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-teal-600">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              A world where language is never a barrier to opportunity. We envision every person having the confidence to speak English fluently, 
              opening doors to education, careers, and connections across borders. Through innovative offline technology and personalized AI, 
              we're making this vision a reality—one learner at a time.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-teal-600">
            Our Core Values
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <div key={idx} className="glass-panel rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-teal-600/20 flex items-center justify-center mx-auto mb-4 text-teal-600">
                  {value.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Story */}
        <div className="mb-16 glass-panel rounded-2xl p-8 md:p-12 bg-gradient-to-br from-teal-600/5 to-transparent">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-teal-600">
            Our Story
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-4 text-muted-foreground text-lg leading-relaxed">
            <p>
              Speak Bee was born from a simple observation: millions of people worldwide want to learn English, 
              but traditional methods and apps create unnecessary barriers. Expensive subscriptions, mandatory internet connections, 
              privacy concerns, and one-size-fits-all approaches leave many learners behind.
            </p>
            
            <p>
              We asked ourselves: <strong className="text-teal-600">What if we could change that?</strong> What if we built a platform that truly serves learners—not advertisers, 
              not data collectors, but the people who genuinely want to improve their English?
            </p>
            
            <p>
              Our team of educators, linguists, and AI engineers came together to create something different. 
              We developed cutting-edge offline AI technology that brings the power of personalized learning to your device—no internet required. 
              We designed modules for kids, adults at every level, and exam candidates preparing for IELTS and PTE.
            </p>
            
            <p>
              But most importantly, we built Speak Bee with <strong className="text-teal-600">privacy, accessibility, and effectiveness</strong> at its core. 
              Your data never leaves your device. You can learn anywhere—on a plane, in remote areas, during your commute. 
              And our AI provides real-time feedback that actually helps you improve.
            </p>
            
            <p className="font-semibold text-teal-600">
              Today, Speak Bee is helping thousands of learners around the world speak English with confidence. And we're just getting started.
            </p>
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center text-teal-600">
            Our Journey
          </h2>
          
          <div className="relative max-w-5xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-teal-600 via-teal-400 to-teal-200 hidden lg:block"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, idx) => (
                <div key={idx} className={`flex items-center gap-8 ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  {/* Content */}
                  <div className={`flex-1 ${idx % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                    <div className="glass-panel rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                      <div className="inline-block px-3 py-1 rounded-full bg-teal-600/20 text-teal-600 font-bold text-sm mb-3">
                        {milestone.year}
                      </div>
                      <h3 className="font-bold text-xl mb-2">{milestone.title}</h3>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                  
                  {/* Center dot */}
                  <div className="hidden lg:block w-4 h-4 rounded-full bg-teal-600 border-4 border-background shadow-lg z-10 flex-shrink-0"></div>
                  
                  {/* Spacer for alternating layout */}
                  <div className="hidden lg:block flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="glass-panel rounded-2xl p-8 md:p-12 text-center bg-gradient-to-br from-teal-600/5 to-transparent">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-teal-600">
            Built by Passionate Educators & Engineers
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Our diverse team combines expertise in language education, artificial intelligence, software engineering, and user experience design. 
            We're united by a common goal: making English learning accessible, effective, and enjoyable for everyone.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-600/10 text-teal-600">
              <Users className="w-4 h-4" />
              <span className="font-medium">10+ Team Members</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-600/10 text-teal-600">
              <Globe2 className="w-4 h-4" />
              <span className="font-medium">5+ Countries</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-600/10 text-teal-600">
              <Award className="w-4 h-4" />
              <span className="font-medium">20+ Years Combined Experience</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button variant="default" className="bg-teal-600 hover:bg-teal-700" asChild>
              <Link to="/contact">Get in Touch</Link>
            </Button>
            <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white" asChild>
              <Link to="/why">Learn Our Philosophy</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

