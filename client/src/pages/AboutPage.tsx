import { useState, useEffect } from 'react';
import { Target, Heart, Users, Lightbulb, Award, Globe2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
        {/* Hero Section - Model Image Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left Side - Student Image */}
          <div className="relative">
            <div className="relative">
              {/* Student placeholder - using a gradient circle as placeholder */}
              <div className="w-80 h-80 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <div className="w-60 h-60 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                  <Users className="w-24 h-24 text-primary" />
                </div>
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
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-6">
              <Globe2 className="w-4 h-4" />
              <span>About Us</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Get in <span className="text-orange-400">Touch</span>
            </h1>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6">
              Join our community of <br />language learners
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Looking to become fluent in English? Speak Bee is now servicing learners worldwide! 
              English learning is a rewarding journey for aspiring speakers, part-time learners, and exam candidates.
            </p>

            {/* Decorative elements */}
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Mission & Vision - Model Image Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 md:p-10">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 mr-4">
                  <Target className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-primary">Best Certified AI Worldwide</h2>
                  <div className="text-3xl font-bold text-primary">210+</div>
                  <div className="text-sm text-muted-foreground">Expert models already join us</div>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                To democratize English language learning by providing a powerful, AI-driven platform that works completely offline. 
                We're committed to breaking down barriers and making quality English education available to learners worldwide.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 md:p-10">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform duration-300 mr-4">
                  <Lightbulb className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-primary">Transforming learners and AI technology</h2>
                  <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center mt-2">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                A world where language is never a barrier to opportunity. We envision every person having the confidence to speak English fluently, 
                opening doors to education, careers, and connections across borders.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Values */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Our Core <span className="text-primary">Values</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              These principles guide everything we do and every decision we make.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <Card key={idx} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Our Story */}
        <Card className="mb-20 border-0 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="p-8 md:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-primary">
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
              But most importantly, we built Speak Bee with <strong className="text-primary">privacy, accessibility, and effectiveness</strong> at its core. 
              Your data never leaves your device. You can learn anywhere—on a plane, in remote areas, during your commute. 
              And our AI provides real-time feedback that actually helps you improve.
            </p>
            
            <p className="font-semibold text-primary">
              Today, Speak Bee is helping thousands of learners around the world speak English with confidence. And we're just getting started.
            </p>
          </div>
          </CardContent>
        </Card>

        {/* Journey Timeline */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Our <span className="text-primary">Journey</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From a simple idea to helping thousands of learners worldwide.
            </p>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary via-secondary to-accent hidden lg:block"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, idx) => (
                <div key={idx} className={`flex items-center gap-8 ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  {/* Content */}
                  <div className={`flex-1 ${idx % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary font-bold text-sm mb-3">
                          {milestone.year}
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-primary">{milestone.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Center dot */}
                  <div className="hidden lg:block w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg z-10 flex-shrink-0"></div>
                  
                  {/* Spacer for alternating layout */}
                  <div className="hidden lg:block flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <Card className="border-0 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-primary">
              Built by Passionate Educators & Engineers
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Our diverse team combines expertise in language education, artificial intelligence, software engineering, and user experience design. 
              We're united by a common goal: making English learning accessible, effective, and enjoyable for everyone.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                <Users className="w-4 h-4" />
                <span className="font-medium">10+ Team Members</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                <Globe2 className="w-4 h-4" />
                <span className="font-medium">5+ Countries</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                <Award className="w-4 h-4" />
                <span className="font-medium">20+ Years Combined Experience</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-4 text-lg rounded-full" asChild>
                <Link to="/contact">Get in Touch</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 text-lg rounded-full" asChild>
                <Link to="/why">Learn Our Philosophy</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;

