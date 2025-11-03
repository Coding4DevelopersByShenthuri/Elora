import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  UserPlus, 
  CheckCircle2, 
  Trophy, 
  BookOpen,
  Clock,
  Award,
  Activity
} from 'lucide-react';

interface Activity {
  type: string;
  title: string;
  user: string;
  timestamp: string;
  icon?: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const iconMap: Record<string, any> = {
  'user_registered': UserPlus,
  'lesson_completed': CheckCircle2,
  'achievement_unlocked': Trophy,
  'practice_session': Clock,
  'vocabulary_learned': BookOpen,
};

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = iconMap[activity.type] || Activity;
          const date = new Date(activity.timestamp);
          
          return (
            <div key={index} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <Icon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getRelativeTime(date)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

