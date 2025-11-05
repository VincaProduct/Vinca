
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ServiceCardProps {
  title: string;
  description: string;
  features: string[];
  icon: string;
  index: number;
}

export const ServiceCard = ({ title, description, features, icon, index }: ServiceCardProps) => {
  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 bg-background animate-fade-in"
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-start space-x-4">
          <div className="text-2xl sm:text-3xl group-hover:animate-float flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl font-display font-semibold mb-2">
              {title}
            </CardTitle>
            <p className="text-muted-foreground text-sm sm:text-base">
              {description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-3 text-foreground">Key Services:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                  <span className="break-words">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
