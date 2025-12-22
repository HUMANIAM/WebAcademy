import React from "react";
import {
  Star,
  MessageSquare,
  Award,
  ExternalLink,
  Edit,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { LearningType, StatusType } from "../types";

export interface BaseLearningCardProps {
  id: number;
  type: LearningType;
  image: string;
  title: string;
  description: string;
  author?: string;
  platform?: string;
  onClick: () => void;

  difficultyLevel?: string;
  estimatedTime?: number | null;
  timeUnit?: string | null;
  estimatedTimeString?: string | null;

  fromTracks?: Array<{ id: number; name: string }>;
  onTrackClick?: (trackId: number) => void;

  status?: StatusType;
  customStatus?: string;
  progress?: number;
  startedDate?: string;
  certificateUrl?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function BaseLearningCard({
  id,
  type,
  image,
  title,
  description,
  author,
  platform,
  onClick,
  difficultyLevel,
  estimatedTime,
  timeUnit,
  estimatedTimeString,
  fromTracks,
  onTrackClick,
  status,
  customStatus,
  progress,
  startedDate,
  certificateUrl,
  onEdit,
  onDelete,
}: BaseLearningCardProps) {
  const descriptionRef =
    React.useRef<HTMLParagraphElement>(null);
  const [isDescriptionTruncated, setIsDescriptionTruncated] =
    React.useState(false);

  React.useEffect(() => {
    const element = descriptionRef.current;
    if (element) {
      const isTruncated =
        element.scrollHeight > element.clientHeight;
      setIsDescriptionTruncated(isTruncated);
    }
  }, [description]);

  const handleCardClick = () => {
    onClick();
  };

  const handleTrackLinkClick = (
    e: React.MouseEvent,
    trackId: number,
  ) => {
    e.stopPropagation();
    if (onTrackClick) {
      onTrackClick(trackId);
    }
  };

  const handleCertificateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (certificateUrl) {
      window.open(certificateUrl, "_blank");
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
  };

  const isMyLearningCard =
    status !== undefined ||
    customStatus !== undefined ||
    progress !== undefined ||
    startedDate !== undefined ||
    certificateUrl !== undefined;

  const isSubmission = customStatus !== undefined;

  // Use estimatedTimeString directly - it's already formatted
  const timeDisplay = React.useMemo(() => {
    if (estimatedTimeString) return estimatedTimeString;
    if (estimatedTime && timeUnit) return `${estimatedTime} ${timeUnit}`;
    return null;
  }, [estimatedTimeString, estimatedTime, timeUnit]);

  return (
    <div
      className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="aspect-video overflow-hidden bg-gray-100 relative">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute top-3 left-3">
          <Badge className="bg-blue-600 text-white hover:bg-blue-700">
            {type}
          </Badge>
        </div>

        {isMyLearningCard && (status || customStatus) && (
          <div className="absolute top-3 right-3">
            <Badge
              className={
                customStatus
                  ? customStatus === "Draft"
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : customStatus === "Under Review"
                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      : customStatus === "Published"
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : customStatus === "Needs Action"
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  : status === "Completed"
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }
            >
              {customStatus || status}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-5 space-y-3">
        <h3 className="line-clamp-2">{title}</h3>

        <div>
          <p
            ref={descriptionRef}
            className="text-gray-600 text-sm line-clamp-2"
          >
            {description}
          </p>
        </div>

        {(author || platform) && (
          <p className="text-sm text-gray-500">
            by {[author, platform].filter(Boolean).join(", ")}
          </p>
        )}

        {fromTracks && fromTracks.length > 0 && (
          <div className="text-sm text-gray-600">
            <span className="text-gray-500">
              Referenced By:{" "}
            </span>
            {fromTracks.slice(0, 2).map((track, index) => (
              <span key={track.id}>
                <button
                  onClick={(e) =>
                    handleTrackLinkClick(e, track.id)
                  }
                  className="text-blue-600 hover:underline"
                >
                  {track.name}
                </button>
                {index < Math.min(fromTracks.length - 1, 1) &&
                  ", "}
              </span>
            ))}
            {fromTracks.length > 2 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className="text-blue-600 hover:underline ml-1"
              >
                + {fromTracks.length - 2} more
              </button>
            )}
          </div>
        )}

        {(difficultyLevel || timeDisplay) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {difficultyLevel && (
              <span className="capitalize">
                {difficultyLevel}
              </span>
            )}
            {difficultyLevel && timeDisplay && (
              <span>•</span>
            )}
            {timeDisplay && (
              <span>
                {timeDisplay}
              </span>
            )}
          </div>
        )}

        {isMyLearningCard && (
          <>
            {certificateUrl && (
              <>
                <div className="border-t pt-3" />
                <button
                  onClick={handleCertificateClick}
                  className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors w-full"
                >
                  <Award className="h-4 w-4" />
                  <span>Certificate Available</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </button>
              </>
            )}

            {isSubmission &&
              (customStatus === "Draft" ||
                customStatus === "Under Review" ||
                customStatus === "Published") &&
              onEdit && (
                <>
                  <div className="border-t pt-3" />
                  {customStatus === "Draft" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleEditClick}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-md flex-1"
                      >
                        <ArrowRight className="h-4 w-4" />
                        <span>Continue</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onDelete) onDelete();
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 transition-colors rounded-md flex-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleEditClick}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-md w-full"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  )}
                </>
              )}
          </>
        )}
      </div>
    </div>
  );
}
