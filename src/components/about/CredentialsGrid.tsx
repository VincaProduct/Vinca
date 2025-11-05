
import { Card, CardContent } from "@/components/ui/card";

const CredentialsGrid = () => {
  const credentials = [
    { title: 'CFP®', description: 'Certified Financial Planner' },
    { title: 'CFA', description: 'Chartered Financial Analyst' },
    { title: 'FINRA', description: 'Series 7 & 66 Licensed' },
    { title: 'SEC', description: 'Registered Wealth manager' }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
      {credentials.map((cred, index) => (
        <Card 
          key={cred.title}
          className="text-center p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardContent className="p-0">
            <div className="text-xl sm:text-2xl font-bold text-primary mb-2">{cred.title}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">{cred.description}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CredentialsGrid;
