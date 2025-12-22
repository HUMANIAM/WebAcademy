import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DropdownProps } from "../../types";

export function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
  showSearch = false,
  mode = "multi",
  required = false,
  placeholder,
  allowCustomValues = false,
  onSearchChange,
  isLoading = false,
  disabled = false,
}: DropdownProps & { 
  mode?: "multi" | "single";
  required?: boolean;
  placeholder?: string;
  allowCustomValues?: boolean;
}) {
  // If disabled, don't allow opening dropdown
  if (disabled) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between opacity-50 cursor-not-allowed"
          disabled
        >
          <span className="truncate">
            {selected.length > 0 ? selected.join(", ") : placeholder || `Select ${label.toLowerCase()}`}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0" />
        </Button>
      </div>
    );
  }
  const isAsyncSearch = !!onSearchChange;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [announcement, setAnnouncement] = useState("");

  // Filter options based on search term (skip local filtering if async search)
  const filteredOptions = showSearch && !isAsyncSearch
    ? options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Handle toggle with announcement for screen readers
  const handleToggleWithAnnouncement = (option: string) => {
    const willBeSelected = !selected.includes(option);
    onToggle(option);
    
    if (mode === "multi") {
      setAnnouncement(`${option} ${willBeSelected ? 'checked' : 'unchecked'}`);
      // Clear announcement after it's been read
      setTimeout(() => setAnnouncement(""), 1000);
    }
  };

  // Apply special styling for "Track" filter
  const buttonClassName =
    label === "Track" && selected.length === 0
      ? "gap-2 bg-blue-50 hover:bg-blue-100"
      : "gap-2";

  // Determine placeholder text based on label
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    if (label === "Track" || label === "Tracks") return "Type Track";
    if (label === "Skill" || label === "Skills") return "Type Skill";
    return `Search ${label}`;
  };

  // Handle selection for single-select mode
  const handleSingleSelect = (option: string) => {
    onToggle(option);
    setSearchTerm("");
  };

  // Display placeholder text for single-select mode
  const getSingleSelectDisplay = () => {
    if (selected.length > 0) {
      // Capitalize first letter for single-select items
      return selected[0].charAt(0).toUpperCase() + selected[0].slice(1);
    }
    // Capitalize the label when nothing is selected
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  // Handle keyboard navigation for multi-select
  const handleKeyDown = (e: React.KeyboardEvent, option: string, index: number) => {
    if (mode !== "multi") return;

    switch (e.key) {
      case " ":
      case "Enter":
        e.preventDefault();
        handleToggleWithAnnouncement(option);
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex(Math.min(index + 1, filteredOptions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex(Math.max(index - 1, 0));
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  // Reset focused index when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  // Auto-focus the focused option
  useEffect(() => {
    if (focusedIndex >= 0 && isOpen) {
      const focusedElement = document.getElementById(`option-${label}-${focusedIndex}`);
      focusedElement?.focus();
    }
  }, [focusedIndex, isOpen, label]);

  // Handle adding custom option when user types and clicks "+ add"
  const handleAddCustomOption = () => {
    const customOption = searchTerm.trim();
    if (customOption) {
      handleToggleWithAnnouncement(customOption);
      setSearchTerm("");
      if (mode === "single") {
        setIsOpen(false);
      }
    }
  };

  // Render functions for better organization
  const renderLiveRegion = () => (
    <div 
      className="sr-only" 
      role="status" 
      aria-live="polite" 
      aria-atomic="true"
    >
      {announcement}
    </div>
  );

  const renderSingleSelectButton = () => (
    <>
      <span className="text-gray-900">
        {getSingleSelectDisplay()}
      </span>
      {required && <span className="text-red-500 ml-1">*</span>}
      <ChevronDown className="h-4 w-4 ml-2" />
    </>
  );

  const renderMultiSelectButton = () => (
    <>
      <span className="text-gray-900">
        {label}
      </span>
      {required && <span className="text-red-500 ml-1">*</span>}
      {selected.length > 0 && (
        <span className="ml-1 bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs">
          {selected.length}
        </span>
      )}
      <ChevronDown className="h-4 w-4 ml-2" />
    </>
  );

  const renderDropdownButton = () => (
    <Button
      type="button"
      variant="outline"
      className="gap-2 w-full justify-center"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-label={
        mode === "multi" && selected.length > 0
          ? `${label}, ${selected.length} ${selected.length === 1 ? 'item' : 'items'} selected`
          : mode === "single" && selected.length > 0
          ? `${label}, ${selected[0]} selected`
          : label
      }
    >
      {mode === "single" ? renderSingleSelectButton() : renderMultiSelectButton()}
    </Button>
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const renderSearchInput = () => (
    <div className="sticky top-0 bg-white p-4 pb-3 border-b z-10">
      <div className="relative min-w-[200px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={getPlaceholder()}
          className="pl-10 pr-10"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Search ${label}`}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );

  const renderMultiSelectOption = (option: string, index: number) => (
    <>
      <div 
        className={`h-4 w-4 flex-shrink-0 border-2 rounded flex items-center justify-center ${
          selected.includes(option) ? "border-blue-600 bg-blue-600" : "border-gray-400"
        }`}
        aria-hidden="true"
      >
        <Check
          className={`h-3 w-3 ${
            selected.includes(option) ? "opacity-100 text-white" : "opacity-0"
          }`}
        />
      </div>
      <span className="cursor-pointer whitespace-nowrap">
        {option}
      </span>
    </>
  );

  const renderSingleSelectOption = (option: string) => (
    <>
      <Check
        className={`h-4 w-4 flex-shrink-0 ${
          selected.includes(option) ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />
      <span className="whitespace-nowrap">{option}</span>
    </>
  );

  const renderOption = (option: string, index: number) => (
    <div
      key={option}
      className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
      onClick={() => mode === "single" ? handleSingleSelect(option) : handleToggleWithAnnouncement(option)}
      role={mode === "multi" ? "checkbox" : "option"}
      aria-checked={mode === "multi" ? selected.includes(option) : undefined}
      aria-selected={mode === "single" ? selected.includes(option) : undefined}
      id={`option-${label}-${index}`}
      tabIndex={mode === "multi" ? 0 : -1}
      onKeyDown={(e) => handleKeyDown(e, option, index)}
      aria-label={mode === "multi" ? `${option}, ${selected.includes(option) ? 'checked' : 'unchecked'}` : option}
    >
      {mode === "multi" ? renderMultiSelectOption(option, index) : renderSingleSelectOption(option)}
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex items-center space-x-2 p-1 rounded whitespace-nowrap text-gray-500">
      {showSearch && searchTerm.trim() && allowCustomValues ? (
        <span className="whitespace-nowrap text-blue-600 cursor-pointer hover:underline" onClick={handleAddCustomOption}>
          + add &quot;{searchTerm.trim()}&quot;
        </span>
      ) : (
        <span className="whitespace-nowrap">No options found</span>
      )}
    </div>
  );

  // Check if the exact search term already exists in options (case-insensitive)
  const searchTermExists = searchTerm.trim() && 
    filteredOptions.some(opt => opt.toLowerCase() === searchTerm.trim().toLowerCase());

  const renderAddCustomOption = () => {
    if (!allowCustomValues || !searchTerm.trim() || searchTermExists) return null;
    return (
      <div 
        className="flex items-center space-x-2 p-1 rounded whitespace-nowrap text-blue-600 cursor-pointer hover:bg-blue-50"
        onClick={handleAddCustomOption}
      >
        + add &quot;{searchTerm.trim()}&quot;
      </div>
    );
  };

  const renderOptionsList = () => (
    <div className={`p-4 space-y-2 max-h-60 overflow-y-auto ${showSearch ? 'pt-3' : ''}`}>
      {filteredOptions.length > 0 
        ? (
          <>
            {filteredOptions.map((option, index) => renderOption(option, index))}
            {renderAddCustomOption()}
          </>
        )
        : renderEmptyState()
      }
    </div>
  );

  const renderDropdownMenu = () => (
    <div className="absolute left-1/2 transform -translate-x-1/2 pt-2 z-50 min-w-max">
      <div className="bg-white border rounded-md shadow-lg">
        {showSearch && renderSearchInput()}
        {renderOptionsList()}
      </div>
    </div>
  );

  return (
    <div 
      className="relative" 
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {renderLiveRegion()}
      {renderDropdownButton()}
      {isOpen && renderDropdownMenu()}
    </div>
  );
}
