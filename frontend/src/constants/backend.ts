// Backend validation constants (matching backend validators)

// Track levels
export const TRACK_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;

export type TrackLevel = typeof TRACK_LEVELS[number];

// Resource levels (same as track levels)
export const RESOURCE_LEVELS = TRACK_LEVELS;

export type ResourceLevel = TrackLevel;

// Resource platforms
export const RESOURCE_PLATFORMS = ['Udemy', 'Coursera', 'Other'] as const;

export type ResourcePlatform = typeof RESOURCE_PLATFORMS[number];

// Resource types
export const RESOURCE_TYPES = ['Course', 'Project', 'Book', 'Article & Blog', 'Video & Talk'] as const;

export type ResourceType = typeof RESOURCE_TYPES[number];

// Funding types
export const FUNDING_TYPES = ['gift_code', 'reimbursement', 'virtual_card', 'org_subscription'] as const;

export type FundingType = typeof FUNDING_TYPES[number];

// Default values
export const DEFAULT_TRACK_IMAGE_URL = 'https://placehold.co/600x400?text=Learning+Track';
export const DEFAULT_RESOURCE_IMAGE_URL = 'https://placehold.co/600x400?text=Learning+Resource';

// API endpoints
export const API_ENDPOINTS = {
  TRACKS: '/tracks',
  RESOURCES: '/resources',
  SKILLS: '/skills',
} as const;