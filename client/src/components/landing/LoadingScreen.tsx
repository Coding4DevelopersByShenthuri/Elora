import beeImage from '@/assets/bee.png';

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center light:bg-gradient-to-b light:from-[#d8f3dc] light:via-[#e8f8ea] light:to-white dark:bg-gradient-to-b dark:from-background dark:to-muted/30">
      <div className="relative">
        <img 
          src={beeImage} 
          alt="Loading bee" 
          className="w-50 h-50 drop-shadow-lg animate-graceful-bee-flight"
        />
      </div>
      <p className="mt-[-10px] text-muted-foreground animate-pulse text-lg">Let's Spell it Right...</p>
    </div>
  );
};
