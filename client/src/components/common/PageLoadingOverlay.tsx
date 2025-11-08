import { useRouteLoading } from '@/contexts/RouteLoadingContext';

const PageLoadingOverlay = () => {
  const { isRouteLoading, isOffline } = useRouteLoading();

  if (!isRouteLoading) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/40 backdrop-blur-sm">
      <span className="loader" aria-label="Loading" />
      <p className="mt-6 text-sm font-semibold text-muted-foreground">
        {isOffline ? 'Trying to reconnect…' : 'Loading…'}
      </p>
    </div>
  );
};

export default PageLoadingOverlay;
