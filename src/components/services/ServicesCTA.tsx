
import { Button } from "@/components/ui/button";

const ServicesCTA = () => {
  return (
    <div className="text-center">
      <div className="bg-primary/10 rounded-xl p-6 sm:p-8 max-w-4xl mx-auto">
        <h3 className="text-xl sm:text-2xl font-display font-semibold mb-4 text-foreground">
          Ready to Start Your Wealth Building Journey?
        </h3>
        <p className="text-muted-foreground mb-6 text-base sm:text-lg px-2">
          Schedule a complimentary consultation to discuss your financial goals and 
          learn how our personalized strategies can help you achieve them.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => {
              const element = document.getElementById('contact');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
            size="lg" 
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 sm:px-8"
          >
            Schedule Free Consultation
          </Button>
          {/* <Button 
            variant="outline" 
            size="lg"
            className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-6 sm:px-8"
          >
            Download Service Guide
          </Button> */}
        </div>
      </div>
    </div>
  );
};

export default ServicesCTA;
