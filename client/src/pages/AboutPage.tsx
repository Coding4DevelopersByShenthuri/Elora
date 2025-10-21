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
      title: "Elora Launch",
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
      description: "Thousands of learners worldwide improving their English skills with Elora."
    },
    {
      year: "Future",
      title: "Vision Ahead",
      description: "Expanding to more languages and advanced AI capabilities while staying offline-first."
    }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background elements - NO CHANGES */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/3 left-0 w-[250px] h-[250px] rounded-full bg-accent/5 blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-24 sm:pt-28 md:pt-32 lg:pt-36 pb-12 md:pb-16 lg:pb-24">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 xl:gap-16 items-center mb-12 md:mb-16 lg:mb-20">
          {/* Left Side - Student Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative">
              {/* Student image */}
              <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 mx-auto rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl">
                <img 
                  src="/About.png" 
                  alt="Happy English learner" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Background shapes */}
              <div className="absolute -top-6 -left-6 md:-top-8 md:-left-8 w-24 h-24 md:w-32 md:h-32 bg-primary/10 rounded-xl md:rounded-2xl rotate-12 hidden sm:block"></div>
              <div className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 w-20 h-20 md:w-24 md:h-24 bg-secondary/10 rounded-xl md:rounded-2xl -rotate-12 hidden sm:block"></div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-5 h-5 md:w-6 md:h-6 bg-orange-400 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-3 h-3 md:w-4 md:h-4 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-4 md:space-y-6 lg:space-y-8 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 text-primary font-medium text-sm md:text-base">
              <Globe2 className="w-3 h-3 md:w-4 md:h-4" />
              <span>About Us</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
              Get in <span className="text-orange-400">Touch</span>
            </h1>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
              Join our community of <br className="hidden sm:block" />language learners
            </h2>
            
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Looking to become fluent in English? Elora is now servicing learners worldwide! 
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

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16 lg:mb-20">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 md:p-8 lg:p-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 mb-4 sm:mb-0 sm:mr-4 flex-shrink-0">
                  <Target className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary mb-1">Best Certified AI Worldwide</h2>
                  <div className="text-2xl md:text-3xl font-bold text-primary">210+</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Expert models already join us</div>
                </div>
              </div>
              <p className="text-sm md:text-base lg:text-lg text-muted-foreground leading-relaxed">
                To democratize English language learning by providing a powerful, AI-driven platform that works completely offline. 
                We're committed to breaking down barriers and making quality English education available to learners worldwide.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 md:p-8 lg:p-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform duration-300 mb-4 sm:mb-0 sm:mr-4 flex-shrink-0">
                  <Lightbulb className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary mb-1">Transforming learners and AI technology</h2>
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-orange-400 flex items-center justify-center mt-2">
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                </div>
              </div>
              <p className="text-sm md:text-base lg:text-lg text-muted-foreground leading-relaxed">
                A world where language is never a barrier to opportunity. We envision every person having the confidence to speak English fluently, 
                opening doors to education, careers, and connections across borders.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Values */}
        <div className="mb-12 md:mb-16 lg:mb-20">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">
              Our Core <span className="text-primary">Values</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              These principles guide everything we do and every decision we make.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {values.map((value, idx) => (
              <Card key={idx} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-5 md:p-6 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4 md:mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">{value.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Our Story */}
        <Card className="mb-12 md:mb-16 lg:mb-20 border-0 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="p-6 md:p-10 lg:p-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-center text-primary">
              Our Story
            </h2>
          
          <div className="max-w-4xl mx-auto space-y-3 md:space-y-4 text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
            <p>
              Elora was born from a simple observation: millions of people worldwide want to learn English, 
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
              But most importantly, we built Elora with <strong className="text-primary">privacy, accessibility, and effectiveness</strong> at its core. 
              Your data never leaves your device. You can learn anywhere—on a plane, in remote areas, during your commute. 
              And our AI provides real-time feedback that actually helps you improve.
            </p>
            
            <p className="font-semibold text-primary">
              Today, Elora is helping thousands of learners around the world speak English with confidence. And we're just getting started.
            </p>
          </div>
          </CardContent>
        </Card>

        {/* Journey Timeline */}
        <div className="mb-12 md:mb-16 lg:mb-20">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">
              Our <span className="text-primary">Journey</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              From a simple idea to helping thousands of learners worldwide.
            </p>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary via-secondary to-accent hidden lg:block"></div>
            
            <div className="space-y-8 md:space-y-12">
              {milestones.map((milestone, idx) => (
                <div key={idx} className={`flex items-center gap-4 md:gap-8 ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  {/* Content */}
                  <div className={`flex-1 ${idx % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-4 md:p-6">
                        <div className="inline-block px-2 py-1 md:px-3 md:py-1 rounded-full bg-primary/20 text-primary font-bold text-xs md:text-sm mb-2 md:mb-3">
                          {milestone.year}
                        </div>
                        <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-primary">{milestone.title}</h3>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{milestone.description}</p>
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

        {/* Team Section - Redesigned like the image */}
        <div className="relative mb-12 md:mb-16 lg:mb-20">
          {/* Main Teal Block */}
          <div className="relative bg-[#2F786E] rounded-3xl p-8 md:p-12 lg:p-16 overflow-hidden">
            {/* Student Image Peeking from Left */}
            <div className="absolute -left-8 md:-left-12 lg:-left-16 top-1/2 transform -translate-y-1/2 z-10">
              <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                <img 
                  src="/board.jpg" 
                  alt="Happy student" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className="relative z-20 ml-16 md:ml-20 lg:ml-24 max-w-4xl">
              {/* Orange "Get in Touch" subtitle */}
              <div className="text-[#F7B500] font-semibold text-sm md:text-base lg:text-lg mb-2">
                Get in Touch
              </div>
              
              {/* Main heading */}
              <h2 className="text-white text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 md:mb-6 leading-tight">
                Built by Passionate<br className="hidden sm:block" />
                Educators & Engineers
              </h2>
              
              {/* Description */}
              <p className="text-white text-sm md:text-base lg:text-lg leading-relaxed mb-6 md:mb-8 max-w-2xl">
                Our diverse team combines expertise in language education, artificial intelligence, software engineering, and user experience design. 
                We're united by a common goal: making English learning accessible, effective, and enjoyable for everyone.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-3 md:gap-6 mb-6 md:mb-8">
                <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/20 text-white text-xs md:text-base">
                  <Users className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="font-medium">10+ Team Members</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/20 text-white text-xs md:text-base">
                  <Globe2 className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="font-medium">5+ Countries</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/20 text-white text-xs md:text-base">
                  <Award className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="font-medium">20+ Years Experience</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button size="lg" className="bg-[#F7B500] hover:bg-[#F7B500]/90 text-white px-6 py-3 md:px-8 md:py-4 text-base md:text-lg rounded-full" asChild>
                  <Link to="/contact">Get in Touch</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#2F786E] px-6 py-3 md:px-8 md:py-4 text-base md:text-lg rounded-full" asChild>
                  <Link to="/why">Learn Our Philosophy</Link>
                </Button>
              </div>
            </div>

            {/* Orange Arrow Icon - Top Right */}
            <div className="absolute top-6 md:top-8 right-6 md:right-8 w-8 h-8 md:w-10 md:h-10 bg-[#2F786E] rounded-lg flex items-center justify-center">
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-[#F7B500] rotate-45" />
            </div>



            {/* Hand-drawn Underline - Under main heading */}
            <div className="absolute top-32 md:top-40 left-16 md:left-20 lg:left-24 w-32 md:w-48 lg:w-64">
              <svg 
                viewBox="0 0 200 20" 
                className="w-full h-full"
              >
                <path
                  d="M5 15 Q50 5 100 12 Q150 18 195 8"
                  fill="none"
                  stroke="#F7B500"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

