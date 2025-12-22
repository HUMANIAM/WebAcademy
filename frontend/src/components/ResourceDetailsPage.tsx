import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Clock,
  BookOpen,
  ExternalLink,
  CheckCircle2,
  Award,
  FileCode,
  User,
  Globe,
  Link as LinkIcon,
  Upload,
  Star,
  MessageCircle,
  ArrowLeft,
  Users,
  Target,
  TrendingUp,
  Plus,
  CheckCircle
} from "lucide-react";
import { useResources } from "../hooks/useResources";
import { ResourceRead } from "../types/resource";
import {
  LearningItemHero,
  MetadataItem,
} from "./shared/LearningItemHero";
import { toast } from "sonner";

interface ResourceDetailsPageProps {
  resourceId: string | null;
  onTrackClick?: (trackId: string) => void;
}

export function ResourceDetailsPage({
  resourceId,
  onTrackClick,
}: ResourceDetailsPageProps) {
  const { getResource, loading, error } = useResources();
  const [resource, setResource] = useState<any | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isAddedToLearnings, setIsAddedToLearnings] = useState(false);
  const [showCertificateDialog, setShowCertificateDialog] = useState(false);
  const [certificateLink, setCertificateLink] = useState("");
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificateMode, setCertificateMode] = useState<"link" | "upload">("link");
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  // Transform backend ResourceRead to UI format
  const transformResourceForUI = (backendResource: ResourceRead) => {
    return {
      id: backendResource.id,
      title: backendResource.title,
      description: backendResource.short_description,
      url: backendResource.url,
      image: backendResource.image_url || "https://placehold.co/600x400?text=Resource",
      level: backendResource.level || "Beginner",
      type: backendResource.resource_type,
      platform: backendResource.platform,
      estimatedTime: backendResource.estimated_time || "Not specified",
      skills: backendResource.skills || [],
      author: backendResource.author || "Unknown",
      rating: 4.5, // Default rating - could be enhanced with actual ratings
      tracks: [], // Default - could be enhanced with actual track relationships
      enrollmentStatus: "available" as const
    };
  };

  useEffect(() => {
    if (resourceId) {
      const fetchResource = async () => {
        try {
          const fetchedResource = await getResource(resourceId);
          console.log('Fetched resource:', fetchedResource);
          const transformedResource = transformResourceForUI(fetchedResource);
          console.log('Transformed resource:', transformedResource);
          setResource(transformedResource);
        } catch (err) {
          console.error('Failed to fetch resource:', err);
        }
      };
      
      fetchResource();
    }
  }, [resourceId, getResource]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl">Loading resource...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4 text-red-600">Error loading resource</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Resource not found</h2>
        </div>
      </div>
    );
  }

  const handleMarkAsCompleted = () => {
    setIsCompleted(true);
    // In a real app, this would add to My Accomplishments
  };

  const handleEnroll = () => {
    setIsEnrolled(true);
    // In a real app, this would add to My Learnings
  };

  const handleAddToLearnings = () => {
    setIsAddedToLearnings(true);
    toast.success("Added to My Learnings!");
    // In a real app, this would add to My Learnings
  };

  const handleAddCertificate = () => {
    setShowCertificateDialog(true);
  };

  const handleSaveCertificate = () => {
    if (certificateLink.trim() || certificateFile) {
      // Save certificate link or file
      setShowCertificateDialog(false);
      setCertificateLink("");
      setCertificateFile(null);
      setCertificateMode("link");
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      setCertificateFile(e.target.files[0]);
    }
  };

  const handleVisitResource = () => {
    // Use the actual resource URL from the backend
    if (resource?.url) {
      window.open(resource.url, "_blank");
    } else {
      console.warn('No URL available for resource');
      window.open("#", "_blank");
    }
  };

  const handleShare = async () => {
    // Generate shareable URL
    const shareUrl = `${window.location.origin}/?resource=${resourceId}`;

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

  if (resource.level) {
    metadata.push({
      icon: <BookOpen className="h-4 w-4 text-gray-600" />,
      label: "Level",
      value: resource.level,
    });
  }

  if (resource.estimatedTime) {
    metadata.push({
      icon: <Clock className="h-4 w-4 text-gray-600" />,
      label: "Estimated Time",
      value: resource.estimatedTime,
    });
  }

  if (resource.platform) {
    metadata.push({
      icon: <Globe className="h-4 w-4 text-gray-600" />,
      label: "Platform",
      value: resource.platform,
    });
  }

  // Always show creator/author - required field
  metadata.push({
    icon: <User className="h-4 w-4 text-gray-600" />,
    label: "Author/Instructor",
    value: resource.author || "WebAcademy",
  });

  if (resource.skills && resource.skills.length > 0) {
    metadata.push({
      icon: <FileCode className="h-4 w-4 text-gray-600" />,
      label: "Skills",
      value: resource.skills.join(", "),
    });
  }

  // Prepare action buttons - always show
  const actionButtons = (
    <div
      className={`grid ${resource.type === "Course" ? "grid-cols-4" : "grid-cols-3"} gap-3`}
    >
      {resource.type === "Course" ? (
        <Button
          size="lg"
          variant="outline"
          onClick={handleEnroll}
          disabled={isEnrolled}
          className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
        >
          <Award className="h-4 w-4" />
          {isEnrolled ? "Enrolled" : "Enroll In Course"}
        </Button>
      ) : (
        <Button
          size="lg"
          variant="outline"
          onClick={handleAddToLearnings}
          disabled={isAddedToLearnings}
          className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
        >
          <BookOpen className="h-4 w-4" />
          {isAddedToLearnings
            ? "Added to Learnings"
            : "Add to My Learnings"}
        </Button>
      )}

      <Button
        size="lg"
        variant="outline"
        onClick={handleVisitResource}
        className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
      >
        <ExternalLink className="h-4 w-4" />
        Visit
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

      {resource.type === "Course" && (
        <Button
          size="lg"
          variant="outline"
          onClick={handleAddCertificate}
          className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
        >
          <Award className="h-4 w-4" />
          Add Certificate
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Resource Hero Section */}
      {resource ? (
        <LearningItemHero
          title={resource.title}
          description={resource.description}
          image={resource.image}
          metadata={metadata}
          actionButtons={actionButtons}
          includedTracks={resource.tracks}
          onTrackClick={onTrackClick ? (trackId: number) => onTrackClick(trackId.toString()) : undefined}
          itemId={parseInt(resourceId || '0')}
          itemType="resource"
        />
      ) : (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold">Resource not available</h1>
        </div>
      )}


      {/* Add Certificate Dialog */}
      <Dialog
        open={showCertificateDialog}
        onOpenChange={setShowCertificateDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Certificate</DialogTitle>
          </DialogHeader>

          {/* Toggle between Link and Upload */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <Button
              variant={
                certificateMode === "link" ? "default" : "ghost"
              }
              onClick={() => setCertificateMode("link")}
              className="flex-1 gap-2"
            >
              <LinkIcon className="h-4 w-4" />
              Add Link
            </Button>
            <Button
              variant={
                certificateMode === "upload"
                  ? "default"
                  : "ghost"
              }
              onClick={() => setCertificateMode("upload")}
              className="flex-1 gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload File
            </Button>
          </div>

          <div className="py-4">
            {certificateMode === "link" ? (
              <div className="space-y-3">
                <Label htmlFor="certificate-link">
                  Certificate URL
                </Label>
                <Input
                  id="certificate-link"
                  placeholder="https://example.com/certificate/12345"
                  value={certificateLink}
                  onChange={(e) =>
                    setCertificateLink(e.target.value)
                  }
                  className="h-11"
                />
                <p className="text-sm text-gray-500">
                  Paste the link to your certificate from the
                  course platform
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Label htmlFor="certificate-file">
                  Certificate File
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                  <Input
                    id="certificate-file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {certificateFile && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {certificateFile.name}
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Upload your certificate (PDF, JPG, or PNG)
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCertificateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCertificate}
              disabled={
                certificateMode === "link"
                  ? !certificateLink.trim()
                  : !certificateFile
              }
            >
              Save Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}