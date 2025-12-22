import {
  Search,
  GraduationCap,
  Bell,
  ChevronDown,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useRef, useEffect } from "react";
import { ShareLearningResource } from "./ShareLearningResource";
// import { LoginDialog } from "./LoginDialog"; // Disabled for now - will re-enable later
import { UserTypeDialog } from "./UserTypeDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

interface HeaderProps {
  isLoggedIn: boolean;
  onToggleLogin: () => void;
  onNavigateToMyLearnings: () => void;
  onNavigateToMySubmissions: () => void;
  onNavigateToCreateTrack: () => void;
  onNavigateToHome?: () => void;
  searchTerm: string;
  onSearch: (term: string) => void;
  onNavigateToItem?: (type: "track" | "resource", id: string) => void;
}

export function Header({
  isLoggedIn,
  onToggleLogin,
  onNavigateToMyLearnings,
  onNavigateToMySubmissions,
  onNavigateToCreateTrack,
  onNavigateToHome,
  searchTerm,
  onSearch,
  onNavigateToItem,
}: HeaderProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] =
    useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] =
    useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<
    | "myLearnings"
    | "mySubmissions"
    | "shareResource"
    | "createTrack"
    | "notifications"
    | null
  >(null);
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] =
    useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] =
    useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] =
    useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  // Load unread notification count - static for now
  useEffect(() => {
    // Static count - will be replaced with backend API
    setUnreadCount(isLoggedIn ? 3 : 0);
  }, [isLoggedIn, isNotificationsOpen]);

  const handleNotificationsPanelClose = () => {
    setIsNotificationsOpen(false);
  };

  
  const handleLoginClick = () => {
    if (isLoggedIn) {
      // Logout immediately
      onToggleLogin();
    } else {
      // Show login dialog
      setIsLoginDialogOpen(true);
    }
  };

  const handleLoginSuccess = (
    userType: "admin" | "regular",
  ) => {
    // Store user type in localStorage
    localStorage.setItem("userType", userType);

    onToggleLogin();
    setIsLoginDialogOpen(false);

    // Navigate to the intended destination
    if (pendingNavigation === "myLearnings") {
      onNavigateToMyLearnings();
    } else if (pendingNavigation === "mySubmissions") {
      onNavigateToMySubmissions();
    } else if (pendingNavigation === "shareResource") {
      setIsShareDialogOpen(true);
    } else if (pendingNavigation === "createTrack") {
      onNavigateToCreateTrack();
    } else if (pendingNavigation === "notifications") {
      // Open notifications panel after login
      setIsNotificationsOpen(true);
    }

    // Clear pending navigation
    setPendingNavigation(null);
  };

  const handleMyLearningsClick = () => {
    if (isLoggedIn) {
      onNavigateToMyLearnings();
    } else {
      setPendingNavigation("myLearnings");
      setIsLoginDialogOpen(true);
    }
  };

  const handleMySubmissionsClick = () => {
    if (isLoggedIn) {
      onNavigateToMySubmissions();
    } else {
      setPendingNavigation("mySubmissions");
      setIsLoginDialogOpen(true);
    }
  };

  const handleShareResourceClick = () => {
    if (isLoggedIn) {
      setIsShareDialogOpen(true);
    } else {
      setPendingNavigation("shareResource");
      setIsLoginDialogOpen(true);
    }
  };

  const handleCreateTrackClick = () => {
    if (isLoggedIn) {
      onNavigateToCreateTrack();
    } else {
      setPendingNavigation("createTrack");
      setIsLoginDialogOpen(true);
    }
  };

  const handleNotificationsOpenChange = (open: boolean) => {
    if (open && !isLoggedIn) {
      // User trying to open notifications while logged out
      setPendingNavigation("notifications");
      setIsLoginDialogOpen(true);
    } else {
      // User is logged in or closing the panel
      setIsNotificationsOpen(open);
    }
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="px-4">
        {/* First row: Logo + Navigation (desktop) + Search + Notification + Login */}
        <div className="flex items-center h-16 gap-2 sm:gap-4 lg:gap-6">
          {/* Logo */}
          <div
            className={`flex items-center gap-1 sm:gap-2 shrink-0 ${onNavigateToHome ? 'cursor-pointer' : ''}`}
            onClick={onNavigateToHome}
          >
            <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span className="text-blue-600 text-sm sm:text-base">
              WebAcademy
            </span>
          </div>

          {/* Desktop Navigation - Show inline on large screens */}
          <nav className="hidden lg:flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleMyLearningsClick}
            >
              My Learnings
            </Button>
            <Button
              variant="ghost"
              onClick={handleMySubmissionsClick}
            >
              {" "}
              Submissions
            </Button>

            {/* Share With Others Custom Dropdown */}
            <div
              className="relative"
              ref={desktopDropdownRef}
              onMouseEnter={() =>
                setIsDesktopDropdownOpen(true)
              }
              onMouseLeave={() =>
                setIsDesktopDropdownOpen(false)
              }
            >
              <Button
                variant="ghost"
                className="flex items-center gap-1"
              >
                Share With Others
                <ChevronDown className="h-4 w-4" />
              </Button>

              {isDesktopDropdownOpen && (
                <div className="absolute top-full left-0 pt-2 w-56 z-[100]">
                  <div className="bg-white border border-gray-200 rounded-md shadow-lg">
                    <div className="py-1">
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          handleShareResourceClick();
                          setIsDesktopDropdownOpen(false);
                        }}
                      >
                        Learning Resource
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          handleCreateTrackClick();
                          setIsDesktopDropdownOpen(false);
                        }}
                      >
                        Learning Track
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search Resources"
              className="pl-8 sm:pl-10 w-full border border-gray-300 text-sm"
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>

          {/* Right side: Notification and Login */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button
              onClick={handleLoginClick}
              className="text-sm px-3 sm:px-4"
            >
              {isLoggedIn ? "Logout" : "Login"}
            </Button>
          </div>
        </div>

        {/* Second row: Navigation Links - Only visible on mobile/tablet */}
        <div className="lg:hidden border-t overflow-x-auto scrollbar-hide">
          <nav className="flex items-center gap-1 py-2">
            <Button
              variant="ghost"
              onClick={handleMyLearningsClick}
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              My Learnings
            </Button>
            <Button
              variant="ghost"
              onClick={handleMySubmissionsClick}
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              My Submissions
            </Button>

            {/* Share With Others Custom Dropdown */}
            <div
              className="relative"
              ref={mobileDropdownRef}
              onMouseEnter={() => setIsMobileDropdownOpen(true)}
              onMouseLeave={() =>
                setIsMobileDropdownOpen(false)
              }
            >
              <Button
                variant="ghost"
                className="text-xs sm:text-sm whitespace-nowrap flex items-center gap-1"
              >
                Share
                <ChevronDown className="h-3 w-3" />
              </Button>

              {isMobileDropdownOpen && (
                <div className="absolute top-full left-0 pt-2 w-56 z-[100]">
                  <div className="bg-white border border-gray-200 rounded-md shadow-lg">
                    <div className="py-1">
                      <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          handleShareResourceClick();
                          setIsMobileDropdownOpen(false);
                        }}
                      >
                        Learning Resource
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          handleCreateTrackClick();
                          setIsMobileDropdownOpen(false);
                        }}
                      >
                        Learning Track
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Add Resource Dialog */}
      <ShareLearningResource
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
      />

      {/* Login Dialog */}
      <UserTypeDialog
        open={isLoginDialogOpen}
        onOpenChange={setIsLoginDialogOpen}
        onSelectUserType={handleLoginSuccess}
      />
    </header>
  );
}