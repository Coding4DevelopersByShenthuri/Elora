import { Button } from '@/components/ui/button';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';

interface DesignSectionProps {
  show: boolean;
}

export const DesignSection = ({ show }: DesignSectionProps) => {
  // Categories for English learning exercises

  const exerciseCategories = useMemo(() => [
    {
      title: "Speaking Practice",
      exercises: [
        "Daily Conversation",
        "Story Retelling",
        "Picture Description",
        "Role Play Dialogues",
        "Pronunciation Drill",
        "Speech Recording",
        "Tongue Twisters",
        "Debate Exercises"
      ]
    },
    {
      title: "Vocabulary & Grammar",
      exercises: [
        "Word of the Day",
        "Synonyms & Antonyms",
        "Grammar Challenge",
        "Fill in the Blanks",
        "Sentence Correction",
        "Phrasal Verbs Practice",
        "Idioms & Expressions",
        "Word Association Game"
      ]
    },
    {
      title: "Listening & Comprehension",
      exercises: [
        "Short Audio Clips",
        "Podcast Summaries",
        "Story Listening",
        "Q&A Comprehension",
        "Dialog Interpretation",
        "News Listening",
        "Song Lyrics Exercise",
        "Audio Dictation"
      ]
    },
    {
      title: "Writing & Expression",
      exercises: [
        "Daily Journal",
        "Creative Story",
        "Opinion Writing",
        "Email Practice",
        "Essay Writing",
        "Text Summarization",
        "Dialogue Writing",
        "Descriptive Paragraph"
      ]
    }
  ], []);

  const [currentExercises, setCurrentExercises] = useState<string[]>([]);
  const [category, setCategory] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Auto-cycle categories every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCategory(prev => (prev + 1) % exerciseCategories.length);
        setCurrentExercises(
          exerciseCategories[(category + 1) % exerciseCategories.length].exercises
            .sort(() => Math.random() - 0.5)
            .slice(0, 8)
        );
        setAnimating(false);
      }, 500);
    }, 5000);
    return () => clearInterval(timer);
  }, [category, exerciseCategories]);

  // Initialize with the first category exercises
  useEffect(() => {
    setCurrentExercises(
      exerciseCategories[0].exercises.sort(() => Math.random() - 0.5).slice(0, 8)
    );
  }, [exerciseCategories]);

  // Change category on click
  const changeCategory = (index: number) => {
    if (category === index || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCategory(index);
      setCurrentExercises(
        exerciseCategories[index].exercises.sort(() => Math.random() - 0.5).slice(0, 8)
      );
      setAnimating(false);
    }, 500);
  };

  return (
    <AnimatedTransition show={show} animation="slide-up" duration={600}>
      <div className="py-16 md:py-24">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-2 mb-12">
          <h2 className="text-4xl font-bold text-teal-500 md:text-8xl">Design</h2>
          <p className="text-foreground max-w-3xl text-xl md:text-2xl mt-2">
            Practice speaking, listening, reading, and writing English entirely offline with our ready-to-use exercises.
          </p>
        </div>

        {/* Category Dots */}
        <div className="flex justify-center space-x-2 mb-12">
          {exerciseCategories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => changeCategory(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${category === idx ? 'bg-primary scale-125' : 'bg-muted hover:bg-primary/50'}`}
              aria-label={cat.title}
            />
          ))}
        </div>

        {/* Category Title */}
        <AnimatedTransition show={!animating} animation="fade" duration={500} className="text-center mb-8">
          <h3 className="text-2xl font-bold text-primary">
            {exerciseCategories[category].title}
          </h3>
        </AnimatedTransition>

        {/* Exercises Grid */}
        <div className="relative">
          <AnimatedTransition show={!animating} animation="fade" duration={500}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {currentExercises.map((exercise, idx) => (
                <Card key={idx} className="group overflow-hidden hover:shadow-xl transition-all duration-500 cursor-pointer">
                  <div className="relative h-40 bg-gradient-to-br from-primary/5 to-primary/20 p-6 flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300"></div>
                    <span className="font-medium text-lg text-center z-10 group-hover:scale-105 transition-transform duration-300">
                      {exercise}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </AnimatedTransition>
        </div>

        <div className="flex justify-center mt-10">
          {/* Optional Call-to-Action Button can go here */}
        </div>
      </div>
    </AnimatedTransition>
  );
};

