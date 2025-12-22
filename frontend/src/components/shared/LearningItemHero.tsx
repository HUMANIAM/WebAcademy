import { useState, useEffect, ReactNode } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Star, MessageSquare, Share2, ChevronUp, ChevronDown, CheckCircle } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { toast } from "sonner";

export interface MetadataItem {
  icon: ReactNode;
  label: string;
  value: string;
}

interface LearningItemHeroProps {
  title: string;
  description: string;
  image: string;
  metadata: MetadataItem[];
  actionButtons: ReactNode;
  includedTracks?: Array<{ id: number; name: string }>;
  onTrackClick?: (trackId: number) => void;
  itemId: number;
  itemType: "track" | "resource";
  isReviewAssignment?: boolean; // Whether current user needs to review this item
  onApprove?: () => void; // Callback when user approves the item
}

export function LearningItemHero({
  title,
  description,
  image,
  metadata,
  actionButtons,
  includedTracks,
  onTrackClick,
  itemId,
  itemType,
  isReviewAssignment = false,
  onApprove,
}: LearningItemHeroProps) {
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  const handleShare = async () => {
    // Generate shareable URL
    const shareUrl = `${window.location.origin}/?${itemType}=${itemId}`;

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

  return (
    <>

      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Left: Item Info */}
            <div className="space-y-4 relative">
              {/* Approve and Share Buttons - Top Right */}
              <div className="absolute top-0 right-0 flex gap-2">
                {/* Approve Button - only show for review assignments */}
                {isReviewAssignment && onApprove && (
                  <Button
                    size="sm"
                    onClick={onApprove}
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve {itemType === "track" ? "Track" : "Resource"}
                  </Button>
                )}
                
                {/* Share Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleShare}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                {showCopiedMessage && (
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg whitespace-nowrap z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    ✓ Link copied to clipboard!
                  </div>
                )}
              </div>

              <h1 className="mb-2 text-[20px] font-bold">{title}</h1>

              <p className="text-gray-600">{description}</p>

              {/* Meta Information */}
              <div className="space-y-3">
                {metadata.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {item.icon}
                    <span className="text-gray-700 font-bold">{item.label}:</span>
                    <span className="text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-4">{actionButtons}</div>

              {/* Included Learning Tracks */}
              {includedTracks && includedTracks.length > 0 && (
                <IncludedTracks tracks={includedTracks} onTrackClick={onTrackClick} />
              )}

            </div>

            {/* Right: Image */}
            <div className="rounded-lg overflow-hidden flex items-start self-start max-h-[400px]">
              <ImageWithFallback
                src={image}
                alt={title}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Component to show included tracks with expand/collapse
function IncludedTracks({
  tracks,
  onTrackClick,
}: {
  tracks: Array<{ id: number; name: string }>;
  onTrackClick?: (trackId: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  // Check if content exceeds 2 rows
  useEffect(() => {
    if (containerRef) {
      const checkOverflow = () => {
        const items = containerRef.querySelectorAll("[data-track-item]");
        if (items.length > 0) {
          const firstItem = items[0] as HTMLElement;
          const itemHeight = firstItem.offsetHeight;
          const containerHeight = containerRef.scrollHeight;
          // If content is more than 2 rows worth of height
          setShowExpandButton(containerHeight > itemHeight * 2.5);
        }
      };

      // Check after render
      setTimeout(checkOverflow, 100);
      window.addEventListener("resize", checkOverflow);
      return () => window.removeEventListener("resize", checkOverflow);
    }
  }, [containerRef]);

  if (tracks.length === 0) return null;

  return (
    <div className="space-y-3 mt-6 mb-6">
      <h3 className="text-sm text-gray-700 text-[14px] font-bold">
        Included in Learning Tracks
      </h3>
      <div
        ref={setContainerRef}
        className={`flex flex-wrap gap-2 ${!isExpanded ? "max-h-[4.5rem] overflow-hidden" : ""}`}
      >
        {tracks.map((track) => (
          <Badge
            key={track.id}
            variant="secondary"
            className="cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => onTrackClick?.(track.id)}
            data-track-item
          >
            {track.name}
          </Badge>
        ))}
      </div>
      {showExpandButton && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              Show less <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show more <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}