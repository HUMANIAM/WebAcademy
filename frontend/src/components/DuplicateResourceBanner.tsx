import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { ResourceRead } from "../types/resource";

interface DuplicateResourceBannerProps {
  resource: ResourceRead;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function DuplicateResourceBanner({
  resource,
  onConfirm,
  onDismiss,
}: DuplicateResourceBannerProps) {
  return (
    <Alert className="mb-4 bg-blue-50 border-blue-200">
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div className="flex-1">
          
            <p className="font-medium text-blue-900 mb-1">
              Is this the resource you want to add?&nbsp;  
              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                {resource.title}</a>{resource.author && (
                <span className="text-blue-900"> by {resource.author}</span>
              )}
            </p>

          </div>
          <div className="flex gap-2 ml-4">
            <Button
              size="sm"
              onClick={onConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Yes
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDismiss}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              No
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
