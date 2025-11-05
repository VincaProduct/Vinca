
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Check } from "lucide-react";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail("");
      }, 3000);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-display text-primary">
          <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
          Stay Updated
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        {!isSubscribed ? (
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Get weekly insights on financial markets, investment strategies, and retirement planning delivered to your inbox.
            </p>
            <div className="space-y-2 sm:space-y-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-primary/30 focus:border-primary bg-background text-sm sm:text-base"
                required
              />
              <Button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base"
              >
                Subscribe Now
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              No spam. Unsubscribe anytime.
            </p>
          </form>
        ) : (
          <div className="text-center py-4 sm:py-6 animate-fade-in">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Check className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-primary mb-2">Thank You!</h3>
            <p className="text-sm text-muted-foreground">
              You're now subscribed to our newsletter.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsletterSignup;
