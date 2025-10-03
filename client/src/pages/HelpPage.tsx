import { useState, useEffect } from 'react';
import { useAnimateIn } from '@/lib/animations';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { Button } from '@/components/ui/button';
import { HelpCircle, Mail, MessageCircle, BookOpen, Stars } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/components/landing/Footer';

const HelpSection = ({
    title,
    content,
    icon,
    id
}: {
    title: string;
    content: React.ReactNode;
    icon: React.ReactNode;
    id: string;
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

const HelpPage = () => {
    const showContent = useAnimateIn(false, 300);

    return (
        <div className="relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
            <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl -z-10"></div>
            <div className="absolute bottom-1/3 left-0 w-[250px] h-[250px] rounded-full bg-accent/5 blur-3xl -z-10"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24">
                <AnimatedTransition show={showContent} animation="slide-up">
                    <div className="flex flex-col items-center text-center mb-16">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-teal-600">
                            Need Help?
                        </h1>

                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            We're here to support you—anytime, anywhere. Explore common questions, support options, and more.
                        </p>

                        <div className="mt-10 glass-panel p-8 md:p-10 rounded-lg max-w-3xl mx-auto shadow-lg border-2 border-primary/20">
                            <p className="text-xl md:text-2xl text-foreground/90">
                                Whether you’re stuck, curious, or just getting started—this page is for you.
                            </p>
                            <p className="text-xl md:text-2xl text-foreground/90 mt-6">
                                Find answers, connect with support, and get the most out of Speak Bee.
                            </p>
                        </div>
                    </div>

                    <HelpSection
                        id="faq"
                        icon={<BookOpen className="w-6 h-6 text-primary" />}
                        title={<span className="text-teal-600">Frequently Asked Questions</span>}
                        content={
                            <>
                                <p><strong>Q: Do I need the internet to use this app?</strong></p>
                                <p>A: No! Speak Bee works fully offline. You can learn, practice, and improve anywhere, anytime.</p>

                                <p className="mt-6"><strong>Q: Is my data being tracked?</strong></p>
                                <p>A: Absolutely not. We value your privacy. Everything stays on your device—nothing is sent to the cloud.</p>

                                <p className="mt-6"><strong>Q: How do I reset the app or my progress?</strong></p>
                                <p>A: You can reset from the Settings page. Tap on 'Reset Progress' under the profile tab.</p>
                            </>
                        }
                    />

                    <HelpSection
                        id="support"
                        icon={<Mail className="w-6 h-6 text-primary" />}
                        title={<span className="text-teal-600">Still Need Support?</span>}
                        content={
                            <>
                                <p>
                                    No worries—our team is happy to help. You can email us directly or fill out a contact form.
                                </p>
                                <ul className="list-disc list-inside mt-4 space-y-1 text-foreground/80">
                                    <li>Email: <a href="mailto:support@speakbee.ai" className="text-shadow-teal-600 underline">support@speakbee.ai</a></li>
                                    <li><Link to="/contact" className="text-shadow-teal-600 underline">Contact Form</Link> — Get a response within 24 hours.</li>
                                </ul>
                            </>
                        }
                    />

                    <HelpSection
                        id="community"
                        icon={<MessageCircle className="w-6 h-6 text-primary" />}
                        title={<span className="text-teal-600">Join the Community</span>}
                        content={
                            <>
                                <p>
                                    Share your journey, ask questions, and connect with other English learners just like you.
                                </p>
                                <p>
                                    We’re building a space for learners to support each other—coming soon!
                                </p>
                            </>
                        }
                    />

                    <div className="mt-16 text-center">
                        <Button size="lg" className="gap-2" asChild>
                            <Link to="/">
                                Back to Home
                                <Stars size={18} />
                            </Link>
                        </Button>
                    </div>
                </AnimatedTransition>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default HelpPage;
