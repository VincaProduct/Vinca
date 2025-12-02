import { Calendar, Clock, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BookWealthManager = () => {

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Book a Wealth Manager</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Schedule a personalized consultation with our expert wealth managers
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Schedule Your Consultation</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full min-h-[600px] sm:min-h-[750px] relative">
                <iframe 
                  src="https://prudhvi-vincawealth.zohobookings.in/portal-embed#/182381000000140004" 
                  className="absolute inset-0 w-full h-full border-0"
                  title="Book Wealth Manager Consultation"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">What to Expect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Flexible Scheduling</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose a time that works best for you
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Video className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Virtual Meeting</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect via Google Meet from anywhere
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">60-Minute Session</h4>
                  <p className="text-sm text-muted-foreground">
                    In-depth consultation with our experts
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Premium Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>✓ Personalized wealth strategy</p>
              <p>✓ Portfolio optimization review</p>
              <p>✓ Tax-efficient planning</p>
              <p>✓ Retirement roadmap analysis</p>
              <p>✓ Priority support access</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookWealthManager;
