import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { SuccessDialog } from "./SuccessDialog";
import { UnsavedChangesDialog } from "./shared/UnsavedChangesDialog";
import { ConfigurableBanner } from "./ConfigurableBanner";
import { ResourceCreate, ResourceRead } from '../types/resource';
import { ResourceSummary } from '../types/track';
import { AddLearningItemForm, LearningItemFormData, emptyLearningItemFormData } from "./AddLearningItemForm";
import { toResourceCreate, toLearningItemFormData, resourceSummaryToFormData } from "../utils/helpers";
import { useResources } from "../hooks/useResources";
import { checkResourceExists } from "../utils/url";
import { useDebounce } from "../hooks/useDebounce";

interface ShareLearningResourceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readOnly?: boolean;
  onSaveResource?: (resourceData: LearningItemFormData, resource_id?: string) => Promise<void>;
  showSuccessDialog?: boolean; // Control whether to show success dialog
  resourceToEdit?: ResourceSummary | null; // Resource data for editing
}

export function ShareLearningResource({
  open,
  onOpenChange,
  readOnly = false,
  onSaveResource,
  showSuccessDialog = true,
  resourceToEdit,
}: ShareLearningResourceProps) {
  const { createResource, loading: resourceLoading, error: resourceError, clearError } = useResources();

  const [resourceFormData, setResourceFormData] = useState<LearningItemFormData>({ ...emptyLearningItemFormData });
  const [initialFormData, setInitialFormData] = useState<LearningItemFormData>({ ...emptyLearningItemFormData });
  const [activeImageTab, setActiveImageTab] = useState<"url" | "upload">("upload");

  const [showSuccessDialogState, setShowSuccessDialogState] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [duplicateResource, setDuplicateResource] = useState<ResourceRead | null>(null);
  const [dismissedUrl, setDismissedUrl] = useState("");
  const [isDuplicateConfirmed, setIsDuplicateConfirmed] = useState(false);
  const [originalFormData, setOriginalFormData] = useState<LearningItemFormData | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const debouncedUrl = useDebounce(resourceFormData.url || "", 500);

  useEffect(() => {
    // Reset form when dialog opens or closes
    if (resourceToEdit) {
      // Convert ResourceSummary to LearningItemFormData for editing
      const editFormData = resourceSummaryToFormData(resourceToEdit);
      setResourceFormData(editFormData);
      setInitialFormData(editFormData);
    } else {
      setResourceFormData({ ...emptyLearningItemFormData });
      setInitialFormData({ ...emptyLearningItemFormData });
    }
    setDuplicateResource(null);
    setDismissedUrl("");
    setIsDuplicateConfirmed(false);
  }, [open, resourceToEdit]);

  useEffect(() => {
    const performLookup = async () => {
      if (!open || !debouncedUrl || debouncedUrl.length <= 8 || debouncedUrl === dismissedUrl) {
        setDuplicateResource(null);
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        const resource = await checkResourceExists(debouncedUrl);
        
        if (!abortControllerRef.current.signal.aborted) {
          setDuplicateResource(resource);
          
          // Save user's original data before populating with duplicate
          if (resource) {
            setOriginalFormData({ ...resourceFormData });
            const formData = toLearningItemFormData(resource);
            setResourceFormData(formData);
            setInitialFormData(formData);
          }
        }
      } catch (error) {
        if (!abortControllerRef.current?.signal.aborted) {
          console.error('Resource lookup error:', error);
          setDuplicateResource(null);
        }
      }
    };

    performLookup();

    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedUrl, open, dismissedUrl]);

  const hasUnsavedChanges = () => 
    JSON.stringify(resourceFormData) !== JSON.stringify(initialFormData);

  const handleDialogClose = (open: boolean) => {
    if (!open && hasUnsavedChanges()) {
      setShowUnsavedChangesDialog(true);
    } else {
      onOpenChange(open);
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedChangesDialog(false);
    onOpenChange(false);
  };

  const handleDuplicateConfirm = async () => {
    if (!duplicateResource) return;
    
    if (onSaveResource) {
      // Let parent handle the duplicate resource
      setSubmitting(true);
      try {
        await onSaveResource(resourceFormData, duplicateResource.id);
        setDuplicateResource(null);
        onOpenChange(false);
        if (showSuccessDialog) {
          setShowSuccessDialogState(true);
        }
      } catch {
        // Error handled by parent
      } finally {
        setSubmitting(false);
      }
    } else {
      // Default behavior: just close and show success
      setDuplicateResource(null);
      onOpenChange(false);
      if (showSuccessDialog) {
        setShowSuccessDialogState(true);
      }
    }
  };

  const handleDuplicateDismiss = () => {
    setDismissedUrl(resourceFormData.url || "");
    setDuplicateResource(null);
    setIsDuplicateConfirmed(false);
    
    // Restore user's original data before duplicate detection
    if (originalFormData) {
      setResourceFormData(originalFormData);
      setInitialFormData(originalFormData);
      setOriginalFormData(null);
    }
  };

  const handleSubmitResource = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent form submit from bubbling to parent forms
    handleSaveResource();
  };

  const handleSaveResource = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    clearError();

    try {
      if (onSaveResource) {
        // Let parent handle the resource saving
        // If editing existing resource, pass its ID; otherwise pass undefined for new resource
        const resourceId = resourceToEdit?.id || undefined;
        await onSaveResource(resourceFormData, resourceId);
      } else {
        // Default behavior: create resource directly
        const createdResource = await createResource(toResourceCreate(resourceFormData));
      }

      // Reset form
      setResourceFormData({ ...emptyLearningItemFormData });
      onOpenChange(false);

      // Show success dialog only if enabled
      if (showSuccessDialog) {
        setShowSuccessDialogState(true);
      }
    } catch {
      // Error is handled by the useResources hook or parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="!max-w-[1100px] w-[95vw] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Share Learning Resource
            </DialogTitle>
            <DialogDescription>
              Share a new learning resource with the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1">
            {resourceError && (
              <ConfigurableBanner
                type="error"
                message={resourceError}
                onDismiss={clearError}
              />
            )}
            
            {/* Duplicate Resource Banner */}
            {duplicateResource && (
              <ConfigurableBanner
                type="duplicate"
                title="Is this the resource you want to add?"
                message=""
                resource={duplicateResource}
                onConfirm={handleDuplicateConfirm}
                onDismiss={handleDuplicateDismiss}
              />
            )}
            
            <form
              onSubmit={handleSubmitResource}
              onKeyDown={(e) => {
                // Prevent Enter key from submitting the form - user must click the button
                if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
                  e.preventDefault();
                }
              }}
              className="space-y-4 mt-4 pr-2"
            >
              {/* Resource URL */}
              <div className="space-y-2">
                <Label htmlFor="resourceUrl">Resource URL *</Label>
                <Input
                  id="resourceUrl"
                  type="url"
                  required
                  placeholder="https://example.com/resource"
                  value={resourceFormData.url || ''}
                  onChange={(e) => setResourceFormData(prev => ({ ...prev, url: e.target.value }))}
                  disabled={readOnly || !!duplicateResource || isDuplicateConfirmed}
                />
              </div>

              {/* Shared form fields */}
              <AddLearningItemForm
                formData={resourceFormData}
                setFormData={setResourceFormData}
                activeImageTab={activeImageTab}
                onImageTabChange={setActiveImageTab}
                titleLabel="Resource Title *"
                descriptionLabel="Description *"
                imageLabel="Resource Image"
                disabled={readOnly || !!duplicateResource || isDuplicateConfirmed}
                titlePlaceholder="e.g., React Complete Guide, CS50 Course"
                descriptionPlaceholder="Describe what this resource covers and why it's valuable..."
                showEstimatedTime={true}
                showResourceType={true}
                showPlatform={true}
                showAuthor={true}
              />

              <div className="flex justify-center gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogClose(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || resourceLoading || !!duplicateResource || isDuplicateConfirmed}>
                  {submitting || resourceLoading
                    ? "Saving..."
                    : !!duplicateResource || isDuplicateConfirmed
                        ? "Resource Already Exists"
                        : "Submit Resource"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>

        {/* Success Dialog - only render if enabled */}
        {showSuccessDialog && (
          <SuccessDialog
            open={showSuccessDialogState}
            onOpenChange={setShowSuccessDialogState}
            type="resource"
            status="under_review"
          />
        )}
      </Dialog>

      {/* Unsaved Changes Confirmation Dialog */}
      <UnsavedChangesDialog
        open={showUnsavedChangesDialog}
        onOpenChange={setShowUnsavedChangesDialog}
        onDiscard={handleDiscardChanges}
        continueButtonText="Continue sharing"
      />
    </>
  );
}