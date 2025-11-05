import { useState } from 'react';
import { Calendar, Clock, Video, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const BookWealthManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate booking submission
    setTimeout(() => {
      setIsSubmitting(false);
      setBookingComplete(true);
      toast({
        title: "Booking Request Submitted",
        description: "Our wealth manager will contact you shortly to confirm your appointment.",
      });
    }, 1500);
  };

  if (bookingComplete) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Book a Wealth Manager</h1>
          <p className="text-muted-foreground mt-2">
            Schedule a personalized consultation with our expert wealth managers
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Booking Request Received!</h2>
            <p className="text-muted-foreground">
              Thank you for your interest. Our wealth manager will review your request and send you a Google Meet calendar invitation within 24 hours.
            </p>
            <p className="text-sm text-muted-foreground">
              You'll receive a confirmation email at <span className="font-medium text-foreground">{user?.email}</span>
            </p>
            <Button onClick={() => setBookingComplete(false)} className="mt-4">
              Schedule Another Meeting
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Book a Wealth Manager</h1>
        <p className="text-muted-foreground mt-2">
          Schedule a personalized consultation with our expert wealth managers
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Your Consultation</CardTitle>
              <CardDescription>
                Fill in your details and we'll send you a Google Meet calendar invitation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBooking} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user?.email || ''} required />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+91 XXXXX XXXXX" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred-time">Preferred Time Slot</Label>
                    <select 
                      id="preferred-time" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    >
                      <option value="">Select a time slot</option>
                      <option value="morning">Morning (9 AM - 12 PM)</option>
                      <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                      <option value="evening">Evening (4 PM - 7 PM)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultation-type">Consultation Type</Label>
                  <select 
                    id="consultation-type" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    <option value="">Select consultation type</option>
                    <option value="retirement">Retirement Planning</option>
                    <option value="investment">Investment Strategy</option>
                    <option value="tax">Tax Optimization</option>
                    <option value="estate">Estate Planning</option>
                    <option value="general">General Consultation</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Additional Information</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us about your financial goals or any specific topics you'd like to discuss..."
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Request Booking'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What to Expect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
