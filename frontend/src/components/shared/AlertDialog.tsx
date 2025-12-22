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

export type AlertDialogType = "unsaved-changes" | "remove-resource" | "delete-draft" | "custom";

interface ConfigurableAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: AlertDialogType;
  title?: string;
  description?: string;
  cancelText?: string;
  actionText?: string;
  onAction: () => void;
  actionVariant?: "default" | "destructive";
}

const defaultConfigs = {
  "unsaved-changes": {
    title: "Unsaved Changes",
    description: "Are you sure you want to discard your changes? Any changes you made will be lost.",
    cancelText: "Continue editing",
    actionText: "Discard",
    actionVariant: "destructive" as const,
  },
  "remove-resource": {
    title: "Remove Resource?",
    description: "Are you sure you want to remove this resource from the track? This action cannot be undone.",
    cancelText: "Cancel",
    actionText: "Remove",
    actionVariant: "destructive" as const,
  },
  "delete-draft": {
    title: "Delete Draft Track",
    description: "Are you sure you want to delete this draft track? This action cannot be undone.",
    cancelText: "Cancel",
    actionText: "Delete",
    actionVariant: "destructive" as const,
  },
};

export function ConfigurableAlertDialog({
  open,
  onOpenChange,
  type = "custom",
  title,
  description,
  cancelText,
  actionText,
  onAction,
  actionVariant = "default",
}: ConfigurableAlertDialogProps) {
  const config = type !== "custom" ? defaultConfigs[type] : null;
  
  const finalTitle = title ?? config?.title ?? "";
  const finalDescription = description ?? config?.description ?? "";
  const finalCancelText = cancelText ?? config?.cancelText ?? "Cancel";
  const finalActionText = actionText ?? config?.actionText ?? "Confirm";
  const finalActionVariant = actionVariant ?? config?.actionVariant ?? "default";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{finalTitle}</AlertDialogTitle>
          <AlertDialogDescription>{finalDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            {finalCancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onAction}
            className={finalActionVariant === "destructive" ? "bg-red-600 hover:bg-red-700" : undefined}
          >
            {finalActionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
