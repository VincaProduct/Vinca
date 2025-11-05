
import { CheckCircle, ArrowLeft, Mail, Phone, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const ThankYou = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8 animate-fade-in">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">
            Thank You!
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            We've received your consultation request and appreciate your interest in our wealth management services.
          </p>
        </div>

        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <h2 className="text-2xl font-semibold">What Happens Next?</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-4 text-left">
              <Mail className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Confirmation Email</h3>
                <p className="text-muted-foreground">
                  You'll receive a confirmation email shortly with the details of your request.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 text-left">
              <Clock className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Quick Response</h3>
                <p className="text-muted-foreground">
                  Our team will review your information and contact you within 24 hours.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 text-left">
              <Phone className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Personal Consultation</h3>
                <p className="text-muted-foreground">
                  We'll schedule a complimentary consultation to discuss your financial goals and how we can help.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 animate-fade-in">
          <p className="text-muted-foreground">
            In the meantime, feel free to explore our resources or return to our homepage.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            
            <Button variant="outline" asChild size="lg">
              <Link to="/blog">
                Explore Our Blog
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border animate-fade-in">
          <p className="text-sm text-muted-foreground">
            Have questions? Contact us directly at{" "}
            <a href="mailto:contact@vincawealth.com" className="text-primary hover:underline">
              contact@vincawealth.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
