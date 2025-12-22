import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Clock, BookOpen, FileCode, User, CheckCircle2, ExternalLink } from "lucide-react";
import { UserContentPage } from "./UserContentPage";
import { LearningItemHero, MetadataItem } from "./shared/LearningItemHero";
import { toast } from "sonner";
import { useTracks } from "../hooks/useTracks";
import { TrackReadWithResources, ResourceSummary } from "../types/track";
import { LearningItem } from "../types";

const trackImage = "https://placehold.co/1200x600?text=Learning+Track";

// Convert ResourceSummary to LearningItem for UserContentPage
const resourceToLearningItem = (resource: ResourceSummary): LearningItem => ({
  id: 0, // Use 0 as placeholder since LearningItem expects number but we use targetId for actual routing
  targetId: resource.id,
  title: resource.title,
  type: "resource",
  resourceType: resource.type,
  platform: resource.platform,
  status: "in_progress",
  progress: 0,
  rating: 0,
  image: resource.image_url || '',
  enrolledDate: '',
  skills: resource.skills,
  description: resource.short_description,
  url: resource.url,
  level: resource.level,
  estimatedTime: resource.estimated_time,
});

interface TrackDetailsPageProps {
  trackId: string | null;
  onResourceSelect: (resourceId: string) => void;
  onTrackSelect: (trackId: string, trackTitle?: string) => void;
}

export function TrackDetailsPage({ trackId, onResourceSelect, onTrackSelect }: TrackDetailsPageProps) {
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  
  // State for track interactions
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAddedToLearnings, setIsAddedToLearnings] = useState(false);
  const [trackDetails, setTrackDetails] = useState<TrackReadWithResources | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { getTrackWithResources } = useTracks();

  // Fetch track data when trackId changes
  useEffect(() => {
    if (trackId) {
      setIsLoading(true);
      setFetchError(null);
      getTrackWithResources(trackId)
        .then(track => {
          setTrackDetails(track);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch track:", err);
          setFetchError(err.message || "Failed to load track");
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [trackId, getTrackWithResources]);
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading track details...</div>;
  }
  
  if (!trackId || fetchError || !trackDetails) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="mb-4">Track Not Found</h2>
          <p className="text-gray-600 mb-6">{fetchError || "The track you're looking for doesn't exist or has been removed."}</p>
        </div>
      </div>
    );
  }

  const handleAddToLearnings = () => {
    // Handle add to learnings logic
    setIsAddedToLearnings(true);
    toast.success("Track added to My Learnings!");
  };
  
  const handleMarkAsCompleted = () => {
    setIsCompleted(true);
    toast.success("Track marked as completed!");
    // TODO: Save to repository/database
  };
  
  const handleShare = async () => {
    // Generate shareable URL
    const shareUrl = `${window.location.origin}/?track=${trackId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 3000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setShowCopiedMessage(true);
        setTimeout(() => setShowCopiedMessage(false), 3000);
      } catch (e) {
        toast.error("Failed to copy link");
      }
      document.body.removeChild(textArea);
    }
  };
  
  
  // Prepare metadata for LearningItemHero
  const metadata: MetadataItem[] = [];
  
  if (trackDetails.level) {
    metadata.push({
      icon: <BookOpen className="h-4 w-4 text-gray-600" />,
      label: "Level",
      value: trackDetails.level,
    });
  }

  if (trackDetails.estimated_time) {
    metadata.push({
      icon: <Clock className="h-4 w-4 text-gray-600" />,
      label: "Estimated Time",
      value: trackDetails.estimated_time,
    });
  }
  
  // Always show creator - required field
  metadata.push({
    icon: <User className="h-4 w-4 text-gray-600" />,
    label: "Creator",
    value: "WebAcademy",
  });
  
  if (trackDetails.skills && trackDetails.skills.length > 0) {
    metadata.push({
      icon: <FileCode className="h-4 w-4 text-gray-600" />,
      label: "Skills",
      value: trackDetails.skills.join(", "),
    });
  }
  
  // Prepare action buttons
  const actionButtons = (
    <div className="grid grid-cols-2 gap-3">
      <Button 
        size="lg" 
        variant="outline" 
        onClick={handleAddToLearnings}
        disabled={isAddedToLearnings}
        className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
      >
        <BookOpen className="h-4 w-4" />
        {isAddedToLearnings ? "Added to Learnings" : "Add to My Learnings"}
      </Button>
      
      <Button
        size="lg"
        variant={isCompleted ? "secondary" : "outline"}
        onClick={handleMarkAsCompleted}
        disabled={isCompleted}
        className={`gap-2 ${!isCompleted ? "border-blue-500 text-blue-600 hover:bg-blue-50" : ""}`}
      >
        <CheckCircle2 className="h-4 w-4" />
        {isCompleted ? "Completed" : "Mark as Completed"}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Track Hero Section */}
      <LearningItemHero
        title={trackDetails.title}
        description={trackDetails.short_description}
        image={trackDetails.image_url || trackImage}
        metadata={metadata}
        actionButtons={actionButtons}
        itemId={trackId ? parseInt(trackId, 10) : 0}
        itemType="track"
      />

      {/* Resources Section - reuse UserContentPage for consistent layout */}
      <UserContentPage
        pageTitle="Track Resources"
        statusOptions={[]}
        data={trackDetails.resources.map(resourceToLearningItem)}
        onTrackSelect={() => {}} // Not needed for resources
        onResourceSelect={onResourceSelect}
        searchTerm=""
        emptyStateMessage="No resources found"
        emptyStateDescription="This track doesn't have any resources yet."
        isLoading={false}
      />

    </div>
  );
}