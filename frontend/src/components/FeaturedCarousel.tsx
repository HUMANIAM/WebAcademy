import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface Track {
  id: number;
  name: string;
  description: string;
}

// Static placeholder featured tracks
const FEATURED_TRACKS: Track[] = [
  {
    id: 1,
    name: "Full Stack Web Development",
    description: "Master modern web development from front-end to back-end with React, Node.js, and databases"
  },
  {
    id: 2,
    name: "Data Science Fundamentals",
    description: "Learn data analysis, visualization, and machine learning with Python and popular libraries"
  },
  {
    id: 3,
    name: "Cloud Architecture",
    description: "Design and deploy scalable cloud solutions using AWS, Azure, and modern DevOps practices"
  },
  {
    id: 4,
    name: "Mobile App Development",
    description: "Build cross-platform mobile applications with React Native and Flutter"
  }
];

interface FeaturedCarouselProps {
  onTrackSelect: (trackId: string, trackTitle?: string) => void;
}

export function FeaturedCarousel({
  onTrackSelect,
}: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Static data - will be replaced with backend API
  const featuredTracks = FEATURED_TRACKS;
  const loading = false;

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0
        ? featuredTracks.length - 1
        : prevIndex - 1,
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === featuredTracks.length - 1
        ? 0
        : prevIndex + 1,
    );
  };

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (!isPaused && featuredTracks.length > 0) {
      const interval = setInterval(() => {
        goToNext();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [currentIndex, isPaused, featuredTracks.length]);

  if (loading || featuredTracks.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-lg opacity-90">Loading featured tracks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div
        className="container mx-auto px-4 py-16 relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Academy Badge */}
        <div className="absolute left-4 top-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
          Provided by the WebAcademy
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Carousel Content */}
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl">
              {featuredTracks[currentIndex].name}
            </h2>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              {featuredTracks[currentIndex].description}
            </p>
            <div className="pt-4">
              <Button
                size="lg"
                variant="secondary"
                onClick={() =>
                  onTrackSelect(featuredTracks[currentIndex].id.toString())
                }
              >
                Explore Track
              </Button>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            aria-label="Previous track"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            aria-label="Next track"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {featuredTracks.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white w-8"
                    : "bg-white/50 w-2 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}