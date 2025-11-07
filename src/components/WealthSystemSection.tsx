
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Target,
  Lightbulb,
  TrendingUp,
  ArrowRight,
  Star,
} from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const WealthSystemSection = () => {
  const navigate = useNavigate();
  const steps = [
    {
      number: "01",
      icon: Target,
      title: "Personalized Blueprint",
      description: "We analyze your goals and create a tailored financial roadmap just for you.",
      highlight: "Custom Strategy",
    },
    {
      number: "02", 
      icon: Lightbulb,
      title: "Expert Portfolio",
      description: "Best fund selection based on data, not bias. Optimized for your success.",
      highlight: "Best Funds",
    },
    {
      number: "03",
      icon: TrendingUp,
      title: "Continuous Growth",
      description: "24/7 monitoring and optimization to keep your wealth on the right track.",
      highlight: "Always Optimized",
    },
  ];


  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Star className="w-4 h-4" />
            PROVEN SYSTEM
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Our Simple 3-Step
            <span className="text-primary block">Wealth Building Process</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your financial future with our systematic approach that has helped 500+ families achieve their wealth goals.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={index}
                className="animate-fade-in group"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <Card className="h-full bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    {/* Step Number & Icon */}
                    <div className="relative mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-8 h-8 text-primary" />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        {step.number}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-2">
                        {step.highlight}
                      </div>
                      
                      <h3 className="text-xl font-bold text-foreground">
                        {step.title}
                      </h3>
                      
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Arrow for non-last items */}
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Results & CTA */}
        <div className="text-center animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 mb-8 max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Families Served</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">15%</div>
                <div className="text-sm text-muted-foreground">Avg. Annual Returns</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">₹50L+</div>
                <div className="text-sm text-muted-foreground">Average Wealth Created</div>
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm italic">
              "Vinca Wealth with their excellent financial planning strategy has helped me to get better clarity on our Financial goals. They not only guided me on how much and where to invest, they also emphasised on the inflation adjusted returns."
              <span className="block text-primary font-semibold mt-1">- Kalyan, TCS, Assistant Consultant- C3A</span>
            </p>
          </div>

          <Button 
            onClick={() => navigate('/auth')}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 max-w-[280px]"
          >
            Start Your Wealth Journey
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WealthSystemSection;
