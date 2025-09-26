import { BrainCircuit, Search, FileText, LinkIcon, Database, Network, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedTransition } from '@/components/AnimatedTransition';

interface FeatureSectionProps {
  showFeatures: boolean;
}

export const FeatureSection = ({ showFeatures }: FeatureSectionProps) => {
  const features = [
    {
      icon: <BrainCircuit size={20} className="sm:size-6" />,
      title: "Neural Connections",
      description: "Build meaningful connections between your notes, files, and ideas with our visual network view.",
      color: "from-blue-400/60 to-blue-600/40"
    },
    {
      icon: <Search size={20} className="sm:size-6" />,
      title: "Smart Search",
      description: "Find anything instantly with our AI-powered semantic search that understands context and meaning.",
      color: "from-purple-400/60 to-purple-600/40"
    },
    {
      icon: <FileText size={20} className="sm:size-6" />,
      title: "Rich Content",
      description: "Store notes, links, files, images, and projects in one unified knowledge system.",
      color: "from-green-400/60 to-green-600/40"
    },
    {
      icon: <LinkIcon size={20} className="sm:size-6" />,
      title: "Automatic Linking",
      description: "Our AI suggests connections between related content to build your knowledge graph organically.",
      color: "from-amber-400/60 to-amber-600/40"
    },
    {
      icon: <Database size={20} className="sm:size-6" />,
      title: "Multi-source Import",
      description: "Import content from various sources including notes apps, bookmarks, and more.",
      color: "from-rose-400/60 to-rose-600/40"
    },
    {
      icon: <Network size={20} className="sm:size-6" />,
      title: "Visual Thinking",
      description: "Visualize your thoughts and connections in an interactive knowledge graph.",
      color: "from-indigo-400/60 to-indigo-600/40"
    }
  ];

  return (
    <AnimatedTransition show={showFeatures} animation="slide-up" duration={600}>
      <div className="mt-12 sm:mt-16 lg:mt-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <div className="inline-flex items-center justify-center p-1 bg-muted rounded-lg sm:rounded-xl mb-3 sm:mb-4">
            <div className="bg-background px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg shadow-sm">
              <Sparkles size={18} className="sm:size-5 inline-block mr-2 text-primary" />
              <span className="font-semibold text-sm sm:text-base">Key Features</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2 leading-tight">
            Everything you need to expand your mind
          </h2>
          <p className="text-muted-foreground mt-2 sm:mt-3 max-w-xs sm:max-w-sm md:max-w-2xl mx-auto text-sm sm:text-base leading-relaxed px-4">
            Discover how our digital second brain transforms the way you capture, connect, and recall information.
          </p>
        </div>
        
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="border bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] sm:hover:translate-y-[-4px] group">
              <div className={`h-1 w-full bg-gradient-to-r ${feature.color}`} />
              <CardHeader className="p-4 sm:p-6">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br ${feature.color} shadow-sm group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <CardTitle className="mt-3 sm:mt-4 text-lg sm:text-xl group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AnimatedTransition>
  );
};