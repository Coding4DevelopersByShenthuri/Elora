import React, { useEffect, useRef, useState } from 'react';

const Lesson1Video: React.FC = () => {
  // Static path confirmed by user; no runtime probing needed
  const resolvedSrc = '/videos/english-greetings-101.mp4';
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; delay: number; opacity: number }>>([]);

  const chapters = [
    { t: '00:00', label: 'Introduction', seconds: 0 },
    { t: '00:15', label: 'Lesson overview', seconds: 15 },
    { t: '01:00', label: 'Formal greetings', seconds: 60 },
    { t: '02:20', label: 'Casual greetings', seconds: 140 },
    { t: '03:30', label: 'Self introductions', seconds: 210 },
    { t: '04:30', label: 'Context lines', seconds: 270 },
    { t: '05:15', label: 'Practice', seconds: 315 },
    { t: '06:20', label: 'Recap & next steps', seconds: 380 }
  ];

  // Generate animated stars (milky way effect like Adults page)
  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 180 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 3,
        opacity: Math.random() * 0.8 + 0.2
      }));
      setStars(newStars);
    };
    generateStars();
  }, []);

  const handleVideoError = () => {
    // eslint-disable-next-line no-console
    console.error('Video playback error. Possible causes: 404 path, unsupported codec, or blocked load.', { resolvedSrc });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      {/* Deep Space Background with Stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {stars.map((star, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              opacity: star.opacity,
              boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.opacity})`
            }}
          />
        ))}
      </div>
      {/* Space background accents & planets (match Adults page style) */}
      <div className="fixed inset-0 pointer-events-none opacity-60">
        {/* Nebula glows */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-radial from-purple-500/30 via-indigo-500/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-radial from-cyan-500/25 via-blue-500/12 to-transparent rounded-full blur-3xl" />
        {/* Planet elements */}
        <div className="absolute -bottom-10 left-0 w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] md:w-[200px] md:h-[200px] lg:w-[240px] lg:h-[240px] opacity-70">
          <div className="relative w-full h-full">
            <img
              src="/planets/eReia3yfybtZ8P5576d6kF8NJIM.avif"
              alt="Planet"
              className="absolute inset-0 rounded-full object-cover shadow-2xl"
              style={{ filter: 'grayscale(0.2) brightness(0.85)' }}
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-2xl" />
          </div>
        </div>
        <div className="absolute top-24 right-2 sm:right-6 w-[120px] h-[120px] sm:w-[170px] sm:h-[170px] md:w-[220px] md:h-[220px] lg:w-[260px] lg:h-[260px] opacity-50 hidden sm:block">
          <div className="relative w-full h-full">
            <img
              src="/planets/SEp7QE3Bk6RclE0R7rhBgcGIOI.avif"
              alt="Planet"
              className="absolute inset-0 rounded-full object-cover shadow-xl"
              style={{ filter: 'grayscale(0.3) brightness(0.75)' }}
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/15 to-pink-500/15 blur-xl" />
          </div>
        </div>
        <div className="absolute top-1/3 right-6 md:right-24 w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] md:w-[200px] md:h-[200px] opacity-40 hidden md:block">
          <div className="relative w-full h-full">
            <img
              src="/planets/K3uC2Tk4o2zjSbuWGs3t0MMuLVY.avif"
              alt="Planet"
              className="absolute inset-0 rounded-full object-cover shadow-xl"
              style={{ filter: 'grayscale(0.3) brightness(0.7)' }}
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/15 to-blue-500/15 blur-xl" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-32 md:pt-36 pb-12">
        <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-white">
          Professional Greetings & Introductions
      </h1>

        <div className="rounded-xl border-2 border-slate-200/20 dark:border-slate-700/50 shadow-2xl bg-slate-900/40 backdrop-blur">
          <div className="overflow-hidden bg-black rounded-[10px]">
            <video
              className="w-full max-h-[55vh] sm:max-h-[70vh] object-contain"
              controls
              preload="auto"
              playsInline
              poster="/Lesson01_Thumb.png"
              src={resolvedSrc}
              onError={handleVideoError}
              ref={videoRef}
            />
          </div>
        </div>

        {/* Title and stats */}
        <div className="mt-4">
          <h2 className="text-xl md:text-2xl font-semibold text-white">
          Professional Greetings & Introductions
        </h2>
          <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 text-sm text-cyan-100/80">
            <div className="flex items-center gap-2">
              <span>12,348 views</span>
              <span className="hidden sm:inline">•</span>
              <span>Published Nov 2025</span>
            </div>
            <div className="sm:ml-auto flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-full border border-white/20 text-white text-sm hover:bg-white/10">Like</button>
              <button className="px-3 py-1.5 rounded-full border border-white/20 text-white text-sm hover:bg-white/10">Share</button>
              <button className="px-3 py-1.5 rounded-full border border-white/20 text-white text-sm hover:bg-white/10">Save</button>
            </div>
          </div>
        </div>

        {/* Channel row */}
        <div className="mt-4 flex items-center gap-3">
          <img
            src="/logo01.png"
            alt="Channel"
            className="w-10 h-10 rounded-full object-cover border border-white/20"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold leading-tight text-white">Elora English</div>
            <div className="text-xs text-cyan-100/80">42.1K subscribers</div>
          </div>
          <button className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium">
            Subscribe
          </button>
        </div>

        {/* Description box (expandable) */}
        <DescriptionBox />

        {/* Chapters */}
        <div className="mt-4">
          <div className="text-sm font-semibold mb-2 text-white">Chapters</div>
          <div className="flex flex-wrap gap-2">
            {chapters.map((c) => (
              <button
                key={c.t}
                className="text-xs md:text-sm px-3 py-1.5 rounded-full border border-white/20 text-white hover:bg-white/10"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = c.seconds;
                    videoRef.current.play().catch(() => {});
                  }
                }}
              >
                {c.t} • {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hashtags */}
        <div className="mt-3 text-sm text-cyan-300 flex flex-wrap gap-3">
          <span>#EnglishLessons</span>
          <span>#Greetings</span>
          <span>#LearnEnglish</span>
        </div>
      </div>
    </div>
  );
};

function DescriptionBox() {
  const [expanded, setExpanded] = useState(false);
  const full =
    "Welcome to English Greetings 101. In this lesson, you'll learn practical ways to say hello, introduce yourself, and connect the conversation with short context lines.\n\nWhat you'll learn:\n• Formal vs casual greetings\n• A clear self‑introduction pattern (Name • Role • Purpose)\n• Short context lines to keep the conversation flowing\n\nResources:\n• Practice sheet: Greetings & Introductions (PDF)\n• Next lesson: Natural Small Talk\n\nCall to action:\nSubscribe for weekly lessons and practice challenges. Comment with your introduction below!";
  const short = full.split('\n').slice(0, 3).join('\n');

  return (
    <div className="mt-4 rounded-xl border border-white/15 bg-white/5 backdrop-blur p-4">
      <pre className="whitespace-pre-wrap text-sm text-cyan-50/90">
        {expanded ? full : short}
      </pre>
      <button
        className="mt-2 text-sm text-cyan-300 font-medium"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? 'Show less' : 'Show more'}
      </button>
    </div>
  );
}

export default Lesson1Video;


