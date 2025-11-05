
import { useState } from "react";
import { AIToolCard } from "@/components/ai-tools/AIToolCard";
import AIToolsCTA from "@/components/ai-tools/AIToolsCTA";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";

const AIToolsSection = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const tools = [
    {
      id: 'retirement-calculator',
      title: 'Retirement Age Predictor',
      description: 'Calculate when you can retire based on your savings rate, income, and lifestyle goals.',
      icon: '🏖️',
      features: ['Income Analysis', 'Savings Projection', 'Goal Planning'],
      estimatedTime: '5 minutes'
    },
    {
      id: 'portfolio-analyzer',
      title: 'Investment Portfolio Analyzer',
      description: 'Get AI-powered insights on your investment portfolio with risk assessment and optimization tips.',
      icon: '📊',
      features: ['Risk Assessment', 'Diversification Analysis', 'Performance Review'],
      estimatedTime: '7 minutes'
    },
    {
      id: 'financial-scorecard',
      title: 'Financial Health Scorecard',
      description: 'Comprehensive evaluation of your financial wellness with personalized improvement recommendations.',
      icon: '💯',
      features: ['Debt Analysis', 'Emergency Fund Check', 'Credit Health'],
      estimatedTime: '10 minutes'
    }
  ];

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
  };

  return (
    <section id="ai-tools" className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4 sm:mb-6 text-foreground px-2">
            AI-Powered Financial Tools
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Get instant, personalized financial insights with our cutting-edge AI calculators. 
            Start your financial planning journey with these free tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {tools.map((tool, index) => (
            <AIToolCard
              key={tool.id}
              tool={tool}
              index={index}
              onToolSelect={handleToolSelect}
            />
          ))}
        </div>

        <AIToolsCTA />
      </div>

      <LeadCaptureModal 
        isOpen={!!selectedTool}
        onClose={() => setSelectedTool(null)}
        toolName={tools.find(t => t.id === selectedTool)?.title || ''}
      />
    </section>
  );
};

export default AIToolsSection;
