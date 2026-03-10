import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/contexts/AuthContext";
import { RazorpayProvider } from "@/contexts/RazorpayContext";
import { ReferralProvider } from "@/contexts/ReferralContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";
import Index from "./pages/Index";
import BlogsPage from "./pages/BlogsPage";
import ThankYou from "./pages/ThankYou";
import FinancialFreedomCalculator from "./pages/FinancialFreedomCalculator";
import AuthPage from "./components/auth/AuthPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Dashboard from "./pages/Dashboard";

import InvestmentOpportunities from "./pages/dashboard/InvestmentOpportunities";
import ReferFriend from "./pages/dashboard/ReferFriend";
import SupportPage from "./pages/dashboard/SupportPage";
import FinancialCalculatorPage from "./pages/dashboard/FinancialCalculatorPage";
import BookWealthManager from "./pages/dashboard/BookWealthManager";
import BlogCMSDashboard from "./pages/dashboard/BlogCMSDashboard";
import AuthorsDashboard from "./pages/dashboard/AuthorsDashboard";
import CTADashboardPage from "./pages/dashboard/CTADashboard";
import CTAPlacementPage from "./pages/dashboard/CTAPlacementPage";
import CTAAnalyticsPage from "./pages/dashboard/CTAAnalyticsPage";
import BookingsDashboard from "./pages/dashboard/BookingsDashboard";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

import FFRHome from "./pages/ffr/FFRHome";
import FFRChecklist from "./pages/ffr/FFRChecklist";
import FFROpportunities from "./pages/ffr/FFROpportunities";
import UnifiedFFRPage from "./pages/ffr/UnifiedFFRPage";
import AchieversClubLanding from "./pages/AchieversClubLanding";
import AchieversClubDashboard from "./pages/dashboard/AchieversClubDashboard";
import UpgradePage from "./pages/dashboard/UpgradePage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import PublicPricing from "./pages/PublicPricing";
import BuyMembership from "./pages/BuyMembership";
import DashboardBuyMembershipPage from "./pages/dashboard/BuyMembershipPage";
import InsurancePage from "./pages/dashboard/InsurancePage";

import IssueTypeSelectionPage from "./pages/dashboard/insurance-support/new/type";
import ComplaintFormPage from "./pages/dashboard/insurance-support/new/form";
import SuccessScreen from "./pages/dashboard/insurance-support/new/success";
import ComplaintListPage from "./pages/dashboard/insurance-support/complaints";
import ComplaintDetailPage from "./pages/dashboard/insurance-support/complaint/[id]";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <ReferralProvider>
          <RazorpayProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
                  <Route path="/blog" element={<BlogsPage />} />
                  <Route path="/blog/:slug" element={<BlogsPage />} />
                  <Route path="/thank-you" element={<PublicRoute><ThankYou /></PublicRoute>} />
                  <Route path="/financial-freedom-calculator" element={<PublicRoute><FinancialFreedomCalculator /></PublicRoute>} />
                  <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
                  <Route path="/achievers-club" element={<PublicRoute><AchieversClubLanding /></PublicRoute>} />
                  <Route path="/privacy-policy" element={<PublicRoute><PrivacyPolicy /></PublicRoute>} />
                  <Route path="/pricing" element={<PublicRoute><PublicPricing /></PublicRoute>} />
                  <Route path="/buy-membership" element={<PublicRoute><BuyMembership /></PublicRoute>} />

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />

                    <Route path="ffr" element={<UnifiedFFRPage />} />
                    <Route path="ffr/checklist" element={<FFRChecklist />} />
                    <Route path="ffr/opportunities" element={<FFROpportunities />} />
                    <Route path="ffr/unified" element={<UnifiedFFRPage />} />

                    <Route path="calculator" element={<FinancialCalculatorPage />} />
                    <Route path="book-wealth-manager" element={<BookWealthManager />} />
                    <Route path="investment-opportunities" element={<InvestmentOpportunities />} />
                    <Route path="refer" element={<ReferFriend />} />
                    <Route path="support" element={<SupportPage />} />

                    <Route path="upgrade" element={<UpgradePage />} />
                    <Route path="buy-membership" element={<DashboardBuyMembershipPage />} />
                    <Route path="insurance" element={<InsurancePage />} />

                    {/* Insurance Support Feature */}
                    <Route path="insurance-support/new/type" element={<IssueTypeSelectionPage />} />
                    <Route path="insurance-support/new/form" element={<ComplaintFormPage />} />
                    <Route path="insurance-support/new/success" element={<SuccessScreen />} />
                    <Route path="insurance-support/complaints" element={<ComplaintListPage />} />
                    <Route path="insurance-support/complaint/:id" element={<ComplaintDetailPage />} />

                    {/* Admin Routes */}
                    <Route path="blog-cms" element={<BlogCMSDashboard />} />
                    <Route path="authors" element={<AuthorsDashboard />} />
                    <Route path="cta-dashboard" element={<CTADashboardPage />} />
                    <Route path="cta-placements" element={<CTAPlacementPage />} />
                    <Route path="cta-analytics" element={<CTAAnalyticsPage />} />
                    <Route
                      path="bookings"
                      element={
                        <RoleProtectedRoute requiredRole="super_admin">
                          <BookingsDashboard />
                        </RoleProtectedRoute>
                      }
                    />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </RazorpayProvider>
        </ReferralProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;