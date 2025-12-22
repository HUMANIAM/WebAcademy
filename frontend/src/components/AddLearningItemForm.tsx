import { useEffect } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { FilterDropdown } from "./shared/FilterDropdown";
import { PlatformAuthorFields } from "./shared/PlatformAuthorFields";
import { ImageUploader } from "./shared/ImageUploader";
import { useSkillSearch } from "../hooks/useSkillSearch";
import {
  LEARNING_LEVELS,
  LEARNING_MEDIUMS,
} from "../constants";

/** Shared form data structure for both Track and Resource forms */
export interface LearningItemFormData {
  title: string;
  description: string;
  image: string;
  level: string;
  skills: string[];
  platform: string;
  author: string;
  estimatedTimeMin: string;
  estimatedTimeMax: string;
  estimatedTimeUnit: string;
  // Resource-specific (optional for tracks)
  medium?: string;
  url?: string;
}

/** Empty form data constant */
export const emptyLearningItemFormData: LearningItemFormData = {
  title: "",
  description: "",
  image: "",
  level: "",
  skills: [],
  platform: "",
  author: "",
  estimatedTimeMin: "",
  estimatedTimeMax: "",
  estimatedTimeUnit: "",
  medium: "",
  url: "",
};

interface AddLearningItemFormProps {
  // Simplified: single formData object + setter
  formData: LearningItemFormData;
  setFormData: (data: LearningItemFormData) => void;

  // Image handling
  activeImageTab?: "url" | "upload";
  onImageTabChange?: (tab: "url" | "upload") => void;

  // Labels (customizable)
  titleLabel?: string;
  descriptionLabel?: string;
  imageLabel?: string;
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;

  // Show/hide fields
  showEstimatedTime?: boolean;
  showImage?: boolean;
  showResourceType?: boolean;
  showPlatform?: boolean;
  showAuthor?: boolean;
  
  // Form state
  disabled?: boolean; // When true, all fields are disabled
}

export function AddLearningItemForm({
  formData,
  setFormData,
  activeImageTab = "url",
  onImageTabChange,
  titleLabel = "Title *",
  descriptionLabel = "Description *",
  imageLabel = "Image",
  titlePlaceholder = "e.g., Full Stack Web Development",
  descriptionPlaceholder = "Describe what learners will achieve...",
  showEstimatedTime = true,
  showImage = true,
  showResourceType = false,
  showPlatform = false,
  showAuthor = false,
  disabled = false,
}: AddLearningItemFormProps) {

  // Helper to update a single field
  const updateField = <K extends keyof LearningItemFormData>(field: K, value: LearningItemFormData[K]) => {
    setFormData({ ...formData, [field]: value });
  };
  
  // Skill search hook - same as home page filter
  const { results: skillResults, isLoading: skillsLoading, search: searchSkills, fetchInitial: fetchInitialSkills } = useSkillSearch();
  
  // Fetch initial skills on mount
  useEffect(() => {
    fetchInitialSkills();
  }, [fetchInitialSkills]);
  
  // Combine API results with already selected skills (so selected ones always show)
  const skillOptions = [...new Set([...formData.skills, ...skillResults])];

  const handleSkillToggle = (skill: string) => {
    if (formData.skills.includes(skill)) {
      updateField('skills', formData.skills.filter((s: string) => s !== skill));
    } else {
      updateField('skills', [...formData.skills, skill]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">{titleLabel}</Label>
        <Input
          id="title"
          required
          placeholder={titlePlaceholder}
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          disabled={disabled}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">{descriptionLabel}</Label>
        <Textarea
          id="description"
          required
          placeholder={descriptionPlaceholder}
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={6}
          disabled={disabled}
        />
      </div>

      {/* Resource Type | Level | Skills row */}
      <div className={`grid gap-4 ${showResourceType ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {/* Resource Type (only for resources) */}
        {showResourceType && (
          <FilterDropdown
            label="Resource Type"
            options={Array.from(LEARNING_MEDIUMS)}
            selected={formData.medium ? [formData.medium] : []}
            onToggle={(value) => updateField('medium', value)}
            mode="single"
            required
            disabled={disabled}
          />
        )}

        {/* Level */}
        <FilterDropdown
          label="Level"
          options={Array.from(LEARNING_LEVELS)}
          selected={formData.level ? [formData.level] : []}
          onToggle={(value) => updateField('level', value)}
          mode="single"
          required
          disabled={disabled}
        />

        {/* Skills */}
        <FilterDropdown
          label="Skills"
          options={skillOptions}
          selected={formData.skills}
          onToggle={handleSkillToggle}
          showSearch
          allowCustomValues
          mode="multi"
          required
          placeholder="Type to search skills..."
          onSearchChange={searchSkills}
          isLoading={skillsLoading}
          disabled={disabled}
        />
      </div>

      {/* Platform | Author */}
      {(showPlatform || showAuthor) && (
        <PlatformAuthorFields
          platform={formData.platform}
          author={formData.author}
          onPlatformChange={(value) => updateField('platform', value)}
          onAuthorChange={(value) => updateField('author', value)}
          disabled={disabled}
        />
      )}

      {/* Estimated Time */}
      {showEstimatedTime && (
        <div className="space-y-3">
          <Label htmlFor="estimatedTime">Estimated Time</Label>
          <p className="text-xs text-gray-500">
            Fill at least one value (min or max). 0 is a valid value.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <div className="text-center text-sm font-medium text-gray-700">Min</div>
              <Input
                id="estimatedTimeMin"
                type="number"
                min="0"
                placeholder="0"
                value={formData.estimatedTimeMin}
                onChange={(e) => updateField('estimatedTimeMin', e.target.value)}
                className="text-center"
                disabled={disabled}
              />
            </div>
            <div className="space-y-1">
              <div className="text-center text-sm font-medium text-gray-700">Max</div>
              <Input
                id="estimatedTimeMax"
                type="number"
                min="0"
                placeholder="0"
                value={formData.estimatedTimeMax}
                onChange={(e) => updateField('estimatedTimeMax', e.target.value)}
                className="text-center"
                disabled={disabled}
              />
            </div>
            <div className="space-y-1">
              <div className="text-center text-sm font-medium text-gray-700">Unit</div>
              <Select
                value={formData.estimatedTimeUnit}
                onValueChange={(value) => updateField('estimatedTimeUnit', value)}
                disabled={disabled}
              >
                <SelectTrigger id="estimatedTimeUnit" className="justify-center">
                  <SelectValue placeholder="Weeks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                  <SelectItem value="years">Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Image */}
      {showImage && (
        <ImageUploader
          image={formData.image}
          activeTab={activeImageTab}
          onImageChange={(value) => updateField('image', value)}
          onTabChange={onImageTabChange}
          label={imageLabel}
          disabled={disabled}
        />
      )}
    </div>
  );
}