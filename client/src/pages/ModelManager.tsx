import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ModelDownloadManager from '@/components/kids/ModelDownloadManager';
import { WhisperService } from '@/services/WhisperService';
import { TransformersService } from '@/services/TransformersService';

const ModelManagerPage = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    // Reinitialize services
    Promise.allSettled([
      WhisperService.initialize(),
      TransformersService.initialize()
    ]).then(() => {
      // Navigate back to Kids page
      navigate('/kids');
    });
  };

  const handleBack = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    navigate('/kids', { replace: false }); // Always return to Kids page
  };

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10 pb-20">
        {/* Header with Back Button and Title */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handleBack(e)}
            className="rounded-full flex-shrink-0 hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-transparent dark:border-gray-600 bg-transparent hover:border-gray-300 dark:hover:border-gray-500 h-10 w-10 sm:h-12 sm:w-12 p-0 transition-all hover:scale-110"
            type="button"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 dark:text-gray-100" />
          </Button>
          
          <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] bg-clip-text text-transparent px-2">
            AI Tutor Manager
          </h1>
          
          <div className="w-10 sm:w-12"></div> {/* Spacer for alignment */}
        </div>
        
        {/* Model Manager Component */}
        <ModelDownloadManager
          onComplete={handleComplete}
          userLevel="beginner"
          hideHeader={true}
        />
      </div>
    </div>
  );
};

export default ModelManagerPage;

