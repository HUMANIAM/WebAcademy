import { useState } from "react";
import { UserContentPage } from "./UserContentPage";

interface MyLearningsPageProps {
  onTrackSelect: (trackId: string, trackTitle?: string) => void;
  onResourceSelect: (resourceId: string) => void;
  searchTerm: string;
}

const statusOptions = [
  { value: "all", label: "All" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export function MyLearningsPage({onTrackSelect, onResourceSelect, searchTerm }: MyLearningsPageProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [statusCounts] = useState<Record<string, number>>({
    all: 0,
    in_progress: 0,
    completed: 0
  });
  
  // Static data - will be replaced with backend API
  const learnings: any[] = [];
  const loading = false;

  const transformedData = learnings.map((learning: any) => ({
    id: learning.id,
    targetId: learning.targetId,
    title: learning.title,
    description: learning.description || '',
    type: learning.type,
    status: learning.status,
    progress: learning.progress || 0,
    image: learning.image || '',
    enrolledDate: learning.enrolledDate || new Date().toISOString(),
    rating: learning.rating || 0,
    author: learning.author,
    platform: learning.platform,
    skills: learning.skills || [],
    level: learning.level,
    estimatedTime: learning.estimatedTime,
    resourceType: learning.resourceType,
    certificateUrl: learning.certificateUrl,
    completedDate: learning.completedDate,
    tracks: learning.tracks,
  }));

  return (
    <UserContentPage
      pageTitle="My Learnings"
      statusOptions={statusOptions}
      data={transformedData}
      onTrackSelect={onTrackSelect}
      onResourceSelect={onResourceSelect}
      searchTerm={searchTerm}
      emptyStateMessage="No learnings found"
      emptyStateDescription="Try adjusting your filters or start a new learning journey!"
      isLoading={loading}
      onStatusChange={setSelectedStatus}
      statusCounts={statusCounts}
    />
  );
}