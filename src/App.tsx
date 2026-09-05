import React from 'react';
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

import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { FeedPage } from './pages/FeedPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AboutPage } from './pages/AboutPage';
import { LocationPage } from './pages/LocationPage';
import { ContactPage } from './pages/ContactPage';
import { PromptLibraryPage } from './pages/PromptLibraryPage';

// Admin Imports
import { LoginPage } from './pages/LoginPage';
import { AdminRoute } from './components/admin/AdminRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { ProductsListPage } from './pages/admin/ProductsListPage';
import { ProductEditPage } from './pages/admin/ProductEditPage';
import { BulkCreatePage } from './pages/admin/BulkCreatePage';
import { CategoriesPage } from './pages/admin/CategoriesPage';
import { InventoryPage } from './pages/admin/InventoryPage';
import { FeedAdminPage } from './pages/admin/FeedAdminPage';
import { PromptsAdminPage } from './pages/admin/PromptsAdminPage';
import { HomepageCmsPage } from './pages/admin/HomepageCmsPage';
import { TestimonialsAdminPage } from './pages/admin/TestimonialsAdminPage';
import { FaqAdminPage } from './pages/admin/FaqAdminPage';
import { StoreAdminPage } from './pages/admin/StoreAdminPage';
import { AboutAdminPage } from './pages/admin/AboutAdminPage';
import { ContactAdminPage } from './pages/admin/ContactAdminPage';
import { SettingsAdminPage } from './pages/admin/SettingsAdminPage';
import { AnalyticsAdminPage } from './pages/admin/AnalyticsAdminPage';
import { CommentsAdminPage } from './pages/admin/CommentsAdminPage';
import { FeedAnalyticsAdminPage } from './pages/admin/FeedAnalyticsAdminPage';
import { FeedLikesAdminPage } from './pages/admin/FeedLikesAdminPage';
import { FeedPerformanceAdminPage } from './pages/admin/FeedPerformanceAdminPage';
import { FeedProductPerformancePage } from './pages/admin/FeedProductPerformancePage';
import { useAnalytics } from './hooks/useAnalytics';

const AnalyticsTracker: React.FC = () => {
  useAnalytics();
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
                <Routes>
                  {/* Public Store Routes */}
                  <Route
                    path="/*"
                    element={
                      <div className="min-h-screen bg-[#fafafa] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200 selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-950">
                        <Navbar />
                        <main className="flex-grow">
                          <ErrorBoundary>
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
                              <Route path="*" element={<HomePage />} />
                            </Routes>
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
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
                    }
                  >
                    <Route index element={<DashboardPage />} />
                    <Route path="products" element={<ProductsListPage />} />
                    <Route path="products/new" element={<ProductEditPage />} />
                    <Route path="products/bulk-create" element={<BulkCreatePage />} />
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

