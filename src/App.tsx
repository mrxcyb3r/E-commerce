import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { VideoProvider } from './context/VideoContext';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import { BuySessionProvider } from './context/BuySessionContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { pageTransition } from './lib/animations';

// Public pages — code-split so each route loads only what it needs.
const lazyNamed = (importFn: () => Promise<{ [key: string]: unknown }>, name: string) =>
  lazy(() => importFn().then((m) => ({ default: m[name] as React.ComponentType })));

const HomePage = lazyNamed(() => import('./pages/HomePage'), 'HomePage');
const ProductsPage = lazyNamed(() => import('./pages/ProductsPage'), 'ProductsPage');
const ProductDetailPage = lazyNamed(() => import('./pages/ProductDetailPage'), 'ProductDetailPage');
const FeedPage = lazyNamed(() => import('./pages/FeedPage'), 'FeedPage');
const FavoritesPage = lazyNamed(() => import('./pages/FavoritesPage'), 'FavoritesPage');
const BuyingListPage = lazyNamed(() => import('./pages/BuyingListPage'), 'BuyingListPage');
const BuySessionPage = lazyNamed(() => import('./pages/BuySessionPage'), 'BuySessionPage');
const AboutPage = lazyNamed(() => import('./pages/AboutPage'), 'AboutPage');
const LocationPage = lazyNamed(() => import('./pages/LocationPage'), 'LocationPage');
const ContactPage = lazyNamed(() => import('./pages/ContactPage'), 'ContactPage');
const PromptLibraryPage = lazyNamed(() => import('./pages/PromptLibraryPage'), 'PromptLibraryPage');
const NotFoundPage = lazyNamed(() => import('./pages/NotFoundPage'), 'NotFoundPage');

// Admin pages
import { LoginPage } from './pages/LoginPage';
import { AdminRoute } from './components/admin/AdminRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { ToastProvider } from './components/common/ToastProvider';
const DashboardPage = lazyNamed(() => import('./pages/admin/DashboardPage'), 'DashboardPage');
const ProductsListPage = lazyNamed(() => import('./pages/admin/ProductsListPage'), 'ProductsListPage');
const ProductEditPage = lazyNamed(() => import('./pages/admin/ProductEditPage'), 'ProductEditPage');
const BulkCreatePage = lazyNamed(() => import('./pages/admin/BulkCreatePage'), 'BulkCreatePage');
const ProductImportPage = lazyNamed(() => import('./pages/admin/ProductImportPage'), 'ProductImportPage');
const CategoriesPage = lazyNamed(() => import('./pages/admin/CategoriesPage'), 'CategoriesPage');
const InventoryPage = lazyNamed(() => import('./pages/admin/InventoryPage'), 'InventoryPage');
const OperationsHealthPage = lazyNamed(() => import('./pages/admin/OperationsHealthPage'), 'OperationsHealthPage');
const ProductPerformancePage = lazyNamed(() => import('./pages/admin/ProductPerformancePage'), 'ProductPerformancePage');
const CustomerInterestPage = lazyNamed(() => import('./pages/admin/CustomerInterestPage'), 'CustomerInterestPage');
const BuySessionsPage = lazyNamed(() => import('./pages/admin/BuySessionsPage'), 'BuySessionsPage');
const CampaignsPage = lazyNamed(() => import('./pages/admin/CampaignsPage'), 'CampaignsPage');
const ActivityPage = lazyNamed(() => import('./pages/admin/ActivityPage'), 'ActivityPage');
const FeedAdminPage = lazyNamed(() => import('./pages/admin/FeedAdminPage'), 'FeedAdminPage');
const PromptsAdminPage = lazyNamed(() => import('./pages/admin/PromptsAdminPage'), 'PromptsAdminPage');
const HomepageCmsPage = lazyNamed(() => import('./pages/admin/HomepageCmsPage'), 'HomepageCmsPage');
const TestimonialsAdminPage = lazyNamed(() => import('./pages/admin/TestimonialsAdminPage'), 'TestimonialsAdminPage');
const FaqAdminPage = lazyNamed(() => import('./pages/admin/FaqAdminPage'), 'FaqAdminPage');
const StoreAdminPage = lazyNamed(() => import('./pages/admin/StoreAdminPage'), 'StoreAdminPage');
const OnboardingPage = lazyNamed(() => import('./pages/admin/OnboardingPage'), 'OnboardingPage');
const AboutAdminPage = lazyNamed(() => import('./pages/admin/AboutAdminPage'), 'AboutAdminPage');
const ContactAdminPage = lazyNamed(() => import('./pages/admin/ContactAdminPage'), 'ContactAdminPage');
const SettingsAdminPage = lazyNamed(() => import('./pages/admin/SettingsAdminPage'), 'SettingsAdminPage');
const OrdersListPage = lazyNamed(() => import('./pages/admin/OrdersListPage'), 'OrdersListPage');
const OrderDetailPage = lazyNamed(() => import('./pages/admin/OrderDetailPage'), 'OrderDetailPage');
const InStoreSaleAdminPage = lazyNamed(() => import('./pages/admin/InStoreSaleAdminPage'), 'InStoreSaleAdminPage');
const AnalyticsAdminPage = lazyNamed(() => import('./pages/admin/AnalyticsAdminPage'), 'AnalyticsAdminPage');
const CommentsAdminPage = lazyNamed(() => import('./pages/admin/CommentsAdminPage'), 'CommentsAdminPage');
const FeedAnalyticsAdminPage = lazyNamed(() => import('./pages/admin/FeedAnalyticsAdminPage'), 'FeedAnalyticsAdminPage');
const FeedLikesAdminPage = lazyNamed(() => import('./pages/admin/FeedLikesAdminPage'), 'FeedLikesAdminPage');
const FeedPerformanceAdminPage = lazyNamed(() => import('./pages/admin/FeedPerformanceAdminPage'), 'FeedPerformanceAdminPage');
const FeedProductPerformancePage = lazyNamed(() => import('./pages/admin/FeedProductPerformancePage'), 'FeedProductPerformancePage');
import { useAnalytics } from './hooks/useAnalytics';
import { useDocumentMeta } from './hooks/useDocumentMeta';
import { useStore } from './context/StoreContext';

const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-border border-t-accent animate-spin" />
  </div>
);

const AnalyticsTracker: React.FC = () => {
  useAnalytics();
  return null;
};

/** Animated route wrapper — provides page transitions for public routes */
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/videos" element={<FeedPage />} />
          <Route path="/prompts" element={<PromptLibraryPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/buy-list" element={<BuyingListPage />} />
          <Route path="/buy-session/:code" element={<BuySessionPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/location" element={<LocationPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const SeoMetaManager: React.FC = () => {
  const { storeInfo } = useStore();
  useDocumentMeta({
    title: '',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: storeInfo.businessName,
      description: storeInfo.businessDescription,
      url: typeof window !== 'undefined' ? window.location.origin : '',
      telephone: storeInfo.phone,
      email: storeInfo.email,
      address: { '@type': 'PostalAddress', streetAddress: storeInfo.address, addressLocality: storeInfo.city },
      openingHours: storeInfo.workingHours,
      sameAs: [storeInfo.telegram, storeInfo.socialLinks?.instagram, storeInfo.socialLinks?.facebook].filter(Boolean),
    },
  });
  return null;
};

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <AuthProvider>
          <FavoritesProvider>
            <VideoProvider>
              <BuySessionProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <AnalyticsTracker />
                  <SeoMetaManager />
                  <Routes>
                  {/* Public Store Routes */}
                  <Route
                    path="/*"
                    element={
                      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200 selection:bg-foreground selection:text-background">
                        <a href="#main-content" className="skip-link" aria-label="Asosiy kontentga o'tish">
                          Kontentga o'tish
                        </a>
                        <Navbar />
                        <main id="main-content" className="flex-grow">
                          <ErrorBoundary>
                            <Suspense fallback={<PageLoader />}>
                              <AnimatedRoutes />
                            </Suspense>
                          </ErrorBoundary>
                        </main>
                        <Footer />
                      </div>
                    }
                  />

                  {/* Admin Login */}
                  <Route path="/login" element={<LoginPage />} />

                  {/* Protected Admin CMS Area */}
                  <Route
                    path="/admin"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminRoute>
                          <ToastProvider>
                            <AdminLayout />
                          </ToastProvider>
                        </AdminRoute>
                      </Suspense>
                    }
                  >
                    <Route index element={<DashboardPage />} />
                    <Route path="products" element={<ProductsListPage />} />
                    <Route path="products/new" element={<ProductEditPage />} />
                    <Route path="products/bulk-create" element={<BulkCreatePage />} />
                    <Route path="products/import" element={<ProductImportPage />} />
                    <Route path="products/performance" element={<ProductPerformancePage />} />
                    <Route path="products/:id" element={<ProductEditPage />} />
                    <Route path="categories" element={<CategoriesPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="operations" element={<OperationsHealthPage />} />
                    <Route path="feed" element={<FeedAdminPage />} />
                    <Route path="feed/analytics" element={<FeedAnalyticsAdminPage />} />
                    <Route path="feed/likes" element={<FeedLikesAdminPage />} />
                    <Route path="feed/performance" element={<FeedPerformanceAdminPage />} />
                    <Route path="feed/products" element={<FeedProductPerformancePage />} />
                    <Route path="prompts" element={<PromptsAdminPage />} />
                    <Route path="homepage" element={<HomepageCmsPage />} />
                    <Route path="testimonials" element={<TestimonialsAdminPage />} />
                    <Route path="faq" element={<FaqAdminPage />} />
                    <Route path="store" element={<StoreAdminPage />} />
                    <Route path="onboarding" element={<OnboardingPage />} />
                    <Route path="about" element={<AboutAdminPage />} />
                    <Route path="contact" element={<ContactAdminPage />} />
                    <Route path="settings" element={<SettingsAdminPage />} />
                    <Route path="analytics" element={<AnalyticsAdminPage />} />
                    <Route path="analytics/interest" element={<CustomerInterestPage />} />
                    <Route path="orders" element={<OrdersListPage />} />
                    <Route path="orders/:id" element={<OrderDetailPage />} />
                    <Route path="in-store-sale" element={<InStoreSaleAdminPage />} />
                    <Route path="buy-sessions" element={<BuySessionsPage />} />
                    <Route path="campaigns" element={<CampaignsPage />} />
                    <Route path="activity" element={<ActivityPage />} />
                    <Route path="comments" element={<CommentsAdminPage />} />
                  </Route>
                </Routes>
                </BrowserRouter>
              </BuySessionProvider>
            </VideoProvider>
          </FavoritesProvider>
        </AuthProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}

