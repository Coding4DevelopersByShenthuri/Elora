import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideosAPI } from '@/services/ApiService';
import { cn } from '@/lib/utils';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

const buildMediaUrl = (url?: string | null) => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = API_BASE_URL.replace(/\/$/, '');
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${base}${normalized}`;
};

interface Chapter {
  t: string;
  label: string;
  seconds: number;
}

interface VideoLesson {
  id: number;
  slug: string;
  title: string;
  description?: string;
  full_description?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  video_file?: string;
  video_file_url?: string;
  video_url?: string;
  duration: number;
  difficulty: string;
  category: string;
  rating: number;
  views: number;
  speaking_exercises: number;
  tags: string[];
  chapters?: Chapter[];
  hashtags?: string[];
  created_at: string;
}

const VideoDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [video, setVideo] = useState<VideoLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; delay: number; opacity: number }>>([]);

  // Generate animated stars
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

  // Fetch video data
  useEffect(() => {
    const fetchVideo = async () => {
      if (!slug) {
        setError('Video slug is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await VideosAPI.getVideoBySlug(slug);
        
        if (response.success && response.data) {
          setVideo(response.data);
        } else {
          setError('Video not found');
        }
      } catch (err: any) {
        console.error('Error fetching video:', err);
        setError(err?.message || 'Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [slug]);

  const handleVideoError = () => {
    console.error('Video playback error', { video });
  };

  const handleChapterClick = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading video...</div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">{error || 'Video not found'}</div>
          <Button onClick={() => navigate('/adults/videos')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Videos
          </Button>
        </div>
      </div>
    );
  }

  // Determine video source
  const videoSrc =
    buildMediaUrl(video.video_file_url) ||
    (video.video_url && (video.video_url.startsWith('http://') || video.video_url.startsWith('https://'))
      ? video.video_url
      : buildMediaUrl(video.video_url)) ||
    '';
  const posterSrc = buildMediaUrl(video.thumbnail_url) || buildMediaUrl(video.thumbnail) || '/Lesson01_Thumb.png';

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

      {/* Space background accents & planets */}
      <div className="fixed inset-0 pointer-events-none opacity-60">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-radial from-purple-500/30 via-indigo-500/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-radial from-cyan-500/25 via-blue-500/12 to-transparent rounded-full blur-3xl" />
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
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-32 md:pt-36 pb-12 relative z-10">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/adults/videos')}
          className="mb-4 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Videos
        </Button>

        <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-white">
          {video.title}
        </h1>

        {/* Video Player */}
        <div className="rounded-xl border-2 border-slate-200/20 dark:border-slate-700/50 shadow-2xl bg-slate-900/40 backdrop-blur">
          <div className="overflow-hidden bg-black rounded-[10px]">
            {videoSrc ? (
              <video
                className="w-full max-h-[55vh] sm:max-h-[70vh] object-contain"
                controls
                preload="auto"
                playsInline
                poster={posterSrc}
                src={videoSrc}
                onError={handleVideoError}
                ref={videoRef}
              />
            ) : (
              <div className="w-full aspect-video flex items-center justify-center bg-slate-800">
                <p className="text-white">No video source available</p>
              </div>
            )}
          </div>
        </div>

        {/* Title and stats */}
        <div className="mt-4">
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            {video.title}
          </h2>
          <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 text-sm text-cyan-100/80">
            <div className="flex items-center gap-2">
              <span>{video.views.toLocaleString()} views</span>
              <span className="hidden sm:inline">•</span>
              <span>Published {formatDate(video.created_at)}</span>
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
        <DescriptionBox description={video.full_description || video.description || ''} />

        {/* Chapters */}
        {video.chapters && video.chapters.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-semibold mb-2 text-white">Chapters</div>
            <div className="flex flex-wrap gap-2">
              {video.chapters.map((chapter, index) => (
                <button
                  key={index}
                  className="text-xs md:text-sm px-3 py-1.5 rounded-full border border-white/20 text-white hover:bg-white/10"
                  onClick={() => handleChapterClick(chapter.seconds)}
                >
                  {chapter.t} • {chapter.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hashtags */}
        {video.hashtags && video.hashtags.length > 0 && (
          <div className="mt-3 text-sm text-cyan-300 flex flex-wrap gap-3">
            {video.hashtags.map((hashtag, index) => (
              <span key={index}>#{hashtag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function DescriptionBox({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const lines = description.split('\n');
  const short = lines.slice(0, 3).join('\n');
  const hasMore = lines.length > 3;

  return (
    <div className="mt-4 rounded-xl border border-white/15 bg-white/5 backdrop-blur p-4">
      <pre className="whitespace-pre-wrap text-sm text-cyan-50/90">
        {expanded || !hasMore ? description : short}
      </pre>
      {hasMore && (
        <button
          className="mt-2 text-sm text-cyan-300 font-medium"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}

export default VideoDetail;

