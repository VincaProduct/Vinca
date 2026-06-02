
import { ServiceCard } from "@/components/services/ServiceCard";
import ServicesCTA from "@/components/services/ServicesCTA";

const ServicesSection = () => {
  const services = [
    {
      title: 'Retirement Planning',
      description: 'Know exactly when you can retire and what it will take to get there — with a score and a plan, not a guess.',
      features: ['Financial Freedom Readiness score', 'Retirement corpus estimation', 'SIP strategy and timeline', 'Retirement date projection'],
      icon: '🏖️'
    },
    {
      title: 'Mutual Fund Portfolio Management',
      description: 'Portfolio built for your retirement goal, actively monitored and rebalanced as markets move.',
      features: ['Goal-based portfolio construction', 'SIP setup and management', 'Regular portfolio rebalancing', 'Performance tracking'],
      icon: '📈'
    },
    {
      title: 'Insurance Planning',
      description: 'The two pillars that protect your retirement corpus — assessed, gap-identified, and sorted.',
      features: ['Life insurance adequacy check', 'Health insurance review', 'Coverage gap identification', 'Claim support at zero upfront cost'],
      icon: '🛡️'
    },
    {
      title: 'Compass — Dedicated Wealth Management',
      description: 'One expert who knows your complete financial picture and actively manages your retirement plan.',
      features: ['Dedicated wealth expert', 'Active portfolio oversight', 'Insurance and emergency fund coverage', 'Same-day responses'],
      icon: '🧭'
    }
  ];

  return (
    <section id="services" className="py-12 sm:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4 sm:mb-6 text-foreground px-2">
            Everything your retirement plan needs
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            From knowing your number to reaching it — Vinca covers the full journey to financial freedom.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {services.map((service, index) => (
            <ServiceCard
              key={service.title}
              title={service.title}
              description={service.description}
              features={service.features}
              icon={service.icon}
              index={index}
            />
          ))}
        </div>

        <ServicesCTA />
      </div>
    </section>
  );
};

export default ServicesSection;
