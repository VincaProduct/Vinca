import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
// import MutualFundMistakesSection from "@/components/MutualFundMistakesSection";
import WealthSystemSection from "@/components/WealthSystemSection";
// import AIToolsSection from "@/components/AIToolsSection";
import ServicesSection from "@/components/ServicesSection";
import BlogSection from "@/components/BlogSection";
import AboutSection from "@/components/AboutSection";
// import ContactSection from "@/components/ContactSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/faq/FAQSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      {/* <MutualFundMistakesSection /> */}
      <WealthSystemSection />
      {/* <AIToolsSection /> */}
      <ServicesSection />
      <BlogSection />
      {/* <AboutSection /> */}
      {/* <ContactSection /> */}
      <TestimonialsSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;
