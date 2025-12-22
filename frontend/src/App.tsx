import { useState, ReactNode } from "react";
import { Header } from "./components/Header";
import { FeaturedCarousel } from "./components/FeaturedCarousel";
import { UserContentGrid } from "./components/UserContentGrid";
import { Footer } from "./components/Footer";
import { TrackDetailsPage } from "./components/TrackDetailsPage";
import { ResourceDetailsPage } from "./components/ResourceDetailsPage";
import { MyLearningsPage } from "./components/MyLearningsPage";
import { MySubmissionsPage } from "./components/MySubmissionsPage";
import { ShareLearningTrack } from "./components/ShareLearningTrack";
import { Toaster } from "./components/ui/sonner";
import { useRouting } from "./hooks/useRouting";
import { navigateToResource, navigateToHome, navigateToPage, navigateToTrack } from "./utils/routing";

interface PageLayoutProps {
  children: React.ReactNode;
  beforeMain?: React.ReactNode;
  headerProps: {
    isLoggedIn: boolean;
    onToggleLogin: () => void;
    onNavigateToHome: () => void;
    onNavigateToMyLearnings: () => void;
    onNavigateToMySubmissions: (filter?: string) => void;
    onNavigateToCreateTrack: () => void;
    searchTerm: string;
    onSearch: (term: string) => void;
    onNavigateToItem: (type: 'track' | 'resource', id: string) => void;
  };
}

const PageLayout = ({ children, beforeMain, headerProps }: PageLayoutProps) => (
  <div className="min-h-screen flex flex-col">
    <Header {...headerProps} />
    {beforeMain}
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<"home" | "myLearnings" | "mySubmissions" | "createTrack">("home");
  const [searchTerm, setSearchTerm] = useState("");
  const [draftId, setDraftId] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mySubmissionsInitialFilter, setMySubmissionsInitialFilter] = useState<string | undefined>(undefined);

  // Initialize routing - clean separation of concerns
  useRouting({
    setSelectedTrackId,
    setSelectedResourceId,
    setCurrentPage
  });

  const handleToggleLogin = () => {
    if (isLoggedIn) {
      // User is logging out - clear all auth data and go to home
      setIsLoggedIn(false);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      
      // Navigate to home page
      setSelectedTrackId(null);
      setSelectedResourceId(null);
      setCurrentPage("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // User is logging in
      setIsLoggedIn(true);
    }
  };

  const handleTrackSelect = (trackId: string, trackTitle?: string) => {
    setSelectedTrackId(trackId);
    setSelectedResourceId(null);
    navigateToTrack(trackId, trackTitle);
    // Defer scroll to ensure DOM has updated
    setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" }), 0);
  };

  const handleResourceSelect = (resourceId: string, resourceTitle?: string) => {
    setSelectedResourceId(resourceId);
    navigateToResource(resourceId, resourceTitle);
    // Defer scroll to ensure DOM has updated
    setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" }), 0);
  };


  const handleNavigateToHome = () => {
    setCurrentPage("home");
    setSelectedTrackId(null);
    setSelectedResourceId(null);
    navigateToHome();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateToMyLearnings = () => {
    setCurrentPage("myLearnings");
    setSelectedTrackId(null);
    setSelectedResourceId(null);
    navigateToPage("myLearnings");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateToMySubmissions = (initialFilter?: string) => {
    setCurrentPage("mySubmissions");
    setSelectedTrackId(null);
    setSelectedResourceId(null);
    setMySubmissionsInitialFilter(initialFilter);
    navigateToPage("mySubmissions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDraftSaved = () => {
    // Navigate to My Submissions with Draft filter enabled
    handleNavigateToMySubmissions("draft");
  };

  const handleNavigateToCreateTrack = () => {
    setCurrentPage("createTrack");
    setDraftId(undefined); // Clear draft ID for new track
    setSelectedTrackId(null);
    setSelectedResourceId(null);
    navigateToPage("createTrack");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditTrack = (trackId: string) => {
    setDraftId(trackId);
    setCurrentPage("createTrack");
    setSelectedTrackId(null);
    setSelectedResourceId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteDraft = (draftId: string) => {
    // Draft deletion logic removed - will be handled by backend
    setRefreshKey(prev => prev + 1);
  };

  
  const handleTrackCreated = (trackId: string) => {
    // Track was created successfully
    // Navigate to My Submissions to see the submitted track
    handleNavigateToMySubmissions("under_review");
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleNavigateToItem = (type: 'track' | 'resource', id: string) => {
    if (type === 'track') {
      setSelectedTrackId(id);
      setSelectedResourceId(null);
    } else {
      setSelectedResourceId(id);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const headerProps = {
    isLoggedIn,
    onToggleLogin: handleToggleLogin,
    onNavigateToHome: handleNavigateToHome,
    onNavigateToMyLearnings: handleNavigateToMyLearnings,
    onNavigateToMySubmissions: handleNavigateToMySubmissions,
    onNavigateToCreateTrack: handleNavigateToCreateTrack,
    searchTerm,
    onSearch: handleSearch,
    onNavigateToItem: handleNavigateToItem,
  };

  const renderPage = () => {
    if (selectedResourceId !== null) {
      return (
        <PageLayout headerProps={headerProps}>
          <ResourceDetailsPage 
            resourceId={selectedResourceId} 
            onTrackClick={handleTrackSelect}
          />
        </PageLayout>
      );
    }

    if (selectedTrackId !== null) {
      return (
        <PageLayout headerProps={headerProps}>
          <TrackDetailsPage 
            trackId={selectedTrackId} 
            onResourceSelect={handleResourceSelect}
            onTrackSelect={handleTrackSelect}
          />
        </PageLayout>
      );
    }

    switch (currentPage) {
      case "myLearnings":
        return (
          <PageLayout headerProps={headerProps}>
            <MyLearningsPage 
              onTrackSelect={handleTrackSelect}
              onResourceSelect={handleResourceSelect}
              searchTerm={searchTerm}
            />
          </PageLayout>
        );

      case "mySubmissions":
        return (
          <PageLayout headerProps={headerProps}>
            <MySubmissionsPage 
              key={refreshKey}
              onTrackSelect={handleTrackSelect}
              onResourceSelect={handleResourceSelect}
              onEditTrack={handleEditTrack}
              onDeleteDraft={handleDeleteDraft}
              searchTerm={searchTerm}
              initialStatusFilter={mySubmissionsInitialFilter}
            />
          </PageLayout>
        );

      case "createTrack":
        return (
          <PageLayout headerProps={headerProps}>
            <ShareLearningTrack 
              onSuccess={handleTrackCreated}
              onDraftSaved={handleDraftSaved}
            />
          </PageLayout>
        );

      default:
        return (
          <PageLayout 
            headerProps={headerProps}
            beforeMain={<FeaturedCarousel onTrackSelect={handleTrackSelect} />}
          >
            <UserContentGrid 
              onTrackSelect={handleTrackSelect} 
              searchTerm={searchTerm} 
              onResourceSelect={handleResourceSelect} 
              refreshKey={refreshKey} 
            />
          </PageLayout>
        );
    }
  };

  return (
    <>
      {renderPage()}
      <Toaster />
    </>
  );
}