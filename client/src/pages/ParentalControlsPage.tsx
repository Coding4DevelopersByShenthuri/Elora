import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ParentalControls from '@/components/kids/ParentalControls';

const ParentalControlsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id ? String(user.id) : 'local-user';

  const handleBack = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    navigate('/kids', { replace: false });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10 pb-20">
        {/* Header with Back Button */}
        <div className="flex items-center mb-6 sm:mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handleBack(e)}
            className="rounded-full flex-shrink-0 hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 h-10 w-10 sm:h-12 sm:w-12 p-0 transition-all hover:scale-110"
            type="button"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>
        
        {/* Parental Controls Component */}
        <ParentalControls
          userId={userId}
          onClose={() => navigate('/kids')}
        />
      </div>
    </div>
  );
};

export default ParentalControlsPage;

