import { Mail } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: () => void;
}

export function LoginDialog({ open, onOpenChange, onLogin }: LoginDialogProps) {
  const handleOutlookLogin = () => {
    // Open popup window to backend OAuth endpoint
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    // Create placeholder HTML page as a blob URL
    const placeholderHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authentication - WebAcademy</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            max-width: 400px;
            width: 100%;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }
        
        .icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 24px;
            background: #2563eb;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .icon svg {
            width: 32px;
            height: 32px;
            color: white;
        }
        
        h1 {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 16px;
            font-weight: 600;
        }
        
        p {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 32px;
        }
        
        button {
            background: #2563eb;
            color: white;
            border: none;
            padding: 12px 32px;
            font-size: 16px;
            font-weight: 500;
            border-radius: 8px;
            cursor: pointer;
            width: 100%;
            transition: background 0.2s;
        }
        
        button:hover {
            background: #1d4ed8;
        }
        
        button:active {
            transform: scale(0.98);
        }
        
        .note {
            margin-top: 24px;
            padding: 16px;
            background: #fef3c7;
            border-radius: 8px;
            font-size: 13px;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
        </div>
        
        <h1>Authentication Pending</h1>
        
        <p>
            Microsoft OAuth authentication will be implemented when the backend is ready. 
            For now, you can continue to explore WebAcademy with demo access.
        </p>
        
        <button onclick="handleLogin()">Go To WebAcademy</button>
        
        <div class="note">
            <strong>Note:</strong> This is a temporary authentication placeholder. 
            Full Microsoft OAuth integration coming soon.
        </div>
    </div>
    
    <script>
        function handleLogin() {
            // Send success message to parent window
            if (window.opener) {
                window.opener.postMessage({
                    type: 'oauth-success',
                    accessToken: 'demo-token-' + Date.now(),
                    user: {
                        email: 'demo@outlook.com',
                        name: 'Demo User'
                    }
                }, '*');
            }
            
            // Close the popup
            window.close();
        }
    </script>
</body>
</html>
    `;
    
    // Create blob URL from HTML
    const blob = new Blob([placeholderHTML], { type: 'text/html' });
    const authUrl = URL.createObjectURL(blob);
    
    const popup = window.open(
      authUrl,
      'Login with Outlook',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
    );
    
    // Listen for messages from the popup (OAuth callback)
    const messageHandler = (event: MessageEvent) => {
      // Verify the message origin in production
      // if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'oauth-success') {
        // Handle successful authentication
        const { accessToken, user } = event.data;
        
        // Store token (in production, use secure storage)
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Store userId and userEmail for access control
        localStorage.setItem('userId', user.email); // Use email as unique identifier
        localStorage.setItem('userEmail', user.email);
        
        // Close popup and login
        if (popup) popup.close();
        onLogin();
        onOpenChange(false);
        
        // Remove listener
        window.removeEventListener('message', messageHandler);
      } else if (event.data.type === 'oauth-error') {
        // Handle authentication error
        console.error('OAuth error:', event.data.error);
        if (popup) popup.close();
        window.removeEventListener('message', messageHandler);
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Check if popup was blocked
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      alert('Popup was blocked. Please allow popups for this site.');
      window.removeEventListener('message', messageHandler);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to WebAcademy</DialogTitle>
          <DialogDescription>
            Sign in to access your learning tracks and progress
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button 
            onClick={handleOutlookLogin}
            variant="outline"
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border-gray-300 h-12"
            size="lg"
          >
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
              <path d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
              <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
              <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
            </svg>
            <span className="text-gray-700">Continue with Google</span>
          </Button>
          
          <Button 
            onClick={handleOutlookLogin}
            variant="outline"
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border-gray-300 h-12"
            size="lg"
          >
            <svg width="20" height="20" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 42.667h170.667V213.333H0z" fill="#0072C6"/>
              <path d="M85.333 85.333c-23.573 0-42.666 19.093-42.666 42.667s19.093 42.667 42.666 42.667c23.574 0 42.667-19.094 42.667-42.667s-19.093-42.667-42.667-42.667z" fill="#FFF"/>
              <path d="M256 42.667h-85.333v42.666H256z" fill="#0364B8"/>
              <path d="M170.667 85.333H256v42.667h-85.333z" fill="#0078D4"/>
              <path d="M170.667 128H256v42.667h-85.333z" fill="#28A8EA"/>
              <path d="M170.667 170.667H256v42.666h-85.333z" fill="#0078D4"/>
              <path d="M170.667 213.333H256V256h-85.333z" fill="#0364B8"/>
            </svg>
            <span className="text-gray-700">Continue with Outlook</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}