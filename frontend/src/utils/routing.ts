// URL routing utilities for clean separation of concerns

export interface RouteInfo {
  type: 'home' | 'track' | 'resource' | 'myLearnings' | 'mySubmissions' | 'createTrack';
  id?: string;
}

export interface AppState {
  selectedTrackId: string | null;
  selectedResourceId: string | null;
  currentPage: "home" | "myLearnings" | "mySubmissions" | "createTrack";
}

/**
 * Creates a URL-friendly slug from a title
 */
export const createSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

/**
 * Parses the current URL and extracts route information
 */
export const parseCurrentUrl = (): RouteInfo => {
  const path = window.location.pathname;
  const segments = path.split('/').filter(Boolean);
  
  if (segments.length === 0) {
    return { type: 'home' };
  }
  
  if (segments[0] === 'track' && segments[1]) {
    // URL format: /track/{uuid} or /track/{uuid}/{slug}
    // The first segment after 'track' is always the UUID
    return { type: 'track', id: segments[1] };
  }
  
  if (segments[0] === 'resource' && segments[1]) {
    // Check if we have stored resource ID in history state
    const historyState = window.history.state;
    if (historyState && historyState.resourceId) {
      return { type: 'resource', id: historyState.resourceId };
    }
    // Fallback: treat the slug as ID (for direct URL access)
    return { type: 'resource', id: segments[1] };
  }
  
  if (segments[0] === 'my-learnings') {
    return { type: 'myLearnings' };
  }
  
  if (segments[0] === 'my-submissions') {
    return { type: 'mySubmissions' };
  }
  
  if (segments[0] === 'create-track') {
    return { type: 'createTrack' };
  }
  
  return { type: 'home' };
};

/**
 * Converts route information to app state
 */
export const routeToAppState = (route: RouteInfo): Partial<AppState> => {
  switch (route.type) {
    case 'track':
      return {
        selectedTrackId: route.id!,
        selectedResourceId: null,
        currentPage: "home"
      };
    case 'resource':
      return {
        selectedResourceId: route.id!,
        selectedTrackId: null,
        currentPage: "home"
      };
    case 'myLearnings':
      return {
        currentPage: "myLearnings",
        selectedTrackId: null,
        selectedResourceId: null
      };
    case 'mySubmissions':
      return {
        currentPage: "mySubmissions",
        selectedTrackId: null,
        selectedResourceId: null
      };
    case 'createTrack':
      return {
        currentPage: "createTrack",
        selectedTrackId: null,
        selectedResourceId: null
      };
    default:
      return {
        currentPage: "home",
        selectedTrackId: null,
        selectedResourceId: null
      };
  }
};

/**
 * Updates browser URL and history for resource navigation
 */
export const navigateToResource = (resourceId: string, resourceTitle?: string): void => {
  if (resourceTitle) {
    const slug = createSlug(resourceTitle);
    const newUrl = `/resource/${slug}`;
    window.history.pushState({ resourceId, resourceTitle }, '', newUrl);
  } else {
    // Fallback to resource ID if no title provided
    const newUrl = `/resource/${resourceId}`;
    window.history.pushState({ resourceId }, '', newUrl);
  }
};

/**
 * Updates browser URL and history for home navigation
 */
export const navigateToHome = (): void => {
  window.history.pushState({}, '', '/');
};

/**
 * Updates browser URL and history for track navigation
 * URL format: /track/{uuid} or /track/{uuid}/{slug} for SEO-friendly URLs
 */
export const navigateToTrack = (trackId: string, trackTitle?: string): void => {
  if (trackTitle) {
    const slug = createSlug(trackTitle);
    const newUrl = `/track/${trackId}/${slug}`;
    window.history.pushState({ trackId, trackTitle }, '', newUrl);
  } else {
    const newUrl = `/track/${trackId}`;
    window.history.pushState({ trackId }, '', newUrl);
  }
};

/**
 * Updates browser URL and history for page navigation
 */
export const navigateToPage = (page: string): void => {
  const pageRoutes: Record<string, string> = {
    'myLearnings': '/my-learnings',
    'mySubmissions': '/my-submissions',
    'createTrack': '/create-track'
  };
  
  const url = pageRoutes[page] || '/';
  window.history.pushState({}, '', url);
};
