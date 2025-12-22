/**
 * Track Helper Utilities
 * 
 * Helper functions for track-related operations
 * 
 * NOTE: This file is deprecated. Most functionality should use TrackRepository instead.
 * Keeping minimal functions for backwards compatibility during transition.
 */

import { Resource } from "../repositories/ResourceRepository";

/**
 * Get all resources that belong to a specific track
 * Checks both trackId (primary) and trackIds (many-to-many)
 * 
 * @deprecated Use TrackRepository.getTrackById() to get track with resources instead
 */
export function getResourcesForTrack(trackId: number, allResources: Resource[]): Resource[] {
  return allResources.filter(resource => {
    // Check if this track is the primary track
    if (resource.trackId === trackId) return true;
    
    // Check if this track is in the trackIds array
    if (resource.trackIds && resource.trackIds.includes(trackId)) return true;
    
    return false;
  });
}

/**
 * Get all track IDs that a resource belongs to
 * 
 * @deprecated This function is part of legacy code and should be refactored
 */
export function getTrackIdsForResource(resource: Resource): number[] {
  const trackIds = new Set<number>();
  
  // Add primary track
  trackIds.add(resource.trackId);
  
  // Add all trackIds
  if (resource.trackIds) {
    resource.trackIds.forEach(id => trackIds.add(id));
  }
  
  return Array.from(trackIds);
}
