import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { RazorpayProvider } from "@/contexts/RazorpayContext";
import { ReferralProvider } from "@/contexts/ReferralContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";
import Index from "./pages/Index";
import BlogsPage from "./pages/BlogsPage";
const ThankYou = lazy(() => import("./pages/ThankYou"));
const FinancialFreedomCalculator = lazy(() => import("./pages/FinancialFreedomCalculator"));
const AuthPage = lazy(() => import("./components/auth/AuthPage"));
const DashboardLayout = lazy(() => import("./components/dashboard/DashboardLayout"));
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const DashboardPricingPage = lazy(() => import("./pages/dashboard/PricingPage"));
const BuyMembership = lazy(() => import("./pages/BuyMembership"));

const InvestmentOpportunities = lazy(() => import("./pages/dashboard/InvestmentOpportunities"));
const ReferFriend = lazy(() => import("./pages/dashboard/ReferFriend"));
const SupportPage = lazy(() => import("./pages/dashboard/SupportPage"));
const FinancialCalculatorPage = lazy(() => import("./pages/dashboard/FinancialCalculatorPage"));
const BlogCMSDashboard = lazy(() => import("./pages/dashboard/BlogCMSDashboard"));
const AuthorsDashboard = lazy(() => import("./pages/dashboard/AuthorsDashboard"));
const CTADashboardPage = lazy(() => import("./pages/dashboard/CTADashboard"));
const CTAPlacementPage = lazy(() => import("./pages/dashboard/CTAPlacementPage"));
const CTAAnalyticsPage = lazy(() => import("./pages/dashboard/CTAAnalyticsPage"));
const BookingsDashboard = lazy(() => import("./pages/dashboard/BookingsDashboard"));
const RoleProtectedRoute = lazy(() => import("./components/RoleProtectedRoute"));
const ElevatePage = lazy(() => import("./pages/dashboard/ElevatePage"));
const FootprintsPage = lazy(() => import("./pages/dashboard/FootprintsPage"));
const RaisePage = lazy(() => import("./pages/dashboard/RaisePage"));
const ReflectionsPage = lazy(() => import("./pages/dashboard/ReflectionsPage"));
const KnowYourMarketPage = lazy(() => import("./pages/dashboard/KnowYourMarketPage"));
const CurationsPage = lazy(() => import("./pages/dashboard/CurationsPage"));
const InsurancePage = lazy(() => import("./pages/dashboard/InsurancePage"));
// import PricingPage from "./pages/dashboard/PricingPage";
// import ReadinessFitPage from "./pages/dashboard/ReadinessFitPage";
// import NewReferralPage from "./pages/dashboard/NewReferralPage";
// import SprintHomePage from "./pages/dashboard/SprintHomePage";
// import SprintDetailPage from "./pages/dashboard/SprintDetailPage";
// import SprintBPage from "./pages/sprintb/index";
const LearningHome = lazy(() => import("./pages/learning/LearningHome"));
const LearningSeriesDetail = lazy(() => import("./pages/learning/LearningSeriesDetail"));
const LearningPlayer = lazy(() => import("./pages/learning/LearningPlayer"));
const LearningAchievements = lazy(() => import("./pages/learning/LearningAchievements"));
const LearningLibrary = lazy(() => import("./pages/learning/LearningLibrary"));
const FFRChecklist = lazy(() => import("./pages/ffr/FFRChecklist"));
const FFROpportunities = lazy(() => import("./pages/ffr/FFROpportunities"));
const UnifiedFFRPage = lazy(() => import("./pages/ffr/UnifiedFFRPage"));
const SprintPage = lazy(() => import("./pages/dashboard/SprintPage"));
const AchieversClubLanding = lazy(() => import("./pages/AchieversClubLanding"));
const AchieversClubDashboard = lazy(() => import("./pages/dashboard/AchieversClubDashboard"));
const UpgradePage = lazy(() => import("./pages/dashboard/UpgradePage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
import NotFound from "./pages/NotFound";
const PublicPricing = lazy(() => import("./pages/PublicPricing"));
const DashboardBuyMembershipPage = lazy(() => import("./pages/dashboard/BuyMembershipPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const EventDetailPage = lazy(() => import("./pages/EventDetailPage"));
const EventConfirmationPage = lazy(() => import("./pages/EventConfirmationPage"));
const DashboardEventsPage = lazy(() => import("./pages/dashboard/DashboardEventsPage"));

// Homepage and blog stay in the main bundle (they're server-rendered and must
// show instantly); everything else loads on demand
const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

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
                <Suspense fallback={<RouteFallback />}>
                <Routes>

                  {/* PUBLIC ROUTES */}
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
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/events/:id" element={<EventDetailPage />} />
                  <Route path="/events/:id/confirmation" element={<EventConfirmationPage />} />

                  {/* DASHBOARD ROUTES */}
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>

                    <Route index element={<DashboardHome />} />
                    <Route path="pricing" element={<DashboardPricingPage />} />
                    <Route path="buy-membership" element={<DashboardBuyMembershipPage />} />

                    <Route path="ffr" element={<UnifiedFFRPage />} />
                    <Route path="ffr/checklist" element={<FFRChecklist />} />
                    <Route path="ffr/opportunities" element={<FFROpportunities />} />
                    <Route path="sprints" element={<SprintPage />} />
                    <Route path="know-your-market" element={<KnowYourMarketPage />} />
                    <Route path="curations" element={<CurationsPage />} />
                    <Route path="footprints" element={<FootprintsPage />} />
                    <Route path="raise" element={<RaisePage />} />
                    <Route path="reflections" element={<ReflectionsPage />} />
                    <Route path="insurance" element={<InsurancePage />} />
                    <Route path="learning" element={<LearningHome />} />
                    <Route path="learning/library" element={<LearningLibrary />} />
                    <Route path="learning/series/:seriesId/video/:videoId" element={<LearningPlayer />} />
                    <Route path="learning/series/:id" element={<LearningSeriesDetail />} />
                    <Route path="learning/achievements" element={<LearningAchievements />} />

                    <Route path="events" element={<DashboardEventsPage />} />
                    <Route path="compass" element={<ElevatePage />} />
                    <Route path="calculator" element={<FinancialCalculatorPage />} />
                    <Route path="investment-opportunities" element={<InvestmentOpportunities />} />
                    <Route path="refer" element={<ReferFriend />} />
                    <Route path="support" element={<SupportPage />} />
                    <Route path="upgrade" element={<UpgradePage />} />
                    <Route path="achievers-club" element={<AchieversClubDashboard />} />

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

                  {/* FALLBACK */}
                  <Route path="*" element={<NotFound />} />

                </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </RazorpayProvider>
        </ReferralProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;