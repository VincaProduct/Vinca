
import { Button } from "@/components/ui/button";

const AIToolsCTA = () => {
  return (
    <div className="text-center">
      <div className="bg-primary/10 rounded-lg p-4 sm:p-6 max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold mb-2 text-foreground">
          🎯 Ready for Professional Guidance?
        </h3>
        <p className="text-muted-foreground mb-4 text-sm sm:text-base">
          Our AI tools provide insights, but our certified wealth managers provide the roadmap to your financial success.
        </p>
        <Button 
          onClick={() => {
            const element = document.getElementById('contact');
            if (element) element.scrollIntoView({ behavior: 'smooth' });
          }}
          variant="outline" 
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground w-full sm:w-auto"
        >
          Schedule Expert Consultation
        </Button>
      </div>
    </div>
  );
};

export default AIToolsCTA;
