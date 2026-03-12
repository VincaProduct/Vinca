
import { ServiceCard } from "@/components/services/ServiceCard";
import ServicesCTA from "@/components/services/ServicesCTA";

const ServicesSection = () => {
  const services = [
    {
      title: 'Financial Freedom planning',
      description: 'Comprehensive financial freedom strategies tailored to your lifestyle goals and timeline.',
      features: ['Personalised roadmap', 'Estimating the requirement', 'Investment plan', 'Income Replacement Strategy'],
      icon: '🏖️'
    },
    {
      title: 'Investment Management',
      description: 'Professional portfolio management with personalized asset allocation and risk management.',
      features: ['Portfolio Construction', 'Risk Assessment', 'Tax-Loss Harvesting', 'Rebalancing Strategy'],
      icon: '📈'
    },
    {
      title: 'Financial Freedom Planning',
      description: 'Holistic financial planning covering all aspects of your financial life.',
      features: ['Goal Setting', 'Cash Flow Analysis', 'Insurance Review', 'Estate Planning'],
      icon: '📋'
    },
    {
      title: 'Tax Optimization',
      description: 'Strategic tax planning to minimize your tax burden and maximize wealth accumulation.',
      features: ['Tax-Efficient Investing', 'Charitable Strategies', 'Business Tax Planning', 'Retirement Distributions'],
      icon: '💰'
    }
  ];

  return (
    <section id="services" className="py-12 sm:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4 sm:mb-6 text-foreground px-2">
            Comprehensive Wealth Management Services
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            From retirement planning to investment management, we provide the expertise and 
            personalized strategies you need to achieve your financial goals.
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
