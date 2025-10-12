import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Award, Users, GraduationCap, Baby, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AnimatedTransition } from '@/components/AnimatedTransition';

const PricingPage = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [activeTab, setActiveTab] = useState<'kids' | 'adults' | 'ielts'>('kids');

  // Handle plan selection
  const handlePlanSelect = (planName: string, category: string, price: number, billingType: string) => {
    // For demo purposes - in a real app, this would integrate with your payment system
    console.log(`Selected plan: ${planName} in ${category} category for $${price} (${billingType})`);
    
    // Redirect to signup with plan details
    const planDetails = {
      plan: planName,
      category: category,
      price: price,
      billing: billingType
    };
    
    // Store plan selection in session storage for the signup page
    sessionStorage.setItem('selectedPlan', JSON.stringify(planDetails));
    
    // Redirect to signup page
    window.location.href = '/signup';
  };

  // Handle free trial
  const handleFreeTrial = (planName: string, category: string) => {
    console.log(`Starting free trial for: ${planName} in ${category} category`);
    
    const trialDetails = {
      plan: planName,
      category: category,
      type: 'trial'
    };
    
    sessionStorage.setItem('trialDetails', JSON.stringify(trialDetails));
    window.location.href = '/signup?trial=true';
  };

  // Handle contact sales
  const handleContactSales = (planName: string) => {
    console.log(`Contact sales for: ${planName}`);
    
    const salesDetails = {
      interest: planName,
      type: 'institutional'
    };
    
    sessionStorage.setItem('contactDetails', JSON.stringify(salesDetails));
    window.location.href = '/contact?type=sales';
  };

  // Handle learn more for add-ons
  const handleLearnMore = (addonName: string) => {
    console.log(`Learn more about: ${addonName}`);
    window.location.href = `/features#${addonName.toLowerCase().replace(' ', '-')}`;
  };

  const kidsPlans = [
    {
      name: "Free",
      price: { monthly: 0, annual: 0 },
      description: "Perfect for getting started",
      features: [
        "5 story lessons",
        "Daily vocabulary",
        "Phoneme hints",
        "Basic rewards system",
        "Limited access"
      ],
      cta: "Get Started",
      popular: false,
      color: "border-gray-200"
    },
    {
      name: "Premium",
      price: { monthly: 3, annual: 25 },
      description: "Most popular for young learners",
      features: [
        "Unlimited stories & games",
        "Streak rewards & badges",
        "Voice feedback",
        "Advanced gamification",
        "Progress tracking",
        "Certificate of completion"
      ],
      cta: "Start Free Trial",
      popular: true,
      color: "border-blue-500"
    },
    {
      name: "Institutional",
      price: { monthly: 150, annual: 150 },
      description: "For schools & NGOs",
      features: [
        "20 user accounts",
        "Teacher dashboard",
        "Offline class sync",
        "Progress analytics",
        "Bulk management",
        "Priority support"
      ],
      cta: "Contact Sales",
      popular: false,
      color: "border-purple-500"
    }
  ];

  const adultPlans = [
    {
      name: "Beginner",
      price: { oneTime: 5 },
      description: "Start your speaking journey",
      features: [
        "20 comprehensive lessons",
        "Pronunciation AI feedback",
        "Vocabulary trainer",
        "Basic grammar exercises",
        "Progress tracking"
      ],
      cta: "Get Started",
      popular: false,
      color: "border-green-200"
    },
    {
      name: "Intermediate",
      price: { oneTime: 8 },
      description: "Build conversation skills",
      features: [
        "Role-play dialogues",
        "Advanced grammar drills",
        "Conversation practice",
        "Progress analytics",
        "Adaptive feedback system"
      ],
      cta: "Get Started",
      popular: true,
      color: "border-green-500"
    },
    {
      name: "Advanced",
      price: { oneTime: 10 },
      description: "Master fluency & expression",
      features: [
        "Debate practice sessions",
        "Storytelling exercises",
        "Voice AI scoring",
        "Idiomatic usage",
        "Achievement badges",
        "Advanced analytics"
      ],
      cta: "Get Started",
      popular: false,
      color: "border-green-700"
    },
    {
      name: "All Access",
      price: { oneTime: 20 },
      description: "Complete learning package",
      features: [
        "All levels included",
        "Lifetime updates",
        "Certificate of completion",
        "Priority support",
        "Exclusive content",
        "All features unlocked"
      ],
      cta: "Best Value",
      popular: false,
      color: "border-yellow-500"
    }
  ];

  const ieltsPlans = [
    {
      name: "Free Trial",
      price: { oneTime: 0 },
      description: "Experience the platform",
      features: [
        "2 full mock tests",
        "Sample cue cards",
        "Basic feedback summary",
        "Limited access",
        "7-day trial period"
      ],
      cta: "Start Free Trial",
      popular: false,
      color: "border-orange-200"
    },
    {
      name: "Standard",
      price: { oneTime: 12 },
      description: "Comprehensive exam prep",
      features: [
        "10 full-length mock tests",
        "Cue card practice",
        "AI band score assessment",
        "Detailed feedback",
        "Progress tracking"
      ],
      cta: "Get Started",
      popular: true,
      color: "border-orange-500"
    },
    {
      name: "Pro",
      price: { oneTime: 20 },
      description: "Intensive training",
      features: [
        "25 mock tests",
        "Band score analytics",
        "Exportable reports",
        "Vocabulary drills",
        "Personalized study plans"
      ],
      cta: "Get Started",
      popular: false,
      color: "border-orange-700"
    },
    {
      name: "Premium Coaching",
      price: { oneTime: 30 },
      description: "Complete preparation",
      features: [
        "All Pro features included",
        "Guided preparation plans",
        "Official certificate",
        "1-on-1 support sessions",
        "Priority grading"
      ],
      cta: "Get Started",
      popular: false,
      color: "border-red-500"
    }
  ];

  const addOns = [
    {
      name: "Certification",
      price: 5,
      description: "Official completion certificate",
      features: ["Digital certificate", "Verifiable online", "Shareable badge"]
    },
    {
      name: "Offline Pack",
      price: 3,
      description: "Additional content packs",
      features: ["Downloadable stories", "Conversation packs", "Lifetime access"]
    },
    {
      name: "CSR License",
      price: "Custom",
      description: "Bulk license for NGOs",
      features: ["Custom user count", "Dedicated support", "White-label options"]
    }
  ];

  const PriceDisplay = ({ plan, category }: { plan: any; category: string }) => {
    if (category === 'kids' && billingPeriod === 'monthly') {
      return (
        <div className="flex items-baseline gap-1">
          <span className="text-3xl sm:text-4xl font-bold">${plan.price.monthly}</span>
          <span className="text-muted-foreground text-sm sm:text-base">/month</span>
        </div>
      );
    } else if (category === 'kids' && billingPeriod === 'annual') {
      return (
        <div className="flex items-baseline gap-1">
          <span className="text-3xl sm:text-4xl font-bold">${plan.price.annual}</span>
          <span className="text-muted-foreground text-sm sm:text-base">/year</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-baseline gap-1">
          <span className="text-3xl sm:text-4xl font-bold">${plan.price.oneTime}</span>
          <span className="text-muted-foreground text-sm sm:text-base">one-time</span>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen pt-29 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl text-teal-600 sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your English learning journey. All plans include our 
            AI-powered feedback system and progress tracking.
          </p>
        </div>

        {/* Billing Toggle - Only for Kids */}
        <div className="flex justify-center mb-8">
          <div className="bg-muted/50 rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                "px-3 sm:px-4 py-2 rounded-md font-medium transition-all text-sm sm:text-base",
                billingPeriod === 'monthly' 
                  ? "bg-background shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={cn(
                "px-3 sm:px-4 py-2 rounded-md font-medium transition-all text-sm sm:text-base",
                billingPeriod === 'annual' 
                  ? "bg-background shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annual (Save 30%)
            </button>
          </div>
        </div>

        {/* Main Pricing Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'kids' | 'adults' | 'ielts')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 transition-all duration-300">
            <TabsTrigger value="kids" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm transition-all duration-200">
              <Baby size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Kids</span>
            </TabsTrigger>
            <TabsTrigger value="adults" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm transition-all duration-200">
              <Users size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Adults</span>
            </TabsTrigger>
            <TabsTrigger value="ielts" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm transition-all duration-200">
              <GraduationCap size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">IELTS/PTE</span>
            </TabsTrigger>
          </TabsList>

          {/* Kids Plans */}
          <TabsContent value="kids">
            <AnimatedTransition show={activeTab === 'kids'} animation="fade" duration={300}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {kidsPlans.map((plan, index) => (
                  <Card 
                    key={index} 
                    className={cn(
                      "relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                      plan.popular && "ring-2 ring-blue-500",
                      plan.color
                    )}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: `fadeInUp 0.5s ease-out ${index * 100}ms both`
                    }}
                  >
                  {plan.popular && (
                    <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white px-2 sm:px-3 py-1 text-xs">
                        <Star size={10} className="mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      {plan.name}
                      {plan.name === "Institutional" && <Award size={16} className="text-purple-500" />}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">{plan.description}</CardDescription>
                    <PriceDisplay plan={plan} category="kids" />
                  </CardHeader>
                  <CardContent className="pb-4">
                    <ul className="space-y-2 sm:space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2 sm:gap-3">
                          <Check size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className={cn(
                        "w-full text-sm sm:text-base",
                        plan.popular && "bg-blue-600 hover:bg-blue-700"
                      )}
                      variant={plan.popular ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (plan.cta === "Start Free Trial") {
                          handleFreeTrial(plan.name, "kids");
                        } else if (plan.cta === "Contact Sales") {
                          handleContactSales(plan.name);
                        } else {
                          const price = billingPeriod === 'monthly' ? plan.price.monthly : plan.price.annual;
                          handlePlanSelect(plan.name, "kids", price, billingPeriod);
                        }
                      }}
                    >
                      {plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              </div>
            </AnimatedTransition>
          </TabsContent>

          {/* Adult Plans */}
          <TabsContent value="adults">
            <AnimatedTransition show={activeTab === 'adults'} animation="fade" duration={300}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {adultPlans.map((plan, index) => (
                <Card 
                  key={index}
                  className={cn(
                    "relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                    plan.popular && "ring-2 ring-green-500",
                    plan.color
                  )}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: `fadeInUp 0.5s ease-out ${index * 100}ms both`
                  }}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-500 text-white px-2 sm:px-3 py-1 text-xs">
                        <Zap size={10} className="mr-1" />
                        Popular Choice
                      </Badge>
                    </div>
                  )}
                  {plan.name === "All Access" && (
                    <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-yellow-500 text-white px-2 sm:px-3 py-1 text-xs">
                        <Crown size={10} className="mr-1" />
                        Best Value
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-sm sm:text-base">{plan.description}</CardDescription>
                    <PriceDisplay plan={plan} category="adults" />
                  </CardHeader>
                  <CardContent className="pb-4">
                    <ul className="space-y-2 sm:space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2 sm:gap-3">
                          <Check size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className={cn(
                        "w-full text-sm sm:text-base",
                        (plan.popular || plan.name === "All Access") && "bg-green-600 hover:bg-green-700"
                      )}
                      variant={(plan.popular || plan.name === "All Access") ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePlanSelect(plan.name, "adults", plan.price.oneTime, "one-time")}
                    >
                      {plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            </AnimatedTransition>
          </TabsContent>

          {/* IELTS/PTE Plans */}
          <TabsContent value="ielts">
            <AnimatedTransition show={activeTab === 'ielts'} animation="fade" duration={300}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {ieltsPlans.map((plan, index) => (
                <Card 
                  key={index}
                  className={cn(
                    "relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                    plan.popular && "ring-2 ring-orange-500",
                    plan.color
                  )}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: `fadeInUp 0.5s ease-out ${index * 100}ms both`
                  }}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-orange-500 text-white px-2 sm:px-3 py-1 text-xs">
                        <Star size={10} className="mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-sm sm:text-base">{plan.description}</CardDescription>
                    <PriceDisplay plan={plan} category="ielts" />
                  </CardHeader>
                  <CardContent className="pb-4">
                    <ul className="space-y-2 sm:space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2 sm:gap-3">
                          <Check size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className={cn(
                        "w-full text-sm sm:text-base",
                        plan.popular && "bg-orange-600 hover:bg-orange-700"
                      )}
                      variant={plan.popular ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (plan.cta === "Start Free Trial") {
                          handleFreeTrial(plan.name, "ielts");
                        } else {
                          handlePlanSelect(plan.name, "ielts", plan.price.oneTime, "one-time");
                        }
                      }}
                    >
                      {plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            </AnimatedTransition>
          </TabsContent>
        </Tabs>

        {/* Add-ons Section */}
        <div className="mt-12 sm:mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Additional Services</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Enhance your learning experience with these add-ons</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {addOns.map((addon, index) => (
              <Card 
                key={index} 
                className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: `fadeInUp 0.5s ease-out ${index * 100}ms both`
                }}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">{addon.name}</CardTitle>
                  <CardDescription className="text-sm sm:text-base">{addon.description}</CardDescription>
                  <div className="text-xl sm:text-2xl font-bold">
                    {typeof addon.price === 'number' ? `$${addon.price}` : addon.price}
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <ul className="space-y-1 sm:space-y-2">
                    {addon.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-xs sm:text-sm text-muted-foreground">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full text-sm sm:text-base" 
                    size="sm"
                    onClick={() => handleLearnMore(addon.name)}
                  >
                    Learn More
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 sm:mt-16 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Can I switch between plans?</h3>
              <p className="text-muted-foreground text-sm sm:text-base">Yes, you can upgrade or downgrade your plan at any time. The changes will be reflected in your next billing cycle.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Is there a free trial?</h3>
              <p className="text-muted-foreground text-sm sm:text-base">All paid plans come with a 7-day free trial. No credit card required for the free tier.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">What payment methods do you accept?</h3>
              <p className="text-muted-foreground text-sm sm:text-base">We accept all major credit cards, PayPal, and bank transfers for institutional plans.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="bg-muted/50 rounded-lg p-6 sm:p-8 max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Ready to improve your English?</h2>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              Join thousands of learners who have transformed their English speaking skills with our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                variant="outline" 
                size="lg" 
                asChild 
                className="text-sm sm:text-base"
                onClick={() => window.location.href = '/contact'}
              >
                <Link to="/contact">Contact</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;