import { useEffect } from 'react';

/**
 * Analytics Component
 * Integrates Google Analytics and Microsoft Clarity tracking
 */
export function Analytics() {
  useEffect(() => {
    // Google Analytics 4
    const gaId = import.meta.env.VITE_GA_ID;
    if (gaId) {
      // Load Google Analytics script
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `;
      document.head.appendChild(script2);

      // Track page views
      const trackPageView = () => {
        if (window.gtag) {
          window.gtag('config', gaId, {
            page_path: window.location.pathname,
          });
        }
      };

      // Track initial page view
      trackPageView();

      // Track subsequent page views (for SPA)
      window.addEventListener('popstate', trackPageView);
      
      return () => {
        window.removeEventListener('popstate', trackPageView);
      };
    }

    // Microsoft Clarity
    const clarityId = import.meta.env.VITE_CLARITY_ID;
    if (clarityId) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${clarityId}");
      `;
      document.head.appendChild(script);
    }
  }, []);

  return null;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

