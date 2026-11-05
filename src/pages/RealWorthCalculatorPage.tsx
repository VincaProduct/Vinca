import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RealWorthCalculator from '@/components/real-worth/RealWorthCalculator';

/** Public Real Worth Calculator: no login, the full result is free */
const RealWorthCalculatorPage = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="pt-24 sm:pt-28">
      <RealWorthCalculator mode="public" />
    </main>
    <Footer />
  </div>
);

export default RealWorthCalculatorPage;
