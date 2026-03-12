import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/30 min-h-screen flex flex-col lg:flex-row items-center justify-center gap-12 px-6 lg:px-16 py-20 lg:py-0">
      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0 opacity-[0.08] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--muted-foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--muted-foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />

      {/* Left content */}
      <div className="relative z-10 flex-1 flex flex-col items-start text-left max-w-xl">
        <div className="space-y-2 mb-8">
          <h1 className="font-bold leading-tight">
            <span className="text-3xl lg:text-5xl bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent block">
              Are you on track for
            </span>
            <span className="text-4xl lg:text-6xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent block">
              Financial Freedom?
            </span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground font-medium leading-relaxed pt-2">
            Find out in 2 minutes — free
          </p>
        </div>

        <div className="flex flex-col items-start gap-3">
          <Button
            onClick={() => navigate('/financial-freedom-calculator')}
            size="lg"
            className="text-lg font-semibold px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Calculate My Freedom Score
          </Button>
          <p className="text-sm text-muted-foreground">
            Join 60+ families already on their journey
          </p>
        </div>
      </div>

      {/* Right card */}
      <div className="relative z-10 flex-1 flex items-center justify-center lg:justify-end max-w-md w-full">
        <Card className="w-full max-w-sm bg-card border shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
          <CardContent className="p-6 space-y-5">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Your Financial Freedom Score</p>
            </div>
            <div className="text-center">
              <span className="text-6xl font-bold text-primary">72</span>
              <span className="text-2xl font-semibold text-muted-foreground"> / 100</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div className="bg-primary h-3 rounded-full" style={{ width: '72%' }} />
            </div>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full">
                On Track ✅
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center bg-muted/50 rounded-lg p-3">
                <div className="text-sm font-bold text-foreground">52</div>
                <div className="text-xs text-muted-foreground mt-0.5">Freedom Age</div>
              </div>
              <div className="text-center bg-muted/50 rounded-lg p-3">
                <div className="text-sm font-bold text-foreground">₹3.2Cr</div>
                <div className="text-xs text-muted-foreground mt-0.5">Corpus Goal</div>
              </div>
              <div className="text-center bg-muted/50 rounded-lg p-3">
                <div className="text-sm font-bold text-foreground">₹25K</div>
                <div className="text-xs text-muted-foreground mt-0.5">Monthly SIP</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">Based on sample inputs</p>
          </CardContent>
        </Card>
      </div>

    </section>
  );
};

export default HeroSection;
