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
import ElevatePage from "./pages/dashboard/ElevatePage";
import FootprintsPage from "./pages/dashboard/FootprintsPage";
import RaisePage from "./pages/dashboard/RaisePage";
import ReflectionsPage from "./pages/dashboard/ReflectionsPage";
import KnowYourMarketPage from "./pages/dashboard/KnowYourMarketPage";
import CurationsPage from "./pages/dashboard/CurationsPage";
import PricingPage from "./pages/dashboard/PricingPage";
import ReadinessFitPage from "./pages/dashboard/ReadinessFitPage";
import NewReferralPage from "./pages/dashboard/NewReferralPage";
import SprintHomePage from "./pages/dashboard/SprintHomePage";
import SprintDetailPage from "./pages/dashboard/SprintDetailPage";
import SprintBPage from "./pages/sprintb/index";
import LearningHome from "./pages/learning/LearningHome";
import LearningSeriesDetail from "./pages/learning/LearningSeriesDetail";
import LearningPlayer from "./pages/learning/LearningPlayer";
import LearningAchievements from "./pages/learning/LearningAchievements";
import LearningLibrary from "./pages/learning/LearningLibrary";
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
            
            {/* FFR Module Routes - moved to dashboard/tools */}
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              
              {/* FFR Module Routes */}
              <Route path="ffr" element={<UnifiedFFRPage />} />
              <Route path="ffr/checklist" element={<FFRChecklist />} />
              <Route path="ffr/opportunities" element={<FFROpportunities />} />
              <Route path="ffr/unified" element={<UnifiedFFRPage />} />
              
              {/* Main Navigation Routes */}
              <Route path="elevate" element={<ElevatePage />} />
              <Route path="footprints" element={<FootprintsPage />} />
              <Route path="footprints/post" element={<FootprintsPage />} />
              <Route path="footprints/:id" element={<FootprintsPage />} />
              <Route path="raise" element={<RaisePage />} />
              <Route path="raise/submit" element={<RaisePage />} />
              <Route path="raise/:id" element={<RaisePage />} />
              <Route path="reflections" element={<ReflectionsPage />} />
              <Route path="reflections/submit" element={<ReflectionsPage />} />
              <Route path="reflections/:id" element={<ReflectionsPage />} />
              <Route path="know-your-market" element={<KnowYourMarketPage />} />
              <Route path="curations" element={<CurationsPage />} />
              <Route path="investor-hub/pricing" element={<PricingPage />} />
              <Route path="readiness-fit" element={<ReadinessFitPage />} />
              <Route path="new-referral" element={<NewReferralPage />} />
              <Route path="sprints" element={<SprintHomePage />} />
              <Route path="sprints/:sprintId" element={<SprintDetailPage />} />
              <Route path="sprintb" element={<SprintBPage />} />
              <Route path="learning" element={<LearningHome />} />
              <Route path="learning/series/:seriesId" element={<LearningSeriesDetail />} />
              <Route path="learning/series/:seriesId/video/:videoId" element={<LearningPlayer />} />
              <Route path="learning/achievements" element={<LearningAchievements />} />
              <Route path="learning/library" element={<LearningLibrary />} />
              <Route path="calculator" element={<FinancialCalculatorPage />} />
              <Route path="book-wealth-manager" element={<BookWealthManager />} />
              <Route path="investment-opportunities" element={<InvestmentOpportunities />} />
              <Route path="refer" element={<ReferFriend />} />
              <Route path="support" element={<SupportPage />} />
              {/* Achievers Club - Currently in progress, hidden for production */}
              {/* <Route path="achievers-club" element={<AchieversClubDashboard />} /> */}
              <Route path="upgrade" element={<UpgradePage />} />
              <Route path="buy-membership" element={<DashboardBuyMembershipPage />} />
              <Route path="insurance" element={<InsurancePage />} />
              
              {/* Admin Routes */}
              <Route path="blog-cms" element={<BlogCMSDashboard />} />
              <Route path="authors" element={<AuthorsDashboard />} />
              <Route path="cta-dashboard" element={<CTADashboardPage />} />
              <Route path="cta-placements" element={<CTAPlacementPage />} />
              <Route path="cta-analytics" element={<CTAAnalyticsPage />} />
              <Route path="bookings" element={
                <RoleProtectedRoute requiredRole="super_admin">
                  <BookingsDashboard />
                </RoleProtectedRoute>
              } />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
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
