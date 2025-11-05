import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface HandoffButtonProps {
  url?: string;
  children?: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  onHandoff?: () => void;
}

export const HandoffButton = ({ 
  url, 
  children = "Proceed via Authorized Partner", 
  className,
  size = "default",
  variant = "outline",
  onHandoff
}: HandoffButtonProps) => {
  const handleClick = () => {
    // Track the handoff event
    if (onHandoff) {
      onHandoff();
    }
    
    // In a real implementation, this would redirect to the partner URL
    if (url) {
      console.log(`Redirecting to authorized partner: ${url}`);
      // window.open(url, '_blank');
    } else {
      console.log('Proceeding via Authorized Partner');
    }
  };

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`flex items-center gap-2 ${className}`}
    >
      <ExternalLink className="w-4 h-4" />
      {children}
    </Button>
  );
};