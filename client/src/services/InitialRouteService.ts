/**
 * Initial Route Service
 * 
 * Tracks the initial page the user was routed to after completing the survey.
 * This is used to determine if eligibility checks are needed when accessing other pages.
 */

export type InitialRoute = 
  | '/kids/young'
  | '/kids/teen'
  | '/adults/beginners'
  | '/adults/intermediates'
  | '/adults/advanced'
  | '/ielts-pte';

class InitialRouteServiceClass {
  private readonly STORAGE_KEY = 'speakbee_initial_route';

  /**
   * Set the initial route (called after survey completion)
   */
  setInitialRoute(route: InitialRoute): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, route);
      console.log(`✅ Initial route set to: ${route}`);
    } catch (error) {
      console.error('Error setting initial route:', error);
    }
  }

  /**
   * Get the initial route
   */
  getInitialRoute(): InitialRoute | null {
    try {
      const route = localStorage.getItem(this.STORAGE_KEY);
      return route as InitialRoute | null;
    } catch (error) {
      console.error('Error getting initial route:', error);
      return null;
    }
  }

  /**
   * Clear the initial route (for testing or reset)
   */
  clearInitialRoute(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing initial route:', error);
    }
  }

  /**
   * Check if a page is at a higher level than the initial route
   * Returns true if the target page requires unlocking
   */
  requiresEligibilityCheck(targetPage: InitialRoute): boolean {
    const initialRoute = this.getInitialRoute();
    
    // If no initial route is set, allow access (backward compatibility)
    if (!initialRoute) {
      return false;
    }

    // Define page hierarchy (lower number = lower level)
    const pageHierarchy: Record<InitialRoute, number> = {
      '/kids/young': 1,
      '/kids/teen': 2,
      '/adults/beginners': 1,
      '/adults/intermediates': 2,
      '/adults/advanced': 3,
      '/ielts-pte': 4,
    };

    const initialLevel = pageHierarchy[initialRoute] || 0;
    const targetLevel = pageHierarchy[targetPage] || 0;

    // Only check eligibility if:
    // 1. Target page is in the same category (kids or adults)
    // 2. Target page is at a higher level than initial route
    const isSameCategory = 
      (initialRoute.startsWith('/kids') && targetPage.startsWith('/kids')) ||
      (initialRoute.startsWith('/adults') && targetPage.startsWith('/adults'));

    if (isSameCategory && targetLevel > initialLevel) {
      return true;
    }

    // If accessing a different category or lower level, no eligibility check needed
    return false;
  }

  /**
   * Check if user can access a page without eligibility check
   * (i.e., if it's the same or lower level than initial route)
   */
  canAccessWithoutCheck(targetPage: InitialRoute): boolean {
    return !this.requiresEligibilityCheck(targetPage);
  }
}

export const InitialRouteService = new InitialRouteServiceClass();
export default InitialRouteService;

