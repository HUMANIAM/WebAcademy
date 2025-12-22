import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { BookOpen } from "lucide-react";
import { BaseLearningCard } from "./BaseLearningCard";
import { FilterDropdown } from "./shared/FilterDropdown";
import { LearningType, StatusType, LearningItem } from "../types";
import { mapToLearningType, mapToStatusType, mapSubmissionStatusToDisplay, isSubmissionStatus } from "../utils";
import { toast } from "sonner@2.0.3";
import { ConfigurableAlertDialog } from "./shared/AlertDialog";

interface StatusOption {
  value: string;
  label: string;
}

interface UserContentPageProps {
  pageTitle: string;
  statusOptions: StatusOption[];
  data: LearningItem[];
  onTrackSelect: (trackId: string, trackTitle?: string) => void;
  onResourceSelect: (resourceId: string) => void;
  onEditTrack?: (trackId: string) => void; // Optional for My Submissions only
  onDeleteDraft?: (draftId: string) => void; // Optional for My Submissions only
  searchTerm: string;
  emptyStateMessage?: string;
  emptyStateDescription?: string;
  initialStatusFilter?: string; // Optional initial status filter
  isLoading?: boolean; // Loading state
  onStatusChange?: (status: string) => void; // Callback when status filter changes
  statusCounts?: Record<string, number>; // Pre-calculated status counts
}

export function UserContentPage({
  pageTitle,
  statusOptions,
  data,
  onTrackSelect,
  onResourceSelect,
  onEditTrack,
  onDeleteDraft,
  searchTerm,
  emptyStateMessage = "No items found",
  emptyStateDescription = "Try adjusting your filters or start a new journey!",
  initialStatusFilter,
  isLoading = false,
  onStatusChange,
  statusCounts,
}: UserContentPageProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatusFilter || (statusOptions.length > 0 ? statusOptions[0].value : 'all'));
  
  // Notify parent when status changes
  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };
  const [selectedTrackIds, setSelectedTrackIds] = useState<number[]>([]);
  const [selectedMedium, setSelectedMedium] = useState<string[]>([]);
  
  // Get unique track options from data (actual user's tracks)
  const trackOptions = data
    .filter(item => item.type === "track")
    .map(item => ({ id: item.id, title: item.title }));
  
  // Get unique resource types from data (actual user's resource types)
  const userMediumOptions = Array.from(
    new Set(
      data
        .filter(item => item.type === "resource" && item.resourceType)
        .map(item => item.resourceType!)
    )
  ).sort();

  // Update selected status when initialStatusFilter changes
  useEffect(() => {
    if (initialStatusFilter) {
      setSelectedStatus(initialStatusFilter);
    }
  }, [initialStatusFilter]);
  


  // Calculate counts for each status
  const getStatusCount = (statusValue: string) => {
    // If pre-calculated counts are provided, use them (prevents recalculating from filtered data)
    if (statusCounts && statusCounts[statusValue] !== undefined) {
      return statusCounts[statusValue];
    }
    
    // Fallback: calculate from current data (for backward compatibility)
    if (statusValue === "all") {
      // Exclude draft resources from "all" count (only tracks can be drafts)
      return data.filter(item => !(item.status === "draft" && item.type !== "track")).length;
    }
    // For draft status, only count tracks (resources can't be drafts)
    if (statusValue === "draft") {
      return data.filter(item => item.status === statusValue && item.type === "track").length;
    }
    return data.filter(item => item.status === statusValue).length;
  };

  // NOTE: All filtering (status, search, track, resourceType) is done at the database level
  // The data prop already contains pre-filtered and paginated items from the backend

  const handleItemClick = (item: LearningItem) => {
    // For draft items, navigate to edit page if handler is provided
    if (item.status === "draft" && onEditTrack) {
      onEditTrack(item.targetId);
      return;
    }
    
    // Don't allow navigation for draft items without edit handler
    if (item.status === "draft") {
      toast.info("Draft items cannot be viewed yet.");
      return;
    }
    
    if (item.type === "track") {
      onTrackSelect(item.targetId);
    } else {
      onResourceSelect(item.targetId);
    }
  };

  const handleEdit = (item: LearningItem) => {
    // For tracks (any status: draft, under_review, published), use the onEditTrack handler if provided
    if (item.type === "track" && onEditTrack) {
      onEditTrack(item.targetId);
      return;
    }
    
    // Resources cannot be edited after submission - only during track creation
    toast.info("Resources can only be edited during track creation.");
  };

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<LearningItem | null>(null);

  
  const handleDeleteClick = (item: LearningItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete && onDeleteDraft) {
      onDeleteDraft(itemToDelete.id.toString());
      toast.success(`Draft "${itemToDelete.title}" has been deleted.`);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page Title & Filters */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="mb-6">{pageTitle}</h1>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 items-center">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedStatus === option.value ? "default" : "outline"}
                onClick={() => handleStatusChange(option.value)}
              >
                {option.label} ({getStatusCount(option.value)})
              </Button>
            ))}
            
            <div className="flex-1"></div>
            
            {/* Track Selection Dropdown */}
            <FilterDropdown
              label="Track"
              options={trackOptions.map(t => t.title)}
              selected={trackOptions.filter(t => selectedTrackIds.includes(t.id)).map(t => t.title)}
              onToggle={(value) => {
                const track = trackOptions.find(t => t.title === value);
                if (track) {
                  if (selectedTrackIds.includes(track.id)) {
                    setSelectedTrackIds(selectedTrackIds.filter((id) => id !== track.id));
                  } else {
                    setSelectedTrackIds([...selectedTrackIds, track.id]);
                  }
                }
              }}
              showSearch={true}
              mode="multi"
            />

            {/* Resources (Medium) Dropdown */}
            <FilterDropdown
              label="Resources"
              options={userMediumOptions}
              selected={selectedMedium}
              onToggle={(value) => {
                if (selectedMedium.includes(value)) {
                  setSelectedMedium(selectedMedium.filter((item) => item !== value));
                } else {
                  setSelectedMedium([...selectedMedium, value]);
                }
              }}
              mode="multi"
            />
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((item) => {
              // Map resource type to LearningType
              const learningType: LearningType = mapToLearningType(item);

              // Determine status display based on status type
              let statusType: StatusType | undefined = undefined;
              let statusText: string | undefined = undefined;

              if (isSubmissionStatus(item.status)) {
                // For submission statuses, use custom text with actionType
                statusText = mapSubmissionStatusToDisplay(item.status as any, item.actionType);
              } else {
                // For enrollment statuses, use the standard mapping
                statusType = mapToStatusType(item.status as any);
              }

              return (
                <BaseLearningCard
                  key={item.targetId || `${item.type}-${item.id}`}
                  id={item.id}
                  type={learningType}
                  image={item.image}
                  title={item.title}
                  description={item.description || ""}
                  author={item.author}
                  platform={item.platform}
                  onClick={() => handleItemClick(item)}
                  difficultyLevel={item.level}
                  estimatedTimeString={item.estimatedTime}
                  status={statusType}
                  customStatus={statusText}
                  progress={item.progress}
                  startedDate={item.enrolledDate}
                  certificateUrl={item.certificateUrl}
                  fromTracks={item.tracks}
                  onTrackClick={(trackId: number) => onTrackSelect(trackId.toString())}
                  onEdit={statusText === "Draft" || statusText === "Under Review" || statusText === "Published" ? () => handleEdit(item) : undefined}
                  onDelete={statusText === "Draft" ? () => handleDeleteClick(item) : undefined}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-600 mb-2">{emptyStateMessage}</h3>
            <p className="text-sm text-gray-500">{emptyStateDescription}</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfigurableAlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setItemToDelete(null);
          }
        }}
        type="delete-draft"
        description={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
        onAction={handleDeleteConfirm}
      />

          </div>
  );
}
