import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/hooks/useTheme";
import LangProvider from "@/components/site/LangProvider";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import SkipNavLink from "@/components/a11y/SkipNavLink";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load all pages
const SiteHome = lazy(() => import("./pages/SiteHome"));
const SitePlatform = lazy(() => import("./pages/SitePlatform"));
const SiteRequestDemo = lazy(() => import("./pages/SiteRequestDemo"));
const SiteAccess = lazy(() => import("./pages/SiteAccess"));
const SiteDemoHub = lazy(() => import("./pages/SiteDemoHub"));
const MobilePreview = lazy(() => import("./pages/MobilePreview"));
const MobilePreviewV2 = lazy(() => import("./pages/MobilePreviewV2"));
const PitchDeck = lazy(() => import("./pages/PitchDeck"));
const AppPresentationDeck = lazy(() => import("./pages/AppPresentationDeck"));
const RestaurantPitchDeck = lazy(() => import("./pages/RestaurantPitchDeck"));
const InvestorPitchDeck = lazy(() => import("./pages/InvestorPitchDeck"));
const PartnerPitchDeck = lazy(() => import("./pages/PartnerPitchDeck"));
const QRCodeMaterials = lazy(() => import("./pages/QRCodeMaterials"));
const LogoShowcase = lazy(() => import("./pages/LogoShowcase"));
const BrandIdentity = lazy(() => import("./pages/BrandIdentity"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const DemoClient = lazy(() => import("./pages/DemoClient"));
const DemoRestaurant = lazy(() => import("./pages/DemoRestaurant"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-noowe-bg">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 rounded-2xl bg-noowe-blue/20 animate-pulse" />
      <Skeleton className="h-4 w-32 bg-noowe-bg3" />
    </div>
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LangProvider>
          <TooltipProvider>
            <ErrorBoundary>
              <SkipNavLink />
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <div id="main-content">
                    <Routes>
                      {/* Site pages */}
                      <Route path="/" element={<SiteHome />} />
                      <Route path="/platform" element={<SitePlatform />} />
                      <Route path="/request-demo" element={<SiteRequestDemo />} />
                      <Route path="/access" element={<SiteAccess />} />
                      <Route path="/demo" element={<SiteDemoHub />} />

                      {/* Existing demo & internal pages */}
                      <Route path="/demo/client" element={<DemoClient />} />
                      <Route path="/demo/restaurant" element={<DemoRestaurant />} />
                      <Route path="/mobile" element={<MobilePreview />} />
                      <Route path="/mobile-v2" element={<MobilePreviewV2 />} />
                      <Route path="/pitch" element={<PitchDeck />} />
                      <Route path="/pitch/app" element={<AppPresentationDeck />} />
                      <Route path="/pitch/restaurants" element={<RestaurantPitchDeck />} />
                      <Route path="/pitch/investors" element={<InvestorPitchDeck />} />
                      <Route path="/pitch/partner" element={<PartnerPitchDeck />} />
                      <Route path="/marketing/qr-codes" element={<QRCodeMaterials />} />
                      <Route path="/logo" element={<LogoShowcase />} />
                      <Route path="/brand" element={<BrandIdentity />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </Suspense>
              </BrowserRouter>
            </ErrorBoundary>
          </TooltipProvider>
        </LangProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
