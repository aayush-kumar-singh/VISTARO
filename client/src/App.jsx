import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import { CurrencyProvider } from './context/CurrencyContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

import Layout from './components/layout/Layout.jsx';
import AdminRoute from './components/auth/AdminRoute.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import GuestRoute from './components/auth/GuestRoute.jsx';

// Core entry page: New minimal Curated Landing Page
import LandingPage from './pages/LandingPage.jsx';

// Existing full-catalog explore page (retains all filters, curated rows, stays catalog & pagination)
const HomePage = lazy(() => import('./pages/HomePage.jsx'));

// Lazy-loaded routes for code-splitting and reduced bundle size
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage.jsx'));
const CreateListingPage = lazy(() => import('./pages/CreateListingPage.jsx'));
const EditListingPage = lazy(() => import('./pages/EditListingPage.jsx'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage.jsx'));
const CategoryPage = lazy(() => import('./pages/CategoryPage.jsx'));
const DestinationsPage = lazy(() => import('./pages/DestinationsPage.jsx'));
const DestinationDetailPage = lazy(() => import('./pages/DestinationDetailPage.jsx'));
const TourPackagesPage = lazy(() => import('./pages/TourPackagesPage.jsx'));
const TourPackageDetailPage = lazy(() => import('./pages/TourPackageDetailPage.jsx'));
const ExperiencesListPage = lazy(() => import('./pages/ExperiencesListPage.jsx'));
const ExperienceDetailPage = lazy(() => import('./pages/ExperienceDetailPage.jsx'));
const WishlistPage = lazy(() => import('./pages/WishlistPage.jsx'));
const TravelPlansPage = lazy(() => import('./pages/TravelPlansPage.jsx'));
const TravelPlanDetailPage = lazy(() => import('./pages/TravelPlanDetailPage.jsx'));
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage.jsx'));
const BookingDetailPage = lazy(() => import('./pages/BookingDetailPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const HostDashboardPage = lazy(() => import('./pages/HostDashboardPage.jsx'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage.jsx'));
const InboxPage = lazy(() => import('./pages/InboxPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const SignupPage = lazy(() => import('./pages/SignupPage.jsx'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'));
const TermsPage = lazy(() => import('./pages/TermsPage.jsx'));
const CancellationPolicyPage = lazy(() => import('./pages/CancellationPolicyPage.jsx'));
const CompanyDetailsPage = lazy(() => import('./pages/CompanyDetailsPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

function RouteFallback() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3 animate-fade-in text-vistaro-primary">
      <div className="w-9 h-9 border-2 border-vistaro-accent/20 border-t-vistaro-accent rounded-full animate-spin" />
      <span className="text-[11px] font-semibold text-vistaro-muted tracking-widest uppercase">
        Loading Vistaro...
      </span>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <CurrencyProvider>
        <AuthProvider>
          <SocketProvider>
            <BrowserRouter>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    {/* 1. Public Browsing Routes (100% Unrestricted) */}
                    <Route index element={<LandingPage />} />
                    <Route path="explore" element={<HomePage />} />
                    <Route path="listings" element={<Navigate to="/explore" replace />} />
                    <Route path="listings/:id" element={<ListingDetailPage />} />
                    <Route path="search" element={<SearchResultsPage />} />
                    <Route path="category/:category" element={<CategoryPage />} />
                    <Route path="destinations" element={<DestinationsPage />} />
                    <Route path="destinations/:slug" element={<DestinationDetailPage />} />
                    <Route path="tours" element={<TourPackagesPage />} />
                    <Route path="tours/:slug" element={<TourPackageDetailPage />} />
                    <Route path="experiences" element={<ExperiencesListPage />} />
                    <Route path="experiences/:slug" element={<ExperienceDetailPage />} />
                    <Route path="privacy" element={<PrivacyPage />} />
                    <Route path="terms" element={<TermsPage />} />
                    <Route path="cancellation-policy" element={<CancellationPolicyPage />} />
                    <Route path="policies/cancellation" element={<CancellationPolicyPage />} />
                    <Route path="company" element={<CompanyDetailsPage />} />
                    <Route path="about" element={<Navigate to="/company" replace />} />
                    <Route path="contact" element={<ContactPage />} />
                    <Route path="support" element={<Navigate to="/contact" replace />} />

                    {/* 2. Guest-Only Routes (Redirect to / if logged in) */}
                    <Route
                      path="login"
                      element={
                        <GuestRoute>
                          <LoginPage />
                        </GuestRoute>
                      }
                    />
                    <Route
                      path="signup"
                      element={
                        <GuestRoute>
                          <SignupPage />
                        </GuestRoute>
                      }
                    />

                    {/* 3. Authenticated User Routes (Login Required) */}
                    <Route
                      path="my-bookings"
                      element={
                        <ProtectedRoute>
                          <MyBookingsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="my-bookings/:id"
                      element={
                        <ProtectedRoute>
                          <BookingDetailPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="bookings"
                      element={
                        <ProtectedRoute>
                          <MyBookingsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="wishlist"
                      element={
                        <ProtectedRoute>
                          <WishlistPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="travel-plans"
                      element={
                        <ProtectedRoute>
                          <TravelPlansPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="travel-plans/:id"
                      element={
                        <ProtectedRoute>
                          <TravelPlanDetailPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="inbox"
                      element={
                        <ProtectedRoute>
                          <InboxPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="inbox/:id"
                      element={
                        <ProtectedRoute>
                          <InboxPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* 4. Host & Listing Management Routes (Host / Owner Access) */}
                    <Route
                      path="dashboard"
                      element={
                        <ProtectedRoute>
                          <HostDashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="host/dashboard"
                      element={
                        <ProtectedRoute>
                          <HostDashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="listings/new"
                      element={
                        <ProtectedRoute>
                          <CreateListingPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="listings/:id/edit"
                      element={
                        <ProtectedRoute>
                          <EditListingPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* 5. Admin Dashboard Routes (Strict Admin Role Required) */}
                    <Route
                      path="admin"
                      element={
                        <AdminRoute>
                          <AdminDashboardPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="admin/dashboard"
                      element={
                        <AdminRoute>
                          <AdminDashboardPage />
                        </AdminRoute>
                      }
                    />

                    {/* 6. Wildcard 404 Catch-All Route */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </SocketProvider>
        </AuthProvider>
      </CurrencyProvider>
    </ToastProvider>
  );
}
