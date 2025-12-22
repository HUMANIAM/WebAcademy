/**
 * Hierarchical Filtering System
 * 
 * Implements strict hierarchical filtering with the following pipeline:
 * Tracks → Resources → Skills
 * 
 * Rules:
 * - Each filter narrows the result set from the previous filter
 * - No filter can expand or override a higher-level filter
 * - Higher-level filters always win over lower-level filters
 * - Invalid selections are automatically cleared
 */

import { Track, GridItem } from "../types";
import { ResourceDisplay } from "../types/resource";

export interface FilterCriteria {
  searchTerm: string;
  selectedTracks: string[];
  selectedResourceTypes: string[];
  selectedSkills: string[];
  selectedLevels: string[];
}

export interface FilterResult {
  items: GridItem[];
  clearedFilters: {
    tracks?: boolean;
    resourceTypes?: boolean;
    skills?: boolean;
  };
}

/**
 * Main hierarchical filtering function
 * Applies filters in strict order: Tracks → Resources → Skills
 */
export function filterContent(
  allTracks: Track[],
  allResources: ResourceDisplay[],
  criteria: FilterCriteria
): FilterResult {
  const {
    searchTerm,
    selectedTracks,
    selectedResourceTypes,
    selectedSkills,
    selectedLevels,
  } = criteria;

  const clearedFilters: FilterResult['clearedFilters'] = {};
  const items: GridItem[] = [];

  // STEP 1: Apply Track Filter (highest priority)
  let validTracks = allTracks;
  let validResources = allResources;
  if (selectedTracks.length > 0) {
    // Filter tracks to only selected ones
    validTracks = validTracks.filter(track =>
      selectedTracks.includes(track.trackName)
    );
    // Note: Resources are no longer filtered by track - they are independent
  }

  // STEP 2: Apply Resource Type Filter
  if (selectedResourceTypes.length > 0 && !clearedFilters.tracks) {
    // Validate that resource types are available in the current dataset
    const availableTypes = new Set(validResources.map(r => r.type));
    const invalidTypes = selectedResourceTypes.filter(
      type => !availableTypes.has(type)
    );

    if (invalidTypes.length === selectedResourceTypes.length) {
      // All selected types are invalid, clear the filter
      clearedFilters.resourceTypes = true;
    } else {
      // Filter resources by type
      validResources = validResources.filter(resource =>
        selectedResourceTypes.includes(resource.type)
      );

      // Remove tracks from display when resource type is selected
      validTracks = [];
    }
  }

  // STEP 3: Apply Level Filter
  if (selectedLevels.length > 0) {
    // Filter tracks by level
    validTracks = validTracks.filter(track =>
      selectedLevels.includes(track.level)
    );

    // Filter resources by level
    validResources = validResources.filter(resource =>
      selectedLevels.includes(resource.level)
    );
  }

  // STEP 4: Apply Skill Filter (lowest priority)
  if (selectedSkills.length > 0 && !clearedFilters.resourceTypes) {
    // Skills filter resources only, not tracks
    const originalResourceCount = validResources.length;
    const selectedSkillsLower = selectedSkills.map(s => s.toLowerCase());
    
    validResources = validResources.filter(resource =>
      selectedSkillsLower.some(skill => 
        resource.skills.some((rs: string) => rs.toLowerCase() === skill)
      )
    );

    // Filter tracks by skills
    if (validTracks.length > 0) {
      validTracks = validTracks.filter(track =>
        selectedSkillsLower.some(skill => 
          track.skills.some(ts => ts.toLowerCase() === skill)
        )
      );
    }

    // Don't auto-clear skills filter - let user see "no matches" message
    // This is better UX than silently clearing their selection
  }

  // STEP 6: Apply Search Term (orthogonal to hierarchy)
  if (searchTerm.trim() !== "") {
    const searchLower = searchTerm.toLowerCase();

    validTracks = validTracks.filter(track => {
      const matchesTrack =
        track.trackName.toLowerCase().includes(searchLower) ||
        track.description.toLowerCase().includes(searchLower) ||
        track.skills.some(skill => skill.toLowerCase().includes(searchLower));

      const matchesResources = track.resources?.some(resource =>
        resource.title.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower) ||
        resource.skills.some(skill => skill.toLowerCase().includes(searchLower)) ||
        resource.type.toLowerCase().includes(searchLower)
      );

      return matchesTrack || !!matchesResources;
    });

    validResources = validResources.filter(resource => {
      return (
        resource.title.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower) ||
        resource.skills.some(skill => skill.toLowerCase().includes(searchLower)) ||
        resource.type.toLowerCase().includes(searchLower)
      );
    });
  }

  // Build result set
  // If resource type filter is active, show only resources
  if (selectedResourceTypes.length > 0 && !clearedFilters.resourceTypes) {
    validResources.forEach(resource => {
      items.push({ itemType: "resource", data: resource });
    });
  } else {
    // Show tracks first, then standalone resources grouped by type
    validTracks.forEach(track => {
      items.push({ itemType: "track", data: track });
    });

    // Add resources grouped by type
    const resourcesByType: Record<string, ResourceDisplay[]> = {
      "Course": [],
      "Book": [],
      "Project": [],
      "Article & blog": [],
      "Talk & Video": []
    };

    validResources.forEach(resource => {
      if (resourcesByType[resource.type]) {
        resourcesByType[resource.type].push(resource);
      }
    });

    // Add resources in order
    ["Course", "Book", "Project", "Article & blog", "Talk & Video"].forEach(type => {
      resourcesByType[type].forEach(resource => {
        items.push({ itemType: "resource", data: resource });
      });
    });
  }

  return { items, clearedFilters };
}

/**
 * Get available options for a filter based on current selections
 * This helps disable invalid options in the UI
 */
export function getAvailableFilterOptions(
  allTracks: Track[],
  allResources: ResourceDisplay[],
  currentCriteria: FilterCriteria
): {
  tracks: Set<string>;
  resourceTypes: Set<string>;
  skills: Set<string>;
  levels: Set<string>;
} {
  // Apply filters up to the current level to see what's available
  const { selectedTracks } = currentCriteria;

  let validTracks = allTracks;
  let validResources = allResources;

  // After track filter
  if (selectedTracks.length > 0) {
    validTracks = validTracks.filter(track =>
      selectedTracks.includes(track.trackName)
    );
    // Note: Resources are independent of tracks
  }

  return {
    tracks: new Set(validTracks.map(t => t.trackName)),
    resourceTypes: new Set(validResources.map(r => r.type)),
    skills: new Set(validResources.flatMap(r => r.skills)),
    levels: new Set([
      ...validTracks.map(t => t.level),
      ...validResources.map(r => r.level)
    ]),
  };
}
