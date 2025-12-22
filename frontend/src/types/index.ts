import { ResourceDisplay } from './resource';

// ==========================================
// BASIC TYPES
// ==========================================

// Learning Content Types
export type LearningType = "Track" | "Course" | "Book" | "Project" | "Article & blog" | "Talk & Video";
export type StatusType = "In Progress" | "Completed";
export type LevelType = "Beginner" | "Intermediate" | "Advanced";

// Status Types
export type EnrollmentStatus = "in_progress" | "completed";
export type SubmissionStatus = "draft" | "under_review" | "published" | "needs_action";
export type ActionType = "new" | "update";

// Track
export interface Track {
  id: number;
  image: string;
  trackName: string;
  description: string;
  creator: string;
  rating: number;
  level: LevelType;
  mediums: string[];
  skills: string[];
  resourceIds?: number[]; // Many-to-many: List of resource IDs in this track
  resources?: ResourceDisplay[]; // Populated/computed field (not stored)
  title?: string; // For custom tracks
  skillsList?: string[]; // For custom tracks
  estimatedTime?: string;
}

// Note: Resource interface removed - use ResourceDisplay from types/resource.ts instead

// Learning Item (My Learnings)
export interface LearningItem {
  id: number; // Numeric ID for display layer (extracted from target_id)
  targetId: string; // Full target_id from database (e.g., 'pub-resource-1', 'pub-track-1')
  title: string;
  type: "track" | "resource";
  resourceType?: string;
  platform?: string;
  status: EnrollmentStatus | SubmissionStatus;
  actionType?: ActionType; // For needs_action status: "new", "deletion", or "update"
  progress: number;
  rating: number;
  image: string;
  enrolledDate: string;
  completedDate?: string;
  skills?: string[];
  description?: string;
  author?: string;
  certificateUrl?: string;
  userId?: string; // Owner of this submission (for access control)
  isReviewAssignment?: boolean; // True if this is a review assignment (item assigned to user for review)
  // Resource-specific fields
  url?: string; // Resource URL
  level?: string; // Resource level (Beginner, Intermediate, Advanced)
  estimatedTime?: string; // Estimated time to complete
  tracks?: Array<{ id: number; name: string }>; // Tracks this resource belongs to (for resources only)
  // Track-specific fields
  resources?: ResourceDisplay[]; // Resources in this track (for track submissions)
}

// Grid Item (for combined track/resource grids)
export interface GridItem {
  itemType: "track" | "resource";
  data: Track | ResourceDisplay;
}

// Filter Types
export interface FilterState {
  selectedTrack: string[];
  selectedLevel: string[];
  selectedMedium: string[];
  selectedSkill: string[];
}

// Dropdown Props
export interface DropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  showSearch?: boolean;
  allowCustomValues?: boolean;
  // Async search props
  onSearchChange?: (query: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

// Component Props Types
export interface BaseCardProps {
  id: number;
  image: string;
  description: string;
}

export interface TrackCardProps extends BaseCardProps {
  trackName: string;
  creator: string;
  rating: number;
  onTrackSelect: (trackId: number) => void;
  onResourceSelect?: (resourceId: number) => void;
}

export interface ResourceCardProps extends BaseCardProps {
  title: string;
  type: string;
  platform: string;
  author?: string;
  rating?: number;
  onTrackSelect?: (trackId: string) => void;
  onResourceSelect?: (resourceId: string) => void;
}