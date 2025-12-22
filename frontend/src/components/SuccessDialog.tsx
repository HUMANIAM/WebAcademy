import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "./ui/alert-dialog";
import { Heart } from "lucide-react";

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "resource" | "track";
  status?: "under_review" | "published";
}

export function SuccessDialog({ open, onOpenChange, type, status = "under_review" }: SuccessDialogProps) {
  const isPublished = status === "published";
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <Heart className="h-8 w-8 text-green-600 fill-green-600" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">
            {isPublished 
              ? `Your learning ${type} has been published!`
              : "Thanks for sharing, we appreciate it!"
            }
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {isPublished 
              ? `Your learning ${type} is now live and available to all users.`
              : `We will notify you once your learning ${type} is approved.`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
