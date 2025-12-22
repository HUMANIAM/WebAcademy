import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  continueButtonText?: string;
}

export function UnsavedChangesDialog({ 
  open, 
  onOpenChange, 
  onDiscard,
  continueButtonText = "Continue editing"
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to discard your changes? Any changes you made will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            {continueButtonText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDiscard}
            className="bg-red-600 hover:bg-red-700"
          >
            Discard
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
