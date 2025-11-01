export const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center light:bg-gradient-to-b light:from-[#d8f3dc] light:via-[#e8f8ea] light:to-white dark:bg-gradient-to-b dark:from-background dark:to-muted/30">
      <div className="relative">
        <span className="loader"></span>
      </div>
      <p className="mt-8 text-muted-foreground text-lg">Spell it right..</p>
    </div>
  );
};
