// ==========================================
// Constants for WebAcademy Platform
// ==========================================

// Pagination
export const ITEMS_PER_PAGE = 9;

// Learning Levels
export const LEARNING_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

/** 
 * Valid resource types - same values used in backend and frontend.
 * No mapping needed - these are the canonical values.
 */
export const RESOURCE_TYPES = [
  "Course",
  "Project", 
  "Book",
  "Article & Blog",
  "Video & Talk",
] as const;

// Alias for backward compatibility
export const LEARNING_MEDIUMS = RESOURCE_TYPES;

// Resource Categories for filtering
export const RESOURCE_CATEGORIES = ["All", ...RESOURCE_TYPES] as const;

// Status Types
export const STATUS_TYPES = {
  ENROLLED: "enrolled",
  COMPLETED: "completed",
  IN_PROGRESS: "In Progress",
  COMPLETED_DISPLAY: "Completed",
} as const;

// Badge Colors
export const BADGE_COLORS = {
  TRACK: "bg-blue-600 text-white hover:bg-blue-700",
  COMPLETED: "bg-green-100 text-green-700 hover:bg-green-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 hover:bg-blue-200",
} as const;

// Filter Labels
export const FILTER_LABELS = {
  TRACK: "Track",
  LEVEL: "Level",
  LEARNING_MEDIUM: "Resource",
  SKILL: "Skill",
  TRACKS: "Tracks",
} as const;

// Placeholder Text
export const PLACEHOLDERS = {
  SEARCH_TRACK: "Type Track",
  SEARCH_SKILL: "Type Skill",
  SEARCH_RESOURCE: "Search resources...",
  NO_LEARNINGS: "No learnings found",
  NO_LEARNINGS_MESSAGE: "Try adjusting your filters or start a new learning journey!",
} as const;

// Routes / Pages
export const PAGES = {
  HOME: "home",
  MY_LEARNINGS: "myLearnings",
  CREATE_TRACK: "createTrack",
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  USER: "user",
} as const;

// Type Guards
export function isTrack(item: any): boolean {
  return 'trackName' in item;
}

export function isResource(item: any): boolean {
  return 'type' in item && item.type !== undefined && !('trackName' in item);
}