import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { SurveyData } from '@/components/surveys/UserSurvey';
import { Clock, ChevronDown } from 'lucide-react';

const progressSteps = [35, 70, 85, 100];

const personalizationTasks = [
  { id: 'topics', label: 'Creating diverse topics', icon: '✨' },
  { id: 'dialogues', label: 'Preparing interactive dialogues', icon: '💬' },
  { id: 'path', label: 'Optimizing your learning path', icon: '📊' },
  { id: 'plan', label: 'Finalizing your plan', icon: '📋' }
] as const;

interface PersonalizationSurveyProps {
  isOpen: boolean;
  onComplete: (surveyData?: SurveyData) => void;
  onBack: () => void;
}

const PersonalizationSurvey: React.FC<PersonalizationSurveyProps> = ({
  isOpen,
  onComplete,
  onBack
}) => {
  const [progress, setProgress] = useState(0);
  const [activeTaskIndex, setActiveTaskIndex] = useState<number | null>(null);
  const [completedTaskCount, setCompletedTaskCount] = useState(0);
  const [showGoalChooser, setShowGoalChooser] = useState(false);
  const [showStartTimeChooser, setShowStartTimeChooser] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState<string>('');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  useEffect(() => {
    const timers: number[] = [];

    if (!isOpen) {
      return () => {
        timers.forEach((timerId) => window.clearTimeout(timerId));
      };
    }

    setProgress(0);
    setActiveTaskIndex(null);
    setCompletedTaskCount(0);
    setShowGoalChooser(false);
    setShowStartTimeChooser(false);
    setSelectedGoal(null);
    setSelectedStartTime('');
    setShowTimeDropdown(false);

    let step = 0;

    const advance = () => {
      setActiveTaskIndex(step);
      setCompletedTaskCount(step);
      setProgress(progressSteps[step] ?? 100);

      if (step === personalizationTasks.length - 1) {
        timers.push(
          window.setTimeout(() => {
            setCompletedTaskCount(personalizationTasks.length);
            setActiveTaskIndex(null);
            setProgress(100);
            // Show first popup after a brief delay when initialization completes
            timers.push(
              window.setTimeout(() => {
                setShowGoalChooser(true);
              }, 500)
            );
          }, 1000)
        );
        return;
      }

      step += 1;
      timers.push(window.setTimeout(advance, 1100));
    };

    timers.push(window.setTimeout(advance, 350));

    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, [isOpen]);

  const progressRingStyle = useMemo(() => {
    return {
      background: `conic-gradient(#2563eb ${progress}%, rgba(37, 99, 235, 0.12) ${progress}% 100%)`
    };
  }, [progress]);

  const handleGoalSelect = (minutes: number) => {
    setSelectedGoal(minutes);
    setShowGoalChooser(false);
    // Show second popup after goal is selected
    setTimeout(() => {
      setShowStartTimeChooser(true);
    }, 300);
  };

  const handleStartTimeSelect = (time: string, goalMinutes: number) => {
    setSelectedStartTime(time);
    setShowStartTimeChooser(false);
    
    // Save to sessionStorage - App.tsx will handle saving all data to MySQL
    const surveyData: SurveyData = {
      practiceGoalMinutes: goalMinutes,
      practiceStartTime: time,
      personalizationCompleted: true,
      completedAt: new Date().toISOString()
    };

    const existingData = sessionStorage.getItem('speakbee_survey_data');
    const allData = existingData ? JSON.parse(existingData) : {};
    const mergedData = { ...allData, ...surveyData };
    sessionStorage.setItem('speakbee_survey_data', JSON.stringify(mergedData));
    
    // Complete after a brief delay
    setTimeout(() => {
      onComplete?.(surveyData);
    }, 300);
  };

  // Generate time options (every 30 minutes from 6 AM to 11 PM)
  const generateTimeOptions = () => {
    const times: string[] = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showTimeDropdown) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.time-selector-container')) {
        setShowTimeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTimeDropdown]);

  // Debug: Log when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      console.log('✅ PersonalizationSurvey (Step 18) is now OPEN');
    } else {
      console.log('❌ PersonalizationSurvey (Step 18) is now CLOSED');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-none w-full h-full p-0 border-0 bg-transparent overflow-hidden z-[9999]"
        title="Personalization Survey"
        description="Set your practice preferences"
      >
        <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-white">
          <button
            onClick={onBack}
            className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-blue-700 shadow hover:bg-white transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-12 md:flex-row md:px-12">
            <div className="w-full max-w-sm md:max-w-md">
              <div className="rounded-3xl bg-white/80 p-8 shadow-xl backdrop-blur">
                <div className="flex items-center gap-4">
                  <img
                    src="/student.jpg"
                    alt="Learna testimonial"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Maria Angelica Reyes, 35</h3>
                    <p className="text-sm text-slate-500">Philippines</p>
                  </div>
                </div>
                <p className="mt-6 text-sm leading-relaxed text-slate-600">
                  “Learna customized just for me. It feels like a personal tutor in my pocket.”
                </p>
              </div>
            </div>

            <div className="relative w-full max-w-2xl rounded-[36px] bg-white/90 p-10 shadow-2xl backdrop-blur">
              <div className="absolute -top-16 right-10 hidden h-24 w-24 items-center justify-center rounded-full bg-white/70 shadow-lg md:flex">
                <img
                  src="/Robot.png"
                  alt="Elora assistant"
                  className="h-20 w-20 object-contain"
                />
              </div>

              <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative h-40 w-40 shrink-0">
                    <div
                      className="h-full w-full rounded-full"
                      style={progressRingStyle}
                    />
                    <div className="absolute inset-4 flex items-center justify-center rounded-full bg-white shadow-inner">
                      <div className="text-center">
                        <span className="block text-3xl font-bold text-blue-700">{progress}%</span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          progress
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium uppercase tracking-[0.24em] text-blue-600">
                    Customizing
                  </span>
                </div>

                <div className="flex-1 space-y-6">
                  <div>
                    <h2 className="text-3xl font-semibold text-slate-900">
                      Creating your personal experience…
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      We are tailoring lessons, dialogues, and practice sessions just for you.
                    </p>
                  </div>

                  <ul className="space-y-4">
                    {personalizationTasks.map((task, index) => {
                      const isCompleted = index < completedTaskCount;
                      const isActive =
                        !isCompleted && index === activeTaskIndex && completedTaskCount < personalizationTasks.length;
                      return (
                        <li
                          key={task.id}
                          className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{task.icon}</span>
                            <span className="text-sm font-medium text-slate-700">{task.label}</span>
                          </div>
                          <span
                            className={[
                              'text-xs font-semibold',
                              isCompleted
                                ? 'text-green-600'
                                : isActive
                                ? 'text-blue-600'
                                : 'text-slate-400'
                            ].join(' ')}
                          >
                            {isCompleted ? 'Done' : isActive ? 'Loading…' : 'Loading…'}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* First Popup: Daily Practice Goal */}
          {showGoalChooser && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm px-4">
              <div className="w-full max-w-xl rounded-3xl bg-white p-10 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 text-center">
                  To make progress, please clarify
                </p>
                <h3 className="mt-4 text-center text-2xl font-semibold text-slate-900">
                  What is your daily practice goal?
                </h3>
                <div className="mt-8 flex flex-col gap-4 md:flex-row">
                  {[5, 10, 15].map((minutes) => (
                    <button
                      key={minutes}
                      onClick={() => handleGoalSelect(minutes)}
                      className="flex-1 rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 text-lg font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      {minutes} min/day
                    </button>
                  ))}
                </div>
                <p className="mt-6 text-center text-xs text-slate-400">
                  Pick what feels right today. You can always adjust this later.
                </p>
              </div>
            </div>
          )}

          {/* Second Popup: Practice Start Time */}
          {showStartTimeChooser && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm px-4">
              <div className="w-full max-w-xl rounded-3xl bg-white p-10 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 text-center">
                  To make progress, please clarify
                </p>
                <h3 className="mt-4 text-center text-2xl font-semibold text-slate-900">
                  When would you like to start your daily practice?
                </h3>
                <div className="mt-8 relative time-selector-container">
                  <button
                    onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 text-left text-lg font-semibold text-slate-700 shadow-sm transition-all hover:border-blue-400 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-slate-400" />
                      <span>
                        {selectedStartTime
                          ? new Date(`2000-01-01T${selectedStartTime}`).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })
                          : 'Choose start time'}
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform ${
                        showTimeDropdown ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {showTimeDropdown && (
                    <div className="absolute z-40 mt-2 w-full max-h-60 overflow-y-auto rounded-2xl border-2 border-slate-200 bg-white shadow-lg">
                      {timeOptions.map((time) => {
                        const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        });
                        return (
                          <button
                            key={time}
                            onClick={() => {
                              setSelectedStartTime(time);
                              setShowTimeDropdown(false);
                              handleStartTimeSelect(time, selectedGoal || 10);
                            }}
                            className="w-full px-6 py-3 text-left text-base text-slate-700 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0"
                          >
                            {displayTime}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <p className="mt-6 text-center text-xs text-slate-400">
                  We'll remind you to practice at this time each day.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalizationSurvey;

