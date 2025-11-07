import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RazorpayProvider } from "@/contexts/RazorpayContext";
import { ReferralProvider } from "@/contexts/ReferralContext";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import AchieversClubLanding from "./pages/AchieversClubLanding";
import AchieversClubDashboard from "./pages/dashboard/AchieversClubDashboard";
import UpgradePage from "./pages/dashboard/UpgradePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ReferralProvider>
        <RazorpayProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<BlogsPage />} />
            <Route path="/blog/:slug" element={<BlogsPage />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/financial-freedom-calculator" element={<FinancialFreedomCalculator />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/achievers-club" element={<AchieversClubLanding />} />
            
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
              <Route path="ffr" element={<FFRHome />} />
              <Route path="ffr/checklist" element={<FFRChecklist />} />
              <Route path="ffr/opportunities" element={<FFROpportunities />} />
              
              {/* Main Navigation Routes */}
              <Route path="calculator" element={<FinancialCalculatorPage />} />
              <Route path="book-wealth-manager" element={<BookWealthManager />} />
              <Route path="investment-opportunities" element={<InvestmentOpportunities />} />
              <Route path="refer" element={<ReferFriend />} />
              <Route path="support" element={<SupportPage />} />
              {/* Achievers Club - Currently in progress, hidden for production */}
              {/* <Route path="achievers-club" element={<AchieversClubDashboard />} /> */}
              <Route path="upgrade" element={<UpgradePage />} />
              
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
  </QueryClientProvider>
);

export default App;
