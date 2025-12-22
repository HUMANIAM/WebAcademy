import { BaseLearningCard } from "./BaseLearningCard";
import { LearningType } from "../types";

interface ResourceCardProps {
  id: string;
  image: string;
  title: string;
  description: string;
  type: string;
  platform: string;
  rating?: number;
  author?: string;
  trackId?: string;
  trackName?: string;
  tracks?: Array<{ id: string; name: string }>;
  skills?: string[];
  level?: string;
  estimatedTime?: string;
  onResourceSelect?: (resourceId: string, resourceTitle?: string) => void;
  onTrackSelect?: (trackId: string) => void;
}

export function ResourceCard(props: ResourceCardProps) {
  const {
    id,
    image,
    title,
    type,
    platform,
    rating = 0,
    author,
    description = "",
    trackId,
    trackName,
    tracks,
    skills,
    level,
    estimatedTime,
    onResourceSelect,
    onTrackSelect,
  } = props;
  
  const fromTracks = tracks?.map(t => ({ id: parseInt(t.id), name: t.name })) || (trackId && trackName ? [{ id: parseInt(trackId), name: trackName }] : undefined);
  
  return (
    <BaseLearningCard
      id={parseInt(id)}
      type={type as LearningType}
      image={image}
      title={title}
      description={description}
      author={author}
      platform={platform}
      rating={rating}
      difficultyLevel={level}
      estimatedTimeString={estimatedTime || undefined}
      onClick={() => {
        if (onResourceSelect) {
          onResourceSelect(id, title);
        }
      }}
      fromTracks={fromTracks}
      onTrackClick={onTrackSelect ? (trackId: number) => onTrackSelect(trackId.toString()) : undefined}
    />
  );
}