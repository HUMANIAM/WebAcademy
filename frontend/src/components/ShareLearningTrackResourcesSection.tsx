import { useState } from "react";
import { Button } from "./ui/button";
import { Plus, X, Clock, BarChart } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ShareLearningResource } from "./ShareLearningResource";
import { ConfigurableBanner } from "./ConfigurableBanner";
import { ResourceSummary } from "../types/track";
import { ConfigurableAlertDialog } from "./shared/AlertDialog";
import { LearningItemFormData } from "./AddLearningItemForm";
import { toResourceSummary, generateTempId } from "../utils/helpers";

interface ShareLearningTrackResourcesSectionProps {
  resources: ResourceSummary[];
  onAddResource: (resource: ResourceSummary) => void;
  onRemoveResource: (id: string) => void;
  showError: boolean;
  onDismissError: () => void;
}

export function ShareLearningTrackResourcesSection({
  resources,
  onAddResource,
  onRemoveResource,
  showError,
  onDismissError,
}: ShareLearningTrackResourcesSectionProps) {
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [resourceToRemove, setResourceToRemove] = useState<string | null>(null);
  const [resourceToEdit, setResourceToEdit] = useState<ResourceSummary | null>(null);

  const handleSaveResource = async (resourceData: LearningItemFormData, resource_id?: string) => {
    // Determine the resource ID based on the case
    let finalId: string;
    if (resourceToEdit) {
      finalId = resourceToEdit.id;  // Editing existing resource
    } else if (resource_id) {
      finalId = resource_id;  // Published resource
    } else {
      finalId = generateTempId();  // New resource
    }
    
    // Convert and add once
    const resource = toResourceSummary(resourceData, finalId, resources.length);
    onAddResource(resource);
    
    setIsResourceDialogOpen(false);
    setResourceToEdit(null);
  };

  const handleRemoveResource = (id: string) => {
    onRemoveResource(id);
    setResourceToRemove(null);
  };

  const handleEditResource = (resource: ResourceSummary) => {
    setResourceToEdit(resource);
    setIsResourceDialogOpen(true);
  };

  
  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900">
            Learning Resources
          </h2>
          <Button
            type="button"
            onClick={() => {
              setResourceToEdit(null);
              setIsResourceDialogOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>
        </div>

        {showError && resources.length === 0 && (
          <ConfigurableBanner
            type="error"
            message="Please add at least one learning resource before submitting the track."
            onDismiss={onDismissError}
          />
        )}

        {resources.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">
              No resources added yet. Click the "+ Add Resource" button to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => handleEditResource(resource)}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setResourceToRemove(resource.id);
                  }}
                  className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 shadow-md"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="aspect-video w-full overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={resource.image_url}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <h3 className="text-gray-900 mb-2 pr-6 line-clamp-2">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {resource.short_description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {resource.estimated_time}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart className="h-3 w-3" />
                      <span className="capitalize">
                        {resource.level}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded capitalize">
                      {resource.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Resource Dialog */}
      <ShareLearningResource
        open={isResourceDialogOpen}
        onOpenChange={setIsResourceDialogOpen}
        readOnly={false}
        onSaveResource={handleSaveResource}
        resourceToEdit={resourceToEdit}
        showSuccessDialog={false}
      />

      {/* Remove Resource Confirmation Dialog */}
      <ConfigurableAlertDialog
        open={resourceToRemove !== null}
        onOpenChange={(open: boolean) => !open && setResourceToRemove(null)}
        type="remove-resource"
        onAction={() => {
          if (resourceToRemove) {
            handleRemoveResource(resourceToRemove);
          }
        }}
      />
    </>
  );
}
