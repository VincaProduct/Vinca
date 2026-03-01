import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { LogOut, User, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMembership } from '@/hooks/useMembership';
import { useNavigate } from 'react-router-dom';

export function DashboardHeader() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { isPro } = useMembership();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex h-14 items-center justify-between px-3 sm:px-4 md:px-6 border-b border-border">
        <div className="flex items-center gap-2 sm:gap-4">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            <span className="hidden md:inline-block text-foreground truncate max-w-[120px] lg:max-w-[200px]">
              {user?.email}
            </span>
          </div>
          {!isPro && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => navigate('/dashboard/pricing')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap"
            >
              <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Join Membership</span>
              <span className="sm:hidden">Join</span>
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground hover:bg-accent h-8 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap"
          >
            <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
