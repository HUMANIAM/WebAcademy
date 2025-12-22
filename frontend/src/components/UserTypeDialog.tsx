import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface UserTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUserType: (userType: "admin" | "regular") => void;
}

export function UserTypeDialog({
  open,
  onOpenChange,
  onSelectUserType,
}: UserTypeDialogProps) {
  const handleUserTypeSelect = (userType: "admin" | "regular") => {
    // Use consistent user IDs for demo purposes
    const userId = userType === "admin" ? "admin-user" : "regular-user";
    const userEmail = userType === "admin" ? "admin@webacademy.com" : "user@webacademy.com";
    const userName = userType === "admin" ? "Admin User" : "Regular User";
    
    localStorage.setItem('userId', userId);
    localStorage.setItem('userEmail', userEmail);
    localStorage.setItem('userName', userName);
    
    onSelectUserType(userType);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select User Type</DialogTitle>
          <DialogDescription>
            Choose your user type for testing purposes
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <Button
            onClick={() => handleUserTypeSelect("admin")}
            className="w-full py-6 text-lg"
            variant="default"
          >
            Admin
          </Button>
          
          <Button
            onClick={() => handleUserTypeSelect("regular")}
            className="w-full py-6 text-lg"
            variant="outline"
          >
            Regular User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
