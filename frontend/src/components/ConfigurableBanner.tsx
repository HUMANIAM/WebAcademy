import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { ResourceRead } from "../types/resource";

export type BannerType = "error" | "duplicate" | "info";

interface ConfigurableBannerProps {
  type: BannerType;
  title?: string;
  message: string;
  resource?: ResourceRead;
  onConfirm?: () => void;
  onDismiss: () => void;
}

export function ConfigurableBanner({
  type,
  title,
  message,
  resource,
  onConfirm,
  onDismiss,
}: ConfigurableBannerProps) {
  const getBannerStyles = () => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-200";
      case "duplicate":
        return "bg-blue-50 border-blue-200";
      case "info":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getTextStyles = () => {
    switch (type) {
      case "error":
        return "text-red-900";
      case "duplicate":
        return "text-blue-900";
      case "info":
        return "text-green-900";
      default:
        return "text-gray-900";
    }
  };

  const getButtonStyles = (variant: "primary" | "secondary") => {
    switch (type) {
      case "error":
        return variant === "primary" 
          ? "bg-red-600 hover:bg-red-700 text-white"
          : "border-red-300 text-red-700 hover:bg-red-50";
      case "duplicate":
        return variant === "primary"
          ? "bg-blue-600 hover:bg-blue-700 text-white"
          : "border-blue-300 text-blue-700 hover:bg-blue-50";
      case "info":
        return variant === "primary"
          ? "bg-green-600 hover:bg-green-700 text-white"
          : "border-green-300 text-green-700 hover:bg-green-50";
      default:
        return variant === "primary"
          ? "bg-gray-600 hover:bg-gray-700 text-white"
          : "border-gray-300 text-gray-700 hover:bg-gray-50";
    }
  };

  return (
    <Alert className={`mb-4 ${getBannerStyles()}`}>
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {title && (
              <p className={`font-medium ${getTextStyles()} mb-1`}>
                {title}
              </p>
            )}
            
            {type === "duplicate" && resource && (
              <>
                <p className={`${getTextStyles()} text-sm mb-2`}>
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {resource.title}
                  </a>
                  {resource.author && (
                    <span className="text-blue-900"> by {resource.author}</span>
                  )}
                </p>
              </>
            )}
            
            <p className={`${type === "error" ? "text-red-700" : type === "duplicate" ? "text-blue-700" : "text-green-700"} text-sm`}>
              {message}
            </p>
          </div>
          
          <div className="flex gap-2 ml-4">
            {type === "duplicate" && onConfirm && (
              <Button
                size="sm"
                onClick={onConfirm}
                className={getButtonStyles("primary")}
              >
                Yes
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={onDismiss}
              className={getButtonStyles("secondary")}
            >
              {type === "duplicate" ? "No" : "Dismiss"}
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
