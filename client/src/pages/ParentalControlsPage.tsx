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
    <div className="min-h-screen pt-24 sm:pt-28">
      <div className="mx-auto max-w-7xl space-y-6 px-4 pb-20 sm:px-6 md:px-8 lg:px-10">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="group inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/60 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur-sm transition hover:border-primary/40 hover:bg-white/80 hover:text-primary-foreground dark:border-emerald-500/30 dark:bg-slate-900/70 dark:text-emerald-200 dark:hover:border-emerald-500/60 dark:hover:bg-slate-900/60"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to kids hub
          </Button>
          <div className="hidden sm:block text-sm font-semibold uppercase tracking-[0.3em] text-primary/70 dark:text-emerald-200/60">
            Parental controls
          </div>
        </div>

        <ParentalControls userId={userId} onClose={() => navigate('/kids')} />
      </div>
    </div>
  );
};

export default ParentalControlsPage;

