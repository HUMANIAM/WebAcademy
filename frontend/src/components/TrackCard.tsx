import { BaseLearningCard } from "./BaseLearningCard";
import { ResourceCard } from "./ResourceCard";
import { LearningType } from "../types";

interface BaseCardProps {
  id: string | number;
  image: string;
  description: string;
}

interface TrackCardProps extends BaseCardProps {
  trackName: string;
  creator: string;
  rating: number;
  level?: string;
  estimatedTime?: string;
  onTrackSelect: (trackId: string, trackTitle?: string) => void;
  onResourceSelect?: (resourceId: string, resourceTitle?: string) => void;
  // Allow these to be passed but ignore them (for union type compatibility)
  title?: string;
  type?: never;
  platform?: never;
  author?: never;
  skills?: string[];
  mediums?: string[];
  resourceIds?: number[];
  resources?: any[];
  skillsList?: string[];
}

interface ResourceCardProps extends BaseCardProps {
  title: string;
  type: string;
  platform: string;
  author?: string;
  url?: string;
  rating?: number;
  level?: string;
  estimatedTime?: string;
  skills?: string[];
  onTrackSelect?: (trackId: string) => void;
  onResourceSelect?: (resourceId: string, resourceTitle?: string) => void;
  // Track-specific props (optional)
  creator?: never;
}

type CardProps = TrackCardProps | ResourceCardProps;

function isResource(props: CardProps): props is ResourceCardProps {
  return 'type' in props && props.type !== undefined;
}

export function TrackCard(props: CardProps) {
  const {
    id,
    image,
    description,
    onTrackSelect,
    onResourceSelect,
  } = props;

  if (isResource(props)) {
    const { title, type, platform, author, level, estimatedTime, skills } = props;
    
    return (
      <ResourceCard
        id={String(id)}
        image={image}
        title={title}
        description={description}
        type={type}
        platform={platform}
        author={author}
        level={level}
        estimatedTime={estimatedTime}
        skills={skills}
        onResourceSelect={onResourceSelect}
        onTrackSelect={onTrackSelect}
      />
    );
  }

  // Render Track Card
  const { trackName, creator, level, estimatedTime } = props;
  
  return (
    <BaseLearningCard
      id={typeof id === 'number' ? id : parseInt(id)}
      type="Track"
      image={image}
      title={trackName}
      description={description}
      author={creator}
      difficultyLevel={level}
      estimatedTimeString={estimatedTime || undefined}
      onClick={() => onTrackSelect?.(String(id), trackName)}
    />
  );
}