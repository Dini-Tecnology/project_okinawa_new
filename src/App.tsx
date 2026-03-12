import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/hooks/useTheme";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import SkipNavLink from "@/components/a11y/SkipNavLink";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load all pages
const Index = lazy(() => import("./pages/Index"));
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
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 rounded-2xl bg-primary animate-pulse" />
      <Skeleton className="h-4 w-32" />
    </div>
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <SkipNavLink />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <div id="main-content">
                  <Routes>
                    <Route path="/" element={<Index />} />
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
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
