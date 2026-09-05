import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { VideoProvider } from './context/VideoContext';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Public pages — code-split so each route loads only what it needs.
const lazyNamed = (importFn: () => Promise<{ [key: string]: unknown }>, name: string) =>
  lazy(() => importFn().then((m) => ({ default: m[name] as React.ComponentType })));

const HomePage = lazyNamed(() => import('./pages/HomePage'), 'HomePage');
const ProductsPage = lazyNamed(() => import('./pages/ProductsPage'), 'ProductsPage');
const ProductDetailPage = lazyNamed(() => import('./pages/ProductDetailPage'), 'ProductDetailPage');
const FeedPage = lazyNamed(() => import('./pages/FeedPage'), 'FeedPage');
const FavoritesPage = lazyNamed(() => import('./pages/FavoritesPage'), 'FavoritesPage');
const AboutPage = lazyNamed(() => import('./pages/AboutPage'), 'AboutPage');
const LocationPage = lazyNamed(() => import('./pages/LocationPage'), 'LocationPage');
const ContactPage = lazyNamed(() => import('./pages/ContactPage'), 'ContactPage');
const PromptLibraryPage = lazyNamed(() => import('./pages/PromptLibraryPage'), 'PromptLibraryPage');
const NotFoundPage = lazyNamed(() => import('./pages/NotFoundPage'), 'NotFoundPage');

// Admin pages
import { LoginPage } from './pages/LoginPage';
import { AdminRoute } from './components/admin/AdminRoute';
import { AdminLayout } from './components/admin/AdminLayout';
const DashboardPage = lazyNamed(() => import('./pages/admin/DashboardPage'), 'DashboardPage');
const ProductsListPage = lazyNamed(() => import('./pages/admin/ProductsListPage'), 'ProductsListPage');
const ProductEditPage = lazyNamed(() => import('./pages/admin/ProductEditPage'), 'ProductEditPage');
const BulkCreatePage = lazyNamed(() => import('./pages/admin/BulkCreatePage'), 'BulkCreatePage');
const ProductImportPage = lazyNamed(() => import('./pages/admin/ProductImportPage'), 'ProductImportPage');
const CategoriesPage = lazyNamed(() => import('./pages/admin/CategoriesPage'), 'CategoriesPage');
const InventoryPage = lazyNamed(() => import('./pages/admin/InventoryPage'), 'InventoryPage');
const FeedAdminPage = lazyNamed(() => import('./pages/admin/FeedAdminPage'), 'FeedAdminPage');
const PromptsAdminPage = lazyNamed(() => import('./pages/admin/PromptsAdminPage'), 'PromptsAdminPage');
const HomepageCmsPage = lazyNamed(() => import('./pages/admin/HomepageCmsPage'), 'HomepageCmsPage');
const TestimonialsAdminPage = lazyNamed(() => import('./pages/admin/TestimonialsAdminPage'), 'TestimonialsAdminPage');
const FaqAdminPage = lazyNamed(() => import('./pages/admin/FaqAdminPage'), 'FaqAdminPage');
const StoreAdminPage = lazyNamed(() => import('./pages/admin/StoreAdminPage'), 'StoreAdminPage');
const AboutAdminPage = lazyNamed(() => import('./pages/admin/AboutAdminPage'), 'AboutAdminPage');
const ContactAdminPage = lazyNamed(() => import('./pages/admin/ContactAdminPage'), 'ContactAdminPage');
const SettingsAdminPage = lazyNamed(() => import('./pages/admin/SettingsAdminPage'), 'SettingsAdminPage');
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
    <div className="w-8 h-8 rounded-full border-2 border-zinc-200 dark:border-zinc-700 border-t-amber-500 animate-spin" />
  </div>
);

const AnalyticsTracker: React.FC = () => {
  useAnalytics();
  return null;
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
              <BrowserRouter>
                <ScrollToTop />
                <AnalyticsTracker />
                <SeoMetaManager />
                <Routes>
                  {/* Public Store Routes */}
                  <Route
                    path="/*"
                    element={
                      <div className="min-h-screen bg-[#fafafa] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200 selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-950">
                        <a href="#main-content" className="skip-link" aria-label="Asosiy kontentga o'tish">
                          Kontentga o'tish
                        </a>
                        <Navbar />
                        <main id="main-content" className="flex-grow">
                          <ErrorBoundary>
                            <Suspense fallback={<PageLoader />}>
                              <Routes>
                              <Route path="/" element={<HomePage />} />
                              <Route path="/products" element={<ProductsPage />} />
                              <Route path="/products/:id" element={<ProductDetailPage />} />
                              <Route path="/feed" element={<FeedPage />} />
                              <Route path="/videos" element={<FeedPage />} />
                              <Route path="/prompts" element={<PromptLibraryPage />} />
                              <Route path="/favorites" element={<FavoritesPage />} />
                              <Route path="/about" element={<AboutPage />} />
                              <Route path="/location" element={<LocationPage />} />
                              <Route path="/contact" element={<ContactPage />} />
                              <Route path="*" element={<NotFoundPage />} />
                              </Routes>
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
                          <AdminLayout />
                        </AdminRoute>
                      </Suspense>
                    }
                  >
                    <Route index element={<DashboardPage />} />
                    <Route path="products" element={<ProductsListPage />} />
                    <Route path="products/new" element={<ProductEditPage />} />
                    <Route path="products/bulk-create" element={<BulkCreatePage />} />
                    <Route path="products/import" element={<ProductImportPage />} />
                    <Route path="products/:id" element={<ProductEditPage />} />
                    <Route path="categories" element={<CategoriesPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
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
                    <Route path="about" element={<AboutAdminPage />} />
                    <Route path="contact" element={<ContactAdminPage />} />
                    <Route path="settings" element={<SettingsAdminPage />} />
                    <Route path="analytics" element={<AnalyticsAdminPage />} />
                    <Route path="comments" element={<CommentsAdminPage />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </VideoProvider>
          </FavoritesProvider>
        </AuthProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}

