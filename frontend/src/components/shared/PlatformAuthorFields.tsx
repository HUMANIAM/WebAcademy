import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface PlatformAuthorFieldsProps {
  platform: string;
  author: string;
  onPlatformChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
  platformLabel?: string;
  authorLabel?: string;
  platformPlaceholder?: string;
  authorPlaceholder?: string;
  disabled?: boolean;
}

export function PlatformAuthorFields({
  platform,
  author,
  onPlatformChange,
  onAuthorChange,
  platformLabel = "Platform",
  authorLabel = "Author/Instructor",
  platformPlaceholder = "e.g., Coursera, Udemy",
  authorPlaceholder = "e.g., Ibrahim, Ertan",
  disabled = false,
}: PlatformAuthorFieldsProps) {
  
  const renderTextInput = (
    id: string,
    label: string,
    placeholder: string,
    value: string,
    onChange: (value: string) => void
  ) => (
    <div className="space-y-2">
      <div className="text-center text-sm font-medium text-gray-700 mb-1">{label}</div>
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-center placeholder:text-center"
        disabled={disabled}
      />
    </div>
  );

  const renderPlatformInput = () => renderTextInput(
    "platform",
    platformLabel,
    platformPlaceholder,
    platform,
    onPlatformChange
  );

  const renderAuthorInput = () => renderTextInput(
    "author",
    authorLabel,
    authorPlaceholder,
    author,
    onAuthorChange
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {renderPlatformInput()}
      {renderAuthorInput()}
    </div>
  );
}
