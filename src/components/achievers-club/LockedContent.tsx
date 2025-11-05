import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles, Crown } from 'lucide-react';

interface LockedContentProps {
  title: string;
  description: string;
  requiredTier: 'premium' | 'client';
  onUpgrade: () => void;
}

const LockedContent = ({ title, description, requiredTier, onUpgrade }: LockedContentProps) => {
  return (
    <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-muted/50 to-background">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full" />
      <div className="absolute -top-4 -right-4">
        {requiredTier === 'client' ? (
          <Crown className="h-16 w-16 text-primary/20" />
        ) : (
          <Sparkles className="h-16 w-16 text-primary/20" />
        )}
      </div>
      
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl mb-1">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
            {requiredTier === 'client' ? 'Elite Only' : 'Premium Required'}
          </div>
        </div>
        
        <div className="pt-2">
          <Button onClick={onUpgrade} className="w-full" size="lg">
            <Sparkles className="mr-2 h-4 w-4" />
            Unlock {requiredTier === 'client' ? 'Elite Access' : 'Premium Features'}
          </Button>
        </div>
        
        <p className="text-xs text-center text-muted-foreground">
          {requiredTier === 'client' 
            ? 'Become a wealth management client for full VIP access'
            : 'Upgrade to premium membership to unlock this content'
          }
        </p>
      </CardContent>
    </Card>
  );
};

export default LockedContent;
