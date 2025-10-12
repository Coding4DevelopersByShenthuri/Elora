import { Users, Sparkles, GitBranch, MessageSquare } from 'lucide-react';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { Button } from '@/components/ui/button';
interface CommunitySectionProps {
  show: boolean;
}
export const CommunitySection = ({
  show
}: CommunitySectionProps) => {
  const communityMembers = [{
    name: "Alex Thompson",
    role: "Data Scientist",
    avatar: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%234BB6B7' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='40' font-family='Arial'%3EAT%3C/text%3E%3C/svg%3E`,
    contribution: "Knowledge Graph Algorithms"
  }, {
    name: "Mira Chen",
    role: "Professor",
    avatar: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%2328CACD' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='40' font-family='Arial'%3EMC%3C/text%3E%3C/svg%3E`,
    contribution: "Educational Templates"
  }, {
    name: "Jason Wright",
    role: "Product Designer",
    avatar: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23022A2D' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='40' font-family='Arial'%3EJW%3C/text%3E%3C/svg%3E`,
    contribution: "UI Components"
  }, {
    name: "Sophia Kim",
    role: "Researcher",
    avatar: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23143C3D' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='40' font-family='Arial'%3ESK%3C/text%3E%3C/svg%3E`,
    contribution: "Citation System"
  }, {
    name: "Marcus Jones",
    role: "Student",
    avatar: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%236be1f9' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='40' font-family='Arial'%3EMJ%3C/text%3E%3C/svg%3E`,
    contribution: "Study Guides"
  }];
  const forums = [{
    title: "Research Methodology Templates",
    replies: 42,
    views: 1256,
    category: "Templates"
  }, {
    title: "Best practices for literature notes",
    replies: 36,
    views: 982,
    category: "Workflows"
  }, {
    title: "Automated tagging strategies",
    replies: 28,
    views: 874,
    category: "Automation"
  }];
  return <AnimatedTransition show={show} animation="slide-up" duration={600}>
      <div className="mt-24 mb-16">
        
        
        
        
        
      </div>
    </AnimatedTransition>;
};