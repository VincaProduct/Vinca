
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AIToolCardProps {
  tool: {
    id: string;
    title: string;
    description: string;
    icon: string;
    features: string[];
    estimatedTime: string;
  };
  index: number;
  onToolSelect: (toolId: string) => void;
}

export const AIToolCard = ({ tool, index, onToolSelect }: AIToolCardProps) => {
  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 bg-card animate-fade-in"
      style={{ animationDelay: `${index * 0.2}s` }}
    >
      <CardHeader className="text-center p-4 sm:p-6">
        <div className="text-3xl sm:text-4xl mb-4 group-hover:animate-float">
          {tool.icon}
        </div>
        <CardTitle className="text-lg sm:text-xl font-display font-semibold mb-2">
          {tool.title}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm sm:text-base">
          {tool.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated time:</span>
            <span className="font-medium text-primary">{tool.estimatedTime}</span>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Features:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {tool.features.map((feature, idx) => (
                <li key={idx} className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <Button 
            onClick={() => onToolSelect(tool.id)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium group-hover:animate-pulse-glow"
          >
            Try This Tool
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
