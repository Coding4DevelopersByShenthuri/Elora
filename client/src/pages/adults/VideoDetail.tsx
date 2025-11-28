import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronDown,
  ThumbsUp,
  Share2,
  Bookmark,
  ListPlus,
  PlayCircle,
  MessageSquare,
  Clock3,
  Sparkles,
  Dot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { VideosAPI, ChannelAPI, buildMediaUrl } from '@/services/ApiService';
import { cn } from '@/lib/utils';

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

interface EngagementState {
  counts: {
    likes: number;
    saves: number;
    playlists: number;
    shares: number;
    subscribers: number;
  };
  user_state: {
    liked: boolean;
    saved: boolean;
    playlist_name: string | null;
  };
  subscribed: boolean;
}

interface PracticeCommentItem {
  id: number;
  content: string;
  author_name: string;
  is_own: boolean;
  is_approved: boolean;
  created_at: string;
}


const VideoDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [video, setVideo] = useState<VideoLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedVideos, setRelatedVideos] = useState<VideoLesson[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [engagementState, setEngagementState] = useState<EngagementState>({
    counts: { likes: 0, saves: 0, playlists: 0, shares: 0, subscribers: 0 },
    user_state: { liked: false, saved: false, playlist_name: null },
    subscribed: false,
  });
  const [comments, setComments] = useState<PracticeCommentItem[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const refreshEngagement = async (videoSlug: string) => {
    try {
      const response = await VideosAPI.getEngagement(videoSlug);
      if (response.success && 'data' in response && response.data) {
        setEngagementState({
          counts: response.data.counts,
          user_state: response.data.user_state,
          subscribed: response.data.subscribed,
        });
      }
    } catch (err) {
      console.warn('Failed to load engagement', err);
    }
  };

  const refreshComments = async (videoSlug: string) => {
    try {
      const response = await VideosAPI.getPracticeComments(videoSlug);
      if (response.success && 'data' in response && response.data) {
        setComments(response.data.comments || []);
      }
    } catch (err) {
      console.warn('Failed to load practice comments', err);
    }
  };

  const requireAuth = (message: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: message,
      });
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!video || !requireAuth('Sign in to like this lesson.')) return;
    try {
      await VideosAPI.updateEngagement(video.slug, { action: 'like' });
      refreshEngagement(video.slug);
    } catch (err) {
      toast({ title: 'Unable to update like', description: 'Please try again.' });
    }
  };

  const handleSave = async () => {
    if (!video || !requireAuth('Sign in to save lessons for later.')) return;
    try {
      await VideosAPI.updateEngagement(video.slug, { action: 'save' });
      refreshEngagement(video.slug);
    } catch (err) {
      toast({ title: 'Unable to update save', description: 'Please try again.' });
    }
  };

  const handlePlaylist = async () => {
    if (!video || !requireAuth('Sign in to manage playlists.')) return;
    const nextName = engagementState.user_state.playlist_name ? null : 'Favorites';
    try {
      await VideosAPI.updateEngagement(video.slug, { action: 'playlist', playlist_name: nextName });
      refreshEngagement(video.slug);
    } catch (err) {
      toast({ title: 'Playlist update failed', description: 'Please try again.' });
    }
  };

  const handleShare = async () => {
    if (!video) return;
    const shareUrl = window.location.href;
    let method: 'copy_link' | 'web_share' = 'copy_link';
    let shared = false;
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description || video.title,
          url: shareUrl,
        });
        method = 'web_share';
        shared = true;
      } catch {
        // ignore and fall through to copy
      }
    }
    if (!shared) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: 'Link copied', description: 'Lesson link copied to clipboard.' });
      } catch {
        console.warn('Clipboard access denied');
      }
    }
    try {
      await VideosAPI.recordShare(video.slug, method);
      refreshEngagement(video.slug);
    } catch (err) {
      console.warn('Failed to record share', err);
    }
  };

  const handleSubscribe = async () => {
    if (!video || !requireAuth('Sign in to subscribe to Elora English.')) return;
    try {
      const response = await ChannelAPI.updateSubscription({
        channel_slug: 'elora-english',
        channel_name: 'Elora English',
        subscribe: !engagementState.subscribed,
      });
      if (response.success && 'data' in response && response.data) {
        setEngagementState((prev) => ({
          ...prev,
          subscribed: response.data.subscribed,
          counts: {
            ...prev.counts,
            subscribers: response.data.subscribers ?? prev.counts.subscribers,
          },
        }));
      }
    } catch (err) {
      toast({ title: 'Subscription failed', description: 'Please try again.' });
    }
  };

  const handleCommentSubmit = async () => {
    if (!video || !requireAuth('Sign in to post your introduction.')) return;
    if (!commentText.trim()) {
      toast({ title: 'Write a comment', description: 'Share a short introduction before posting.' });
      return;
    }
    try {
      setCommentLoading(true);
      const response = await VideosAPI.postPracticeComment(video.slug, commentText.trim());
      if (response.success && 'data' in response && response.data?.comment) {
        setComments((prev) => [response.data.comment as PracticeCommentItem, ...prev]);
        setCommentText('');
        toast({ title: 'Introduction posted', description: 'Thanks for sharing!' });
      }
    } catch (err) {
      toast({ title: 'Unable to post', description: 'Please try again.' });
    } finally {
      setCommentLoading(false);
    }
  };


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
        
        if (response.success && 'data' in response && response.data) {
          setVideo(normalizeVideo(response.data));
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

  useEffect(() => {
    const fetchRelated = async () => {
      if (!video?.category) {
        setRelatedLoading(false);
        setRelatedVideos([]);
        return;
      }
      setRelatedLoading(true);
      try {
        const response = await VideosAPI.getVideos({ category: video.category });
        
        if (response.success && 'data' in response) {
          const videosData = response.data;
          
          if (Array.isArray(videosData) && videosData.length > 0) {
            // Filter out current video and limit to 8
            const normalized = videosData
              .filter((item: any) => item.slug !== video.slug)
              .slice(0, 8)
              .map(normalizeVideo);
            setRelatedVideos(normalized);
          } else {
            setRelatedVideos([]);
          }
        } else {
          setRelatedVideos([]);
        }
      } catch (err) {
        console.error('Failed to load related videos', err);
        setRelatedVideos([]);
      } finally {
        setRelatedLoading(false);
      }
    };
    
    // Only fetch if we have a video with a category
    if (video?.category) {
      fetchRelated();
    }
  }, [video?.category, video?.slug]);

  useEffect(() => {
    if (video?.slug) {
      refreshEngagement(video.slug);
      refreshComments(video.slug);
    }
  }, [video?.slug]);

  const handleVideoError = () => {
    console.error('Video playback error', { video });
  };

  const handleChapterClick = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
  };

  const formattedHashtags = useMemo(() => {
    if (!video?.hashtags?.length) return [];
    return video.hashtags.map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));
  }, [video?.hashtags]);

  if (loading) {
    return (
      <div className="relative overflow-hidden min-h-screen flex items-center justify-center">
        <div className="text-foreground dark:text-white text-xl">Loading video...</div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="relative overflow-hidden min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-foreground dark:text-white text-xl mb-4">{error || 'Video not found'}</div>
          <Button onClick={() => navigate('/adults/videos')} className="bg-primary dark:bg-emerald-500">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Videos
          </Button>
        </div>
      </div>
    );
  }

  // Determine video source - use exact URLs from backend
  const videoSrc = video.video_file_url || video.video_url || '';
  const posterSrc = video.thumbnail_url || buildMediaUrl(video.thumbnail) || undefined;

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background Elements - Matching Adults Page */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] rounded-full bg-accent/10 blur-3xl -z-10"></div>

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 pt-24 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            {/* Back Button */}
            <div className="mb-4 sm:mb-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/adults/videos')}
                className="text-primary hover:text-primary/80 hover:bg-primary/10 text-xs sm:text-sm dark:text-emerald-300 dark:hover:text-emerald-200 dark:hover:bg-emerald-500/20"
                size="sm"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Videos</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </div>

            {/* Video Player */}
            <section className="mt-4 rounded-xl border border-primary/30 bg-card/80 backdrop-blur-xl shadow-xl dark:border-emerald-500/30 dark:bg-slate-900/60 overflow-hidden">
              <div className="relative rounded-lg bg-black overflow-hidden aspect-video">
                {videoSrc ? (
                  <video
                    className="w-full h-full object-contain bg-black"
                    controls
                    preload="auto"
                    playsInline
                    poster={posterSrc}
                    src={videoSrc}
                    onError={handleVideoError}
                    ref={videoRef}
                  >
                    <source src={videoSrc} type="video/mp4" />
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-foreground dark:bg-slate-900 dark:text-white">
                    No video source available
                  </div>
                )}
              </div>
            </section>

            {/* Video Info */}
            <section className="mt-6">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide">
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 px-3 py-1 rounded-full dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30">
                  {video.difficulty}
                </Badge>
                <div className="flex items-center gap-1 text-muted-foreground dark:text-cyan-100/70 text-sm">
                  <Clock3 className="h-4 w-4" />
                  {formatDuration(video.duration)}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground dark:text-cyan-100/70 text-sm">
                  <Sparkles className="h-4 w-4" />
                  {video.category}
                </div>
              </div>

              <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground dark:text-white leading-tight">
                {video.title}
              </h1>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground dark:text-cyan-100/80">
                <div className="flex flex-wrap items-center gap-2">
                  <span>{formatViews(video.views)} views</span>
                  <Dot className="h-4 w-4 text-muted-foreground dark:text-cyan-200" />
                  <span>Published {formatPublishedDate(video.created_at)}</span>
                  <Dot className="h-4 w-4 text-muted-foreground dark:text-cyan-200" />
                  <span>{video.speaking_exercises} speaking exercises</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    icon={ThumbsUp}
                    label="Like"
                    value={formatCount(engagementState.counts.likes)}
                    active={engagementState.user_state.liked}
                    onClick={handleLike}
                  />
                  <ActionButton
                    icon={Share2}
                    label="Share"
                    value={formatCount(engagementState.counts.shares)}
                    onClick={handleShare}
                  />
                  <ActionButton
                    icon={Bookmark}
                    label="Save"
                    value={formatCount(engagementState.counts.saves)}
                    active={engagementState.user_state.saved}
                    onClick={handleSave}
                  />
                  <ActionButton
                    icon={ListPlus}
                    label="Playlist"
                    value={formatCount(engagementState.counts.playlists)}
                    active={Boolean(engagementState.user_state.playlist_name)}
                    onClick={handlePlaylist}
                  />
                </div>
              </div>
            </section>

            {/* Channel Info */}
            <section className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-primary/30 bg-card/80 backdrop-blur-xl p-4 dark:border-emerald-500/30 dark:bg-slate-900/60">
              <div className="flex items-center gap-3">
                <img
                  src="/bg_logo.png"
                  alt="Channel"
                  className="w-12 h-12 rounded-full object-cover border border-primary/30 dark:border-emerald-500/30"
                />
                <div>
                  <div className="font-semibold text-foreground dark:text-white leading-tight">Elora English</div>
                  <div className="text-xs text-muted-foreground dark:text-cyan-100/80">42.1K subscribers</div>
                </div>
              </div>
              <div className="flex-1 sm:text-right">
                <Button
                  className={cn(
                    'rounded-full px-6 font-semibold',
                    engagementState.subscribed
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600'
                  )}
                  onClick={handleSubscribe}
                >
                  {engagementState.subscribed ? 'Subscribed' : 'Subscribe'} · {formatCount(engagementState.counts.subscribers)}
                </Button>
              </div>
            </section>

            <DescriptionBox video={video} />

            {video.chapters && video.chapters.length > 0 && (
              <ChapterList chapters={video.chapters} onJump={handleChapterClick} />
            )}

            {formattedHashtags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2 text-sm">
                {formattedHashtags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs tracking-wide dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <PracticeCorner
              comments={comments}
              value={commentText}
              onChange={setCommentText}
              onSubmit={handleCommentSubmit}
              isSubmitting={commentLoading}
              isAuthenticated={isAuthenticated}
            />
          </div>

          <aside className="w-full lg:w-80 flex-shrink-0 lg:pt-15">
            <div className="rounded-xl border border-primary/30 bg-card/80 backdrop-blur-xl p-4 dark:border-emerald-500/30 dark:bg-slate-900/60">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground dark:text-cyan-100/70">Up next</p>
                  <h3 className="text-foreground dark:text-white font-semibold text-lg">Continue the journey</h3>
                </div>
                <PlayCircle className="h-5 w-5 text-primary dark:text-emerald-300" />
              </div>
              <div className="space-y-4">
                {relatedLoading && <p className="text-sm text-muted-foreground dark:text-cyan-100/70">Loading recommendations…</p>}
                {!relatedLoading && relatedVideos.length === 0 && (
                  <p className="text-sm text-muted-foreground dark:text-cyan-100/70">More lessons coming soon.</p>
                )}
                {relatedVideos.map((item) => (
                  <RelatedVideoCard
                    key={item.id}
                    video={item}
                    onClick={() => navigate(`/adults/videos/${item.slug}`)}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

function DescriptionBox({ video }: { video: VideoLesson }) {
  const [expanded, setExpanded] = useState(false);
  const description = video.full_description || video.description || 'No description has been added yet.';
  const lines = description.split('\n');
  const short = lines.slice(0, 3).join('\n');
  const hasMore = lines.length > 3;

  return (
    <div className="mt-6 rounded-xl border border-primary/30 bg-card/80 backdrop-blur-xl p-5 space-y-4 dark:border-emerald-500/30 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground dark:text-cyan-100/80">
        <span className="font-semibold text-foreground dark:text-white">{formatViews(video.views)} views</span>
        <Dot className="h-4 w-4 text-muted-foreground dark:text-cyan-200" />
        <span>{formatPublishedDate(video.created_at)}</span>
      </div>

      <pre className="whitespace-pre-wrap text-sm text-foreground dark:text-cyan-50/90">
        {expanded || !hasMore ? description : short}
      </pre>

      {hasMore && (
        <button
          className="text-sm text-primary dark:text-emerald-300 font-medium hover:text-primary/80 dark:hover:text-emerald-200"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}

      <div className="grid sm:grid-cols-3 gap-4 text-sm text-muted-foreground dark:text-cyan-100/80">
        <DescriptionStat label="Difficulty" value={video.difficulty} />
        <DescriptionStat label="Category" value={video.category} />
        <DescriptionStat label="Speaking exercises" value={`${video.speaking_exercises}+ prompts`} />
      </div>
    </div>
  );
}

const DescriptionStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 dark:bg-emerald-500/10 dark:border-emerald-500/20">
    <p className="text-xs uppercase tracking-wide text-muted-foreground dark:text-cyan-100/60">{label}</p>
    <p className="text-foreground dark:text-white font-semibold mt-1">{value}</p>
  </div>
);

const ChapterList = ({ chapters, onJump }: { chapters: Chapter[]; onJump: (seconds: number) => void }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-6 rounded-xl border border-primary/30 bg-card/80 backdrop-blur-xl dark:border-emerald-500/30 dark:bg-slate-900/60">
      <button
        className="w-full px-5 py-4 border-b border-primary/20 dark:border-emerald-500/20 flex items-center justify-between text-foreground dark:text-white font-semibold hover:bg-primary/10 dark:hover:bg-emerald-500/10 transition-colors"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <span className="flex items-center gap-2">
          <ListPlus className="h-4 w-4" />
          Lesson Chapters
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-primary dark:text-emerald-300 transition-transform duration-200',
            expanded ? 'rotate-180' : 'rotate-0'
          )}
        />
      </button>
      {expanded && (
        <div className="divide-y divide-primary/20 dark:divide-emerald-500/20">
          {chapters.map((chapter, index) => (
            <button
              key={`${chapter.label}-${chapter.seconds}`}
              className="w-full text-left px-5 py-3 flex items-center gap-4 hover:bg-primary/10 dark:hover:bg-emerald-500/10 transition-colors"
              onClick={() => onJump(chapter.seconds)}
            >
              <div className="w-20 text-xs font-semibold text-primary dark:text-emerald-300">{chapter.t}</div>
              <div className="flex-1">
                <p className="text-foreground dark:text-white font-medium">{chapter.label}</p>
                <p className="text-xs text-muted-foreground dark:text-cyan-100/60">Milestone #{index + 1}</p>
              </div>
              <PlayCircle className="h-4 w-4 text-primary/70 dark:text-white/70" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PracticeCorner = ({
  comments,
  value,
  onChange,
  onSubmit,
  isSubmitting,
  isAuthenticated,
}: {
  comments: PracticeCommentItem[];
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isAuthenticated: boolean;
}) => (
  <div className="mt-6 rounded-xl border border-primary/30 bg-card/80 backdrop-blur-xl p-5 space-y-4 dark:border-emerald-500/30 dark:bg-slate-900/60">
    <div className="flex items-center gap-2 text-foreground dark:text-white font-semibold">
      <MessageSquare className="h-5 w-5" />
      Practice Corner
    </div>
    <p className="text-sm text-muted-foreground dark:text-cyan-100/80">
      Share your best self-introduction below and get feedback from the community.
    </p>
    <textarea
      className="w-full rounded-xl border border-primary/30 bg-card/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 dark:border-emerald-500/30 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-cyan-100/60 dark:focus:ring-emerald-400/50"
      rows={3}
      placeholder={isAuthenticated ? '"Hi, my name is … I work as …"' : 'Sign in to share your introduction'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={!isAuthenticated || isSubmitting}
    />
    <div className="flex justify-end">
      <Button
        className="rounded-full px-6 bg-primary hover:bg-primary/90 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        onClick={onSubmit}
        disabled={!isAuthenticated || !value.trim() || isSubmitting}
      >
        {isSubmitting ? 'Posting…' : 'Post introduction'}
      </Button>
    </div>
    <div className="space-y-3">
      {comments.length === 0 && (
        <p className="text-sm text-muted-foreground dark:text-cyan-100/70">Be the first to introduce yourself.</p>
      )}
      {comments.map((comment) => (
        <div key={comment.id} className="rounded-xl border border-primary/20 bg-primary/5 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-cyan-100/80">
            <span className="text-foreground dark:text-white font-semibold">
              {comment.author_name}
              {comment.is_own && ' • you'}
            </span>
            <Dot className="h-4 w-4 text-muted-foreground dark:text-cyan-200" />
            <span>{formatRelativeTime(comment.created_at)}</span>
          </div>
          <p className="text-sm text-foreground dark:text-cyan-50/90 mt-1 whitespace-pre-wrap">{comment.content}</p>
        </div>
      ))}
    </div>
  </div>
);

const RelatedVideoCard = ({ video, onClick }: { video: VideoLesson; onClick: () => void }) => {
  const thumbnailUrl = video.thumbnail_url || buildMediaUrl(video.thumbnail);

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex gap-3 hover:bg-primary/10 dark:hover:bg-emerald-500/10 rounded-xl p-2 transition-colors"
    >
      <div className="relative w-32 flex-shrink-0">
        <div className="aspect-video rounded-lg overflow-hidden bg-muted dark:bg-slate-800">
          {thumbnailUrl ? (
            <img 
              src={thumbnailUrl} 
              alt={video.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                // Try fallback if thumbnail_url failed
                if (video.thumbnail_url && video.thumbnail) {
                  target.src = buildMediaUrl(video.thumbnail) || '';
                } else {
                  target.style.display = 'none';
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground dark:text-white text-xs">No thumbnail</div>
          )}
        </div>
        <div className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-black/70 text-white">
          {formatDuration(video.duration)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground dark:text-white line-clamp-2">{video.title}</p>
        <p className="text-xs text-muted-foreground dark:text-cyan-100/70 mt-1">{formatViews(video.views)} · {video.category}</p>
      </div>
    </button>
  );
};

const ActionButton = ({
  icon: Icon,
  label,
  value,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors',
      active
        ? 'border-primary bg-primary/20 text-primary dark:border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-50'
        : 'border-primary/30 bg-card/50 text-foreground hover:bg-primary/10 dark:border-emerald-500/30 dark:bg-slate-800/50 dark:text-white dark:hover:bg-emerald-500/20'
    )}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
    {value && <span className="text-xs text-muted-foreground dark:text-emerald-200/90">{value}</span>}
  </button>
);

const formatCount = (value?: number) => {
  if (!value) return '0';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
};

const normalizeVideo = (data: any): VideoLesson => {
  // Use exact URLs from backend - serializer already provides absolute URLs when possible
  // Only build URL if it's a relative path (starts with /media/)
  const getUrl = (url: string | null | undefined, fallback: string | null | undefined = null) => {
    if (!url && !fallback) return undefined;
    const urlToUse = url || fallback;
    if (!urlToUse) return undefined;
    // If already absolute URL, use as-is
    if (urlToUse.startsWith('http://') || urlToUse.startsWith('https://')) {
      return urlToUse;
    }
    // If relative path, build full URL
    return buildMediaUrl(urlToUse);
  };

  return {
    ...data,
    thumbnail_url: getUrl(data.thumbnail_url, data.thumbnail),
    video_file_url: getUrl(data.video_file_url, data.video_file),
    video_url: data.video_url ? (data.video_url.startsWith('http') ? data.video_url : buildMediaUrl(data.video_url)) : undefined,
    tags: data.tags || [],
    chapters: data.chapters || [],
    hashtags: data.hashtags || [],
  };
};

const formatDuration = (seconds?: number) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatViews = (views?: number) => {
  if (!views) return '0 views';
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K views`;
  return `${views.toLocaleString()} views`;
};

const formatPublishedDate = (dateString?: string) => {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
};

export default VideoDetail;

