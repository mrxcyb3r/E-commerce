import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { VideoProvider } from './context/VideoContext';
import { StoreProvider } from './context/StoreContext';
import { SaveToBuyProvider } from './context/SaveToBuyContext';
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
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AdminRoute } from './components/admin/AdminRoute';
import { Cap } from './components/admin/RequireCapability';
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
const AdminsPage = lazyNamed(() => import('./pages/admin/AdminsPage'), 'AdminsPage');
const SecurityPage = lazyNamed(() => import('./pages/admin/SecurityPage'), 'SecurityPage');
const AuditLogPage = lazyNamed(() => import('./pages/admin/AuditLogPage'), 'AuditLogPage');
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
        <SaveToBuyProvider>
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
                  <Route path="/login/callback" element={<AuthCallbackPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />

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
                    <Route index element={<Cap capability="dashboard"><DashboardPage /></Cap>} />
                    <Route path="products" element={<Cap capability="products"><ProductsListPage /></Cap>} />
                    <Route path="products/new" element={<Cap capability="products"><ProductEditPage /></Cap>} />
                    <Route path="products/bulk-create" element={<Cap capability="products"><BulkCreatePage /></Cap>} />
                    <Route path="products/import" element={<Cap capability="products"><ProductImportPage /></Cap>} />
                    <Route path="products/performance" element={<Cap capability="products"><ProductPerformancePage /></Cap>} />
                    <Route path="products/:id" element={<Cap capability="products"><ProductEditPage /></Cap>} />
                    <Route path="categories" element={<Cap capability="categories"><CategoriesPage /></Cap>} />
                    <Route path="inventory" element={<Cap capability="inventory"><InventoryPage /></Cap>} />
                    <Route path="operations" element={<Cap capability="inventory"><OperationsHealthPage /></Cap>} />
                    <Route path="feed" element={<Cap capability="feed"><FeedAdminPage /></Cap>} />
                    <Route path="feed/analytics" element={<Cap capability="feed"><FeedAnalyticsAdminPage /></Cap>} />
                    <Route path="feed/likes" element={<Cap capability="feed"><FeedLikesAdminPage /></Cap>} />
                    <Route path="feed/performance" element={<Cap capability="feed"><FeedPerformanceAdminPage /></Cap>} />
                    <Route path="feed/products" element={<Cap capability="feed"><FeedProductPerformancePage /></Cap>} />
                    <Route path="prompts" element={<Cap capability="prompts"><PromptsAdminPage /></Cap>} />
                    <Route path="homepage" element={<Cap capability="homepage"><HomepageCmsPage /></Cap>} />
                    <Route path="testimonials" element={<Cap capability="store"><TestimonialsAdminPage /></Cap>} />
                    <Route path="faq" element={<Cap capability="store"><FaqAdminPage /></Cap>} />
                    <Route path="store" element={<Cap capability="store"><StoreAdminPage /></Cap>} />
                    <Route path="onboarding" element={<Cap capability="store"><OnboardingPage /></Cap>} />
                    <Route path="about" element={<Cap capability="store"><AboutAdminPage /></Cap>} />
                    <Route path="contact" element={<Cap capability="store"><ContactAdminPage /></Cap>} />
                    <Route path="settings" element={<Cap capability="settings"><SettingsAdminPage /></Cap>} />
                    <Route path="analytics" element={<Cap capability="analytics"><AnalyticsAdminPage /></Cap>} />
                    <Route path="analytics/interest" element={<Cap capability="analytics"><CustomerInterestPage /></Cap>} />
                    <Route path="orders" element={<Cap capability="orders"><OrdersListPage /></Cap>} />
                    <Route path="orders/:id" element={<Cap capability="orders"><OrderDetailPage /></Cap>} />
                    <Route path="in-store-sale" element={<Cap capability="orders"><InStoreSaleAdminPage /></Cap>} />
                    <Route path="buy-sessions" element={<Cap capability="buySessions"><BuySessionsPage /></Cap>} />
                    <Route path="campaigns" element={<Cap capability="campaigns"><CampaignsPage /></Cap>} />
                    <Route path="activity" element={<Cap capability="activity"><ActivityPage /></Cap>} />
                    <Route path="comments" element={<Cap capability="feed"><CommentsAdminPage /></Cap>} />
                    <Route path="users" element={<Cap capability="users"><AdminsPage /></Cap>} />
                    <Route path="security" element={<Cap capability="settings"><SecurityPage /></Cap>} />
                    <Route path="audit" element={<Cap capability="audit"><AuditLogPage /></Cap>} />
                  </Route>
                </Routes>
                </BrowserRouter>
              </BuySessionProvider>
            </VideoProvider>
          </FavoritesProvider>
        </AuthProvider>
        </SaveToBuyProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}

