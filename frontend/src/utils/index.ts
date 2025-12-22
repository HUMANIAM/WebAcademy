// ==========================================
// Utility Functions for WebAcademy Platform
// ==========================================

import { LearningType, StatusType, EnrollmentStatus, SubmissionStatus, Track } from "../types";

// ==========================================
// Type Mapping Utilities
// ==========================================

/**
 * Maps resource medium/type to standardized LearningType
 * Note: Since backend and frontend now use the same canonical values,
 * this is mostly a pass-through with fallback to "Course"
 */
export function mapToLearningType(item: string | { type?: string; resourceType?: string }): LearningType {
  if (typeof item === 'string') {
    // Canonical values: "Course", "Project", "Book", "Article & Blog", "Video & Talk"
    return (item as LearningType) || "Course";
  }
  
  // If it's a track
  if (item.type === "track") {
    return "Track";
  }
  
  // Use resourceType directly (already canonical values)
  return (item.resourceType as LearningType) || "Course";
}

/**
 * Maps enrollment status to display StatusType
 */
export function mapToStatusType(status: EnrollmentStatus): StatusType {
  return status === "completed" ? "Completed" : "In Progress";
}

/**
 * Maps submission status to display text
 * Note: Only tracks can be in "draft" status. Resources can only be "under_review", "published", or "needs_action".
 */
export function mapSubmissionStatusToDisplay(status: SubmissionStatus): string {
  const statusMap: Record<SubmissionStatus, string> = {
    draft: "Draft", // Only for tracks
    under_review: "Under Review",
    published: "Published",
    needs_action: "Needs Action",
  };
  
  return statusMap[status];
}

/**
 * Checks if a status is a submission status
 */
export function isSubmissionStatus(status: string): status is SubmissionStatus {
  return ["draft", "under_review", "published", "needs_action"].includes(status);
}

/**
 * Gets platform icon emoji based on medium type
 */
export function getPlatformIcon(medium: string): string {
  const icons: Record<string, string> = {
    video: "🎥",
    course: "📚",
    article: "📝",
    book: "📖",
    project: "🔧",
  };
  
  return icons[medium.toLowerCase()] || "📚";
}

// ==========================================
// Date Formatting Utilities
// ==========================================

/**
 * Formats date string to localized date string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

/**
 * Formats date with custom options
 */
export function formatDateCustom(
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// ==========================================
// Filtering Utilities
// ==========================================

/**
 * Checks if item matches search term
 */
export function matchesSearchTerm(
  searchTerm: string,
  searchableFields: (string | string[] | undefined)[]
): boolean {
  if (!searchTerm.trim()) return true;
  
  const searchLower = searchTerm.toLowerCase();
  
  return searchableFields.some((field) => {
    if (!field) return false;
    
    if (Array.isArray(field)) {
      return field.some((item) => item.toLowerCase().includes(searchLower));
    }
    
    return field.toLowerCase().includes(searchLower);
  });
}

/**
 * Filters items by selected options
 */
export function matchesFilter(
  itemValue: string | string[],
  selectedFilters: string[]
): boolean {
  if (selectedFilters.length === 0) return true;
  
  if (Array.isArray(itemValue)) {
    return selectedFilters.some((filter) => itemValue.includes(filter));
  }
  
  return selectedFilters.includes(itemValue);
}

// Note: resourceMatchesTrackFilter removed - resources are now independent of tracks

// ==========================================
// Data Transformation Utilities
// ==========================================

/**
 * Calculates total estimated time from resources
 */
export function calculateTotalTime(resources: any[]): string {
  const total = resources.reduce((sum, resource) => {
    const time = parseInt(resource.estimatedTime) || 0;
    return sum + time;
  }, 0);
  
  return total > 0 ? `${total} hours` : "N/A";
}

/**
 * Extracts unique values from array of objects
 */
export function extractUniqueValues<T>(
  items: T[],
  key: keyof T
): string[] {
  const values = items.map((item) => item[key]);
  return Array.from(new Set(values.flat().filter(Boolean))) as string[];
}

/**
 * Groups items by a specific key
 */
export function groupBy<T>(
  items: T[],
  key: keyof T
): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const value = String(item[key]);
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

// ==========================================
// Pagination Utilities
// ==========================================

/**
 * Calculates pagination values
 */
export function calculatePagination(
  totalItems: number,
  itemsPerPage: number,
  currentPage: number
) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  return {
    totalPages,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

/**
 * Gets items for current page
 */
export function paginateItems<T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number
): T[] {
  const { startIndex, endIndex } = calculatePagination(
    items.length,
    itemsPerPage,
    currentPage
  );
  return items.slice(startIndex, endIndex);
}

// ==========================================
// Validation Utilities
// ==========================================

/**
 * Validates if rating is valid
 */
export function isValidRating(rating: number): boolean {
  return rating >= 0 && rating <= 5;
}

/**
 * Validates if progress is valid
 */
export function isValidProgress(progress: number): boolean {
  return progress >= 0 && progress <= 100;
}

/**
 * Clamps value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ==========================================
// String Utilities
// ==========================================

/**
 * Truncates text to specified length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Capitalizes first letter of string
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Converts string to slug format
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ==========================================
// Array Utilities
// ==========================================

/**
 * Removes duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Checks if arrays are equal
 */
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
}
