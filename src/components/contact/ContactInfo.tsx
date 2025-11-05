import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ContactInfo = () => {
  return (
    <div className="space-y-8 animate-slide-in-right">
      <Card className="border-2 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-xl font-display font-semibold">
            🎯 What to Expect
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold mt-1">
                1
              </div>
              <div>
                <h4 className="font-medium">Initial Assessment</h4>
                <p className="text-sm text-muted-foreground">
                  We'll review your current financial situation and goals
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold mt-1">
                2
              </div>
              <div>
                <h4 className="font-medium">Strategy Development</h4>
                <p className="text-sm text-muted-foreground">
                  Custom financial strategy based on your unique needs
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold mt-1">
                3
              </div>
              <div>
                <h4 className="font-medium">Implementation Plan</h4>
                <p className="text-sm text-muted-foreground">
                  Clear next steps to achieve your financial goals
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl font-display font-semibold">
            📞 Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Phone</h4>
              <p className="text-primary font-medium">+91 7386809164</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Email</h4>
              <p className="text-primary font-medium">
                support@vincawealth.com
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Office Hours</h4>
              <p className="text-muted-foreground">
                Monday - Friday: 8:00 AM - 6:00 PM
              </p>
              <p className="text-muted-foreground">
                Saturday: 9:00 AM - 2:00 PM
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactInfo;
