import { useState } from "react";
import { UserContentPage } from "./UserContentPage";

interface MySubmissionsPageProps {
  onTrackSelect: (trackId: string, trackTitle?: string) => void;
  onResourceSelect: (resourceId: string) => void;
  onEditTrack: (trackId: string) => void;
  onDeleteDraft: (draftId: string) => void;
  searchTerm: string;
  initialStatusFilter?: string;
}

const SUBMISSIONS_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "needs_action", label: "Needs Your Action" },
  { value: "draft", label: "Draft" },
  { value: "under_review", label: "Under Review" },
  { value: "published", label: "Published" },
];

export function MySubmissionsPage({ 
  onTrackSelect, 
  onResourceSelect, 
  onEditTrack, 
  onDeleteDraft, 
  searchTerm, 
  initialStatusFilter 
}: MySubmissionsPageProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatusFilter || "all");
  const [statusCounts] = useState<Record<string, number>>({
    all: 0,
    needs_action: 0,
    draft: 0,
    under_review: 0,
    published: 0
  });
  
  // Static data - will be replaced with backend API
  const allSubmissions: any[] = [];
  const loading = false;

  // Filter submissions based on selected status (UI logic only)
  const filteredSubmissions = selectedStatus === "all" 
    ? allSubmissions 
    : selectedStatus === "needs_action"
    ? allSubmissions.filter((s: any) => s.isReviewAssignment)
    : allSubmissions.filter((s: any) => !s.isReviewAssignment && s.status === selectedStatus);

  return (
    <UserContentPage
      pageTitle="My Submissions"
      statusOptions={SUBMISSIONS_STATUS_OPTIONS}
      data={filteredSubmissions}
      onTrackSelect={onTrackSelect}
      onResourceSelect={onResourceSelect}
      onEditTrack={onEditTrack}
      onDeleteDraft={onDeleteDraft}
      searchTerm={searchTerm}
      emptyStateMessage="No submissions found"
      emptyStateDescription="Share your first learning resource or create a track to get started!"
      initialStatusFilter={initialStatusFilter}
      isLoading={loading}
      onStatusChange={setSelectedStatus}
      statusCounts={statusCounts}
    />
  );
}