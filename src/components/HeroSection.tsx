import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center justify-center px-6 lg:px-16 py-20" style={{ background: '#FAFAF8' }}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 60% 40%, hsl(158 64% 52% / 0.05) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 30% 70%, hsl(158 64% 52% / 0.03) 0%, transparent 60%)',
            animation: 'heroPulse 4s ease-in-out infinite',
          }}
        />
        {/* Floating circles */}
        <div className="absolute rounded-full" style={{ width: 320, height: 320, top: '10%', right: '8%', background: 'hsl(158 64% 52% / 0.03)', animation: 'float 6s ease-in-out infinite' }} />
        <div className="absolute rounded-full" style={{ width: 200, height: 200, bottom: '15%', left: '5%', background: 'hsl(158 64% 52% / 0.03)', animation: 'float 8s ease-in-out infinite reverse' }} />
        <div className="absolute rounded-full" style={{ width: 120, height: 120, top: '50%', right: '25%', background: 'hsl(158 64% 52% / 0.02)', animation: 'float 5s ease-in-out infinite 1s' }} />
      </div>

      {/* Centre content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        <div className="space-y-4 mb-10">
          <h1 className="font-bold leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <span className="block" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#111827' }}>
              Are you on track for
            </span>
            <span className="block" style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)', color: 'hsl(158 64% 42%)' }}>
              Financial Freedom?
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: '#6B7280', fontWeight: 500 }}>
            Find out in 2 minutes — free
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={() => navigate('/financial-freedom-calculator')}
            size="lg"
            style={{
              borderRadius: 12,
              padding: '16px 32px',
              fontWeight: 600,
              fontSize: 16,
              height: 'auto',
              transition: 'all 0.2s ease',
            }}
            className="shadow-lg hover:shadow-xl"
          >
            Calculate My Freedom Score
          </Button>
          <p style={{ fontSize: 14, color: '#6B7280' }}>
            Used by investors across India to find their retirement gap.
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        style={{ animation: 'scrollBounce 2s ease-in-out infinite' }}
      >
        <ChevronDown style={{ width: 20, height: 20, color: '#9CA3AF' }} />
      </div>

      <style>{`
        @keyframes heroPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.03); }
        }
        @keyframes scrollBounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(6px); }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
