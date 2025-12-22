import { useEffect } from 'react';
import { parseCurrentUrl, routeToAppState, AppState } from '../utils/routing';

interface UseRoutingProps {
  setSelectedTrackId: (id: string | null) => void;
  setSelectedResourceId: (id: string | null) => void;
  setCurrentPage: (page: "home" | "myLearnings" | "mySubmissions" | "createTrack") => void;
}

/**
 * Custom hook to handle URL routing and browser navigation
 * Separates routing concerns from App component
 */
export const useRouting = ({
  setSelectedTrackId,
  setSelectedResourceId,
  setCurrentPage
}: UseRoutingProps) => {
  
  // Apply route state to app state
  const applyRouteState = (routeState: Partial<AppState>, scrollToTop = true) => {
    if (routeState.selectedTrackId !== undefined) {
      setSelectedTrackId(routeState.selectedTrackId);
    }
    if (routeState.selectedResourceId !== undefined) {
      setSelectedResourceId(routeState.selectedResourceId);
    }
    if (routeState.currentPage !== undefined) {
      setCurrentPage(routeState.currentPage);
    }
    // Scroll to top when navigating to a new page
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  // Initialize state from URL on app load
  useEffect(() => {
    const route = parseCurrentUrl();
    const routeState = routeToAppState(route);
    applyRouteState(routeState);
  }, []);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const route = parseCurrentUrl();
      const routeState = routeToAppState(route);
      applyRouteState(routeState);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
};
