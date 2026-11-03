import RealWorthCalculator from '@/components/real-worth/RealWorthCalculator';

/** Real Worth Calculator inside the dashboard, starting from the client's own plan */
const DashboardRealWorthPage = () => (
  <div className="py-6">
    <RealWorthCalculator mode="dashboard" />
  </div>
);

export default DashboardRealWorthPage;
