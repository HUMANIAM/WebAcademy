import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Upload, Link, AlertCircle } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface ImageUploaderProps {
  // Current values
  image: string;
  activeTab?: "url" | "upload";
  
  // Handlers
  onImageChange: (value: string) => void;
  onTabChange?: (tab: "url" | "upload") => void;
  onRemoveImage?: () => void;
  
  // Validation
  imageUrlError?: string;
  isValidatingImage?: boolean;
  validatedImageUrl?: string;
  
  // Customization
  label?: string;
  urlPlaceholder?: string;
  showRemoveButton?: boolean;
  
  // Styling
  previewClassName?: string;
  containerClassName?: string;
  
  // Form state
  disabled?: boolean;
}

export function ImageUploader({
  image,
  activeTab = "upload",
  onImageChange,
  onTabChange,
  onRemoveImage,
  imageUrlError,
  isValidatingImage,
  validatedImageUrl,
  label = "Image",
  urlPlaceholder = "Enter image URL",
  showRemoveButton = true,
  previewClassName = "w-32 h-32 object-cover rounded border",
  containerClassName = "space-y-4",
  disabled = false,
}: ImageUploaderProps) {
  
  const handleImageUrlChange = (url: string) => {
    onImageChange(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={containerClassName}>
      <Label>{label}</Label>
      <Tabs
        value={activeTab}
        onValueChange={(value: string) =>
          onTabChange?.(value as "url" | "upload")
        }
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            URL
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="space-y-4">
          <Input
            placeholder={urlPlaceholder}
            value={image}
            onChange={(e) => handleImageUrlChange(e.target.value)}
            disabled={disabled}
          />
          {imageUrlError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {imageUrlError}
            </div>
          )}
          {isValidatingImage && (
            <p className="text-sm text-gray-500">Validating image...</p>
          )}
          {validatedImageUrl && (
            <div className="space-y-2">
              <p className="text-sm text-green-600">✓ Valid image URL</p>
              <ImageWithFallback
                src={validatedImageUrl}
                alt="Preview"
                className={previewClassName}
              />
              {showRemoveButton && onRemoveImage && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRemoveImage}
                >
                  Remove
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
          />
          {image && (
            <div className="space-y-2">
              <ImageWithFallback
                src={image}
                alt="Preview"
                className={previewClassName}
              />
              {showRemoveButton && onRemoveImage && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRemoveImage}
                >
                  Remove
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
