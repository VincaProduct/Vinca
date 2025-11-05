
import CredentialsGrid from "@/components/about/CredentialsGrid";
import StatsSection from "@/components/about/StatsSection";
import TestimonialsGrid from "@/components/about/TestimonialsGrid";
import TrustIndicators from "@/components/about/TrustIndicators";

const AboutSection = () => {
  return (
    <section id="about" className="py-12 sm:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4 sm:mb-6 text-foreground px-2">
            Trusted by Thousands, Backed by Excellence
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            With over 15 years of experience and industry-leading credentials, 
            we combine traditional financial expertise with innovative AI technology.
          </p>
        </div>

        <CredentialsGrid />
        <StatsSection />
        <TestimonialsGrid />
        <TrustIndicators />
      </div>
    </section>
  );
};

export default AboutSection;
