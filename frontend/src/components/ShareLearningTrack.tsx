import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ShareLearningTrackResourcesSection } from "./ShareLearningTrackResourcesSection";
import { ConfigurableAlertDialog } from "./shared/AlertDialog";
import { AddLearningItemForm, LearningItemFormData, emptyLearningItemFormData } from "./AddLearningItemForm";
import { ResourceSummary, TrackCreate, TrackResourceItem } from "../types/track";
import { TrackLevel } from "../constants/backend";
import { useTracks } from "../hooks/useTracks";
import { toTrackResourceItems, buildEstimatedTime } from "../utils/helpers";
import { toast } from "sonner";

interface ShareLearningTrackProps {
  onSuccess?: (trackId: string) => void; // Optional callback when track is successfully created
  draftId?: number; // Optional draft ID to load
  onDraftSaved?: () => void; // Callback when draft is saved
  onCancel?: () => void; // Callback when user cancels/discards
}

export function ShareLearningTrack({
  onSuccess,
  draftId,
  onDraftSaved,
  onCancel,
}: ShareLearningTrackProps) {
  const { createTrack } = useTracks();
  const [trackData, setTrackData] = useState<LearningItemFormData>({
    ...emptyLearningItemFormData,
    estimatedTimeUnit: "Months", 
  });

  // Note: trackData.skills is the source of truth for skills
  // This getter/setter pair makes the form update seamless
  const selectedSkills = trackData.skills;
  const setSelectedSkills = (skills: string[]) => setTrackData(prev => ({ ...prev, skills }));

  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [showError, setShowError] = useState(false);
  const [activeImageTab, setActiveImageTab] = useState<"url" | "upload">("upload");

  const [
    showUnsavedChangesDialog,
    setShowUnsavedChangesDialog,
  ] = useState(false);
  const [initialFormData, setInitialFormData] = useState<LearningItemFormData>({
    ...emptyLearningItemFormData,
    estimatedTimeUnit: "Months",
  });
  const [initialResources, setInitialResources] = useState<ResourceSummary[]>([]);

  const handleAddResource = (resource: ResourceSummary) => {
    const existingIndex = resources.findIndex(r => r.id === resource.id);
    if (existingIndex >= 0) {
      // Update existing resource
      const updatedResources = [...resources];
      updatedResources[existingIndex] = resource;
      setResources(updatedResources);
    } else {
      // Add new resource
      setResources([...resources, resource]);
    }
  };

  const handleRemoveResource = (id: string) => {
    setResources(resources.filter((r) => r.id !== id));
  };
  
  const handleSubmitTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (resources.length === 0) {
      setShowError(true);
      return;
    }
    setShowError(false);
    handleSaveTrack();
  };

  const handleSaveTrack = async () => {
    // Convert ResourceSummary[] to TrackResourceItem[] for backend
    const trackResources: TrackResourceItem[] = toTrackResourceItems(resources);

    // Create TrackCreate object
    const trackCreateData: TrackCreate = {
      title: trackData.title,
      short_description: trackData.description,
      level: trackData.level as TrackLevel,
      estimated_time: buildEstimatedTime(trackData.estimatedTimeMin, trackData.estimatedTimeMax, trackData.estimatedTimeUnit),
      image_url: trackData.image,
      skills: trackData.skills,
      resources: trackResources
    };

    try {
      const result = await createTrack(trackCreateData);
      toast.success("Track created successfully!");
      if (onSuccess && result?.id) {
        onSuccess(result.id);
      }
      // Reset form after successful submission
      setTrackData({ ...emptyLearningItemFormData, estimatedTimeUnit: "Months" });
      setResources([]);
    } catch (err) {
      toast.error("Failed to create track");
      console.error("Track creation error:", err);
    }
  };


  // Check if form has unsaved changes
  const hasUnsavedChanges = () => {
    const formChanged = JSON.stringify(trackData) !== JSON.stringify(initialFormData);
    const resourcesChanged = JSON.stringify(resources) !== JSON.stringify(initialResources);
    return formChanged || resourcesChanged;
  };

  // Handle cancel with unsaved changes check
  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      setShowUnsavedChangesDialog(true);
    } else {
      onCancel?.();
    }
  };

  // Handle discard changes
  const handleDiscardChanges = () => {
    setShowUnsavedChangesDialog(false);
    onCancel?.();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-blue-600 mb-8">
            Create Learning Track
          </h1>

          <form
            onSubmit={handleSubmitTrack}
            className="space-y-8"
          >
            {/* Main Track Information Section */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">

              {/* Shared form fields */}
              <AddLearningItemForm
                formData={trackData}
                setFormData={setTrackData}
                activeImageTab={activeImageTab}
                onImageTabChange={setActiveImageTab}
                titleLabel="Track Title *"
                descriptionLabel="Description *"
                imageLabel="Track Image"
                titlePlaceholder="e.g., Full Stack Web Development"
                descriptionPlaceholder="Describe what learners will achieve with this track..."
                showImage={true}
                showEstimatedTime={true}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-300"></div>

            {/* Learning Resources Section */}
            <ShareLearningTrackResourcesSection
              resources={resources}
              onAddResource={handleAddResource}
              onRemoveResource={handleRemoveResource}
              showError={showError}
              onDismissError={() => setShowError(false)}
            />

            {/* Submit Button Section */}
            <div className="flex justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button type="submit">
                Submit Track
              </Button>
            </div>
          </form>
        </div>
      </div>

      
      {/* Unsaved Changes Confirmation Dialog */}
      <ConfigurableAlertDialog
        open={showUnsavedChangesDialog}
        onOpenChange={setShowUnsavedChangesDialog}
        type="unsaved-changes"
        cancelText="Continue editing"
        onAction={handleDiscardChanges}
      />
    </div>
  );
}