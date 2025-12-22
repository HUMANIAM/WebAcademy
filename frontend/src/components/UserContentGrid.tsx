import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { TrackCard } from "./TrackCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { FilterDropdown } from "./shared/FilterDropdown";
import {
  LEARNING_LEVELS,
  LEARNING_MEDIUMS,
  ITEMS_PER_PAGE,
} from "../constants";
import { useResources } from "../hooks/useResources";
import { useSkillSearch } from "../hooks/useSkillSearch";
import { useTracks } from "../hooks/useTracks";
import { toResourceDisplay, ResourceDisplay } from "../types/resource";
import { TrackReadWithResources, ResourceSummary, TrackRead } from "../types/track";
import { useDebounce } from "../hooks/useDebounce";

// Type for grid items - can be either a track or a resource
type GridItemType = 'track' | 'resource';
interface GridItem {
  type: GridItemType;
  id: string;
  title: string;
  description: string;
  image: string;
  level: string;
  estimatedTime?: string;
  skills: string[];
  platform?: string;
  resourceType?: string; // For resources
}

const levelOptions = Array.from(LEARNING_LEVELS);
const mediumOptions = Array.from(LEARNING_MEDIUMS);

interface UserContentGridProps {
  onTrackSelect: (trackId: string, trackTitle?: string) => void;
  searchTerm: string;
  onResourceSelect?: (resourceId: string) => void;
  refreshKey?: number; // Trigger refetch when this changes
}

export function UserContentGrid({ onTrackSelect, searchTerm, onResourceSelect, refreshKey }: UserContentGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [tracksWithResources, setTracksWithResources] = useState<TrackReadWithResources[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string[]>([]);
  const [selectedMedium, setSelectedMedium] = useState<string[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string[]>([]);
  
  // Debounce search term to prevent API calls on every keystroke
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  
  // Track search term that returned no results - skip fetching if user extends that search
  const noResultsSearchRef = useRef<string | null>(null);
  
  // Fetch resources from backend with pagination info
  const { resources, totalPages: resourceTotalPages, total: totalResources, loading: resourceLoading, error, listResources } = useResources();
  
  // Skill search for filter dropdown
  const { results: skillSearchResults, isLoading: skillsLoading, search: searchSkills, fetchInitial: fetchInitialSkills } = useSkillSearch();
  
  // Track names for filter dropdown and track with resources
  const { tracks, trackNames, totalTracks, totalTrackPages, getTrackNames, getTrackWithResources, listTracks, loading: trackLoading } = useTracks();
  
  // Combine selected skills with search results for dropdown options
  const skillOptions = useMemo(() => {
    return [...new Set([...selectedSkill, ...skillSearchResults])];
  }, [selectedSkill, skillSearchResults]);

  // Transform track names to dropdown options
  const trackOptions = useMemo(() => {
    return trackNames.map(track => track.title);
  }, [trackNames]);

  // Fetch tracks and resources based on current page
  const fetchContent = useCallback(async () => {
    // Skip fetch if user selected specific tracks - we use their resources instead
    if (selectedTracks.length > 0) {
      return;
    }
    
    // Skip fetch if user is extending a search that already returned no results
    if (noResultsSearchRef.current && debouncedSearchTerm?.startsWith(noResultsSearchRef.current)) {
      return;
    }
    
    const filters = {
      search: debouncedSearchTerm || undefined,
      skill: selectedSkill.length > 0 ? selectedSkill : undefined,
      level: selectedLevel.length > 0 ? selectedLevel : undefined,
    };
    
    // Always fetch both tracks and resources
    try {
      // Fetch tracks with page 1 to get all for now (we'll paginate combined)
      await listTracks({
        ...filters,
        page: 1,
        page_size: 100, // Fetch more tracks to combine with resources
      });
      
      // Always fetch resources too
      await listResources({
        ...filters,
        resource_type: selectedMedium.length > 0 ? selectedMedium : undefined,
        page: 1,
        page_size: 100, // Fetch more resources to combine with tracks
      });
    } catch (err) {
      console.error("Failed to fetch content:", err);
    }
  }, [listTracks, listResources, debouncedSearchTerm, selectedSkill, selectedLevel, selectedMedium, selectedTracks]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedSkill, selectedLevel, selectedMedium, selectedTracks]);

  // Fetch on mount, filter changes, and refreshKey
  useEffect(() => {
    fetchContent();
  }, [fetchContent, refreshKey]);
  
  // Fetch skills on mount
  useEffect(() => {
    fetchInitialSkills();
  }, [fetchInitialSkills, refreshKey]);

  // Fetch track names on mount
  useEffect(() => {
    getTrackNames();
  }, [getTrackNames, refreshKey]);

  // Convert TrackRead to GridItem format
  const trackToGridItem = (track: TrackRead): GridItem => ({
    type: 'track',
    id: track.id,
    title: track.title,
    description: track.short_description,
    image: track.image_url || '',
    level: track.level,
    estimatedTime: track.estimated_time,
    skills: track.skills,
  });

  // Convert ResourceSummary to GridItem format
  const resourceSummaryToGridItem = (resource: ResourceSummary): GridItem => ({
    type: 'resource',
    id: resource.id,
    title: resource.title,
    description: resource.short_description,
    image: resource.image_url || '',
    level: resource.level,
    estimatedTime: resource.estimated_time,
    skills: resource.skills,
    platform: resource.platform,
    resourceType: resource.type,
  });

  // Convert ResourceRead to GridItem format  
  const resourceReadToGridItem = (resource: ReturnType<typeof toResourceDisplay>): GridItem => ({
    type: 'resource',
    id: resource.id,
    title: resource.title,
    description: resource.description,
    image: resource.image || '',
    level: resource.level,
    estimatedTime: resource.estimatedTime,
    skills: resource.skills,
    platform: resource.platform,
    resourceType: resource.type,
  });

  // Transform to grid items - tracks first, then resources (or selected track resources)
  const displayItems = useMemo((): GridItem[] => {
    // Case 1: User selected specific tracks from filter
    if (selectedTracks.length > 0 && tracksWithResources.length > 0) {
      // Show track cards + their resources
      const items: GridItem[] = [];
      
      // Add track cards first
      tracksWithResources.forEach(track => {
        items.push(trackToGridItem(track));
      });
      
      // Add resources from selected tracks
      let allResources = tracksWithResources.flatMap(track => 
        track.resources.map(resourceSummaryToGridItem)
      );
      
      // Apply resource type filter to track resources
      if (selectedMedium.length > 0) {
        allResources = allResources.filter(r => 
          r.resourceType && selectedMedium.includes(r.resourceType)
        );
      }
      
      // Apply skill filter to track resources
      if (selectedSkill.length > 0) {
        allResources = allResources.filter(r => 
          r.skills.some(skill => selectedSkill.includes(skill))
        );
      }
      
      // Apply level filter to track resources
      if (selectedLevel.length > 0) {
        allResources = allResources.filter(r => 
          r.level && selectedLevel.includes(r.level)
        );
      }
      
      items.push(...allResources);
      
      // Paginate combined items
      const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
      return items.slice(startIdx, startIdx + ITEMS_PER_PAGE);
    }
    
    // Case 2: No specific track selected - apply hierarchical filtering
    let allItems: GridItem[] = [];
    
    // If resource type filter is applied, show only resources of that type
    if (selectedMedium.length > 0) {
      allItems = resources.map(toResourceDisplay).map(resourceReadToGridItem);
      
      // Apply resource type filter
      allItems = allItems.filter(r => 
        r.resourceType && selectedMedium.includes(r.resourceType)
      );
      
      // Apply skill filter if any
      if (selectedSkill.length > 0) {
        allItems = allItems.filter(r => 
          r.skills.some(skill => selectedSkill.includes(skill))
        );
      }
      
      // Apply level filter if any
      if (selectedLevel.length > 0) {
        allItems = allItems.filter(r => 
          r.level && selectedLevel.includes(r.level)
        );
      }
    } else {
      // No resource type filter - show both tracks and resources
      allItems = [
        ...tracks.map(trackToGridItem),
        ...resources.map(toResourceDisplay).map(resourceReadToGridItem)
      ];
      
      // Apply skill and level filters to both tracks and resources
      if (selectedSkill.length > 0 || selectedLevel.length > 0) {
        allItems = allItems.filter(item => {
          const matchesSkill = selectedSkill.length === 0 || 
            item.skills.some(skill => selectedSkill.includes(skill));
          const matchesLevel = selectedLevel.length === 0 || 
            (item.level && selectedLevel.includes(item.level));
          return matchesSkill && matchesLevel;
        });
      }
    }
    
    // Paginate filtered items
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return allItems.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [selectedTracks, tracksWithResources, tracks, resources, currentPage, selectedMedium, selectedSkill, selectedLevel]);

  // Calculate total pages from combined items
  const totalPages = useMemo(() => {
    if (selectedTracks.length > 0) {
      // When specific tracks selected, count track cards + their resources
      let totalItems = tracksWithResources.length;
      let resourceCount = tracksWithResources.reduce((sum, t) => sum + t.resources.length, 0);
      
      // Apply filters to resource count
      if (selectedMedium.length > 0 || selectedSkill.length > 0 || selectedLevel.length > 0) {
        resourceCount = tracksWithResources.flatMap(t => t.resources).filter(r => {
          const matchesMedium = selectedMedium.length === 0 || selectedMedium.includes(r.type);
          const matchesSkill = selectedSkill.length === 0 || r.skills.some(s => selectedSkill.includes(s));
          const matchesLevel = selectedLevel.length === 0 || selectedLevel.includes(r.level);
          return matchesMedium && matchesSkill && matchesLevel;
        }).length;
      }
      
      totalItems += resourceCount;
      return Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    }
    
    // Case 2: No specific track selected - calculate based on filtering
    let totalItems = 0;
    
    // If resource type filter is applied, count only filtered resources
    if (selectedMedium.length > 0) {
      let filteredResources = resources.map(toResourceDisplay);
      
      // Apply resource type filter
      filteredResources = filteredResources.filter(r => 
        r.type && selectedMedium.includes(r.type)
      );
      
      // Apply skill filter if any
      if (selectedSkill.length > 0) {
        filteredResources = filteredResources.filter(r => 
          r.skills.some(skill => selectedSkill.includes(skill))
        );
      }
      
      // Apply level filter if any
      if (selectedLevel.length > 0) {
        filteredResources = filteredResources.filter(r => 
          r.level && selectedLevel.includes(r.level)
        );
      }
      
      totalItems = filteredResources.length;
    } else {
      // No resource type filter - count both tracks and resources with filters
      let filteredTracks = tracks;
      let filteredResources = resources.map(toResourceDisplay);
      
      // Apply skill and level filters to both tracks and resources
      if (selectedSkill.length > 0 || selectedLevel.length > 0) {
        filteredTracks = filteredTracks.filter(track => {
          const matchesSkill = selectedSkill.length === 0 || 
            track.skills.some(skill => selectedSkill.includes(skill));
          const matchesLevel = selectedLevel.length === 0 || 
            selectedLevel.includes(track.level);
          return matchesSkill && matchesLevel;
        });
        
        filteredResources = filteredResources.filter(resource => {
          const matchesSkill = selectedSkill.length === 0 || 
            resource.skills.some(skill => selectedSkill.includes(skill));
          const matchesLevel = selectedLevel.length === 0 || 
            (resource.level && selectedLevel.includes(resource.level));
          return matchesSkill && matchesLevel;
        });
      }
      
      totalItems = filteredTracks.length + filteredResources.length;
    }
    
    return Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  }, [selectedTracks, tracksWithResources, tracks, resources, selectedMedium, selectedSkill, selectedLevel]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterToggle = (
    selected: string[],
    setter: (value: string[]) => void,
    value: string
  ) => {
    if (selected.includes(value)) {
      setter(selected.filter((item) => item !== value));
    } else {
      setter([...selected, value]);
    }
  };

  // Handle track selection - fetch tracks with resources
  const handleTrackToggle = useCallback(async (trackTitle: string) => {
    if (selectedTracks.includes(trackTitle)) {
      // Remove track from selection
      const newSelectedTracks = selectedTracks.filter(t => t !== trackTitle);
      setSelectedTracks(newSelectedTracks);
      // Remove track from resources
      setTracksWithResources(prev => prev.filter(track => track.title !== trackTitle));
    } else {
      // Add track to selection and fetch its resources
      const newSelectedTracks = [...selectedTracks, trackTitle];
      setSelectedTracks(newSelectedTracks);
      
      const track = trackNames.find(t => t.title === trackTitle);
      if (track) {
        try {
          const trackData = await getTrackWithResources(track.id);
          setTracksWithResources(prev => [...prev, trackData]);
        } catch (err) {
          console.error("Failed to fetch track resources:", err);
        }
      }
    }
  }, [selectedTracks, trackNames, getTrackWithResources]);

  const hasFilters = debouncedSearchTerm || selectedTracks.length > 0 || selectedLevel.length > 0 || selectedMedium.length > 0 || selectedSkill.length > 0;

  return (
    <div className="container mx-auto px-4 py-12 min-h-[600px]">
      <h2 className="mb-6 text-center font-bold">Explore Your Next Learning Journey</h2>

      {/* Filter Options */}
      <div className="bg-gray-50 border-b mb-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <FilterDropdown
              label="Track"
              options={trackOptions}
              selected={selectedTracks}
              onToggle={handleTrackToggle}
              showSearch={true}
              mode="multi"
            />
            <FilterDropdown
              label="Skill"
              options={skillOptions}
              selected={selectedSkill}
              onToggle={(value) => handleFilterToggle(selectedSkill, setSelectedSkill, value)}
              showSearch={true}
              mode="multi"
              onSearchChange={searchSkills}
              isLoading={skillsLoading}
            />
            <FilterDropdown
              label="Level"
              options={levelOptions}
              selected={selectedLevel}
              onToggle={(value) => handleFilterToggle(selectedLevel, setSelectedLevel, value)}
              mode="multi"
            />
            <FilterDropdown
              label="Resource Type"
              options={mediumOptions}
              selected={selectedMedium}
              onToggle={(value) => handleFilterToggle(selectedMedium, setSelectedMedium, value)}
              mode="multi"
            />
          </div>  
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">Error loading resources: {error}</p>
        </div>
      )}

      {/* Grid - always render to maintain layout stability */}
      {!error && (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 ${(resourceLoading || trackLoading) ? 'opacity-50' : ''}`}>
          {displayItems.map((item) => (
            item.type === 'track' ? (
              <TrackCard
                key={`track-${item.id}`}
                id={item.id}
                trackName={item.title}
                description={item.description}
                image={item.image}
                creator=""
                rating={0}
                level={item.level}
                estimatedTime={item.estimatedTime}
                skills={item.skills}
                onTrackSelect={onTrackSelect}
              />
            ) : (
              <TrackCard
                key={`resource-${item.id}`}
                id={item.id}
                title={item.title}
                description={item.description}
                image={item.image}
                type={item.resourceType || 'Course'}
                level={item.level}
                estimatedTime={item.estimatedTime}
                skills={item.skills}
                platform={item.platform || 'Other'}
                onResourceSelect={onResourceSelect}
              />
            )
          ))}
        </div>
      )}

      {/* No Results Message */}
      {displayItems.length === 0 && !(resourceLoading || trackLoading) && !error && (
        <div className="text-center py-12">
          {hasFilters ? (
            <p className="text-gray-500">No items match your current filters. Try adjusting your selections.</p>
          ) : (
            <p className="text-gray-500">No learning resources available yet. Check back soon!</p>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                size="default"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                }
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    size="default"
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                size="default"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
