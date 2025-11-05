
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName: string;
}

export const LeadCaptureModal = ({ isOpen, onClose, toolName }: LeadCaptureModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock form submission
    console.log('Lead captured:', { ...formData, tool: toolName });
    
    toast({
      title: "Access Granted! 🎉",
      description: `Welcome ${formData.name}! You now have access to the ${toolName}. Check your email for detailed results.`,
    });

    setFormData({ name: '', email: '', phone: '' });
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background border border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-semibold text-center">
            🔓 Unlock Your {toolName}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Get instant access to personalized financial insights. Your information is secure and will never be shared.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number (Optional)
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your phone number"
              className="mt-1"
            />
          </div>

          <div className="bg-primary/5 rounded-lg p-4 text-sm text-muted-foreground">
            <div className="flex items-start space-x-2">
              <div className="text-primary mt-0.5">🛡️</div>
              <div>
                <p className="font-medium text-foreground mb-1">Your Privacy Matters</p>
                <p>We use your information solely to provide personalized financial insights and occasional updates about our services. No spam, ever.</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary-600 text-white"
            >
              Get My Results
            </Button>
          </div>
        </form>
        
        <p className="text-xs text-center text-muted-foreground mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </DialogContent>
    </Dialog>
  );
};
