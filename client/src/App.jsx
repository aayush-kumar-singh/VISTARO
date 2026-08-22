import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import { CurrencyProvider } from './context/CurrencyContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

import Layout from './components/layout/Layout.jsx';
import AdminRoute from './components/auth/AdminRoute.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import GuestRoute from './components/auth/GuestRoute.jsx';

import HomePage from './pages/HomePage.jsx';
import ListingDetailPage from './pages/ListingDetailPage.jsx';
import CreateListingPage from './pages/CreateListingPage.jsx';
import EditListingPage from './pages/EditListingPage.jsx';
import SearchResultsPage from './pages/SearchResultsPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import DestinationsPage from './pages/DestinationsPage.jsx';
import DestinationDetailPage from './pages/DestinationDetailPage.jsx';
import TourPackagesPage from './pages/TourPackagesPage.jsx';
import TourPackageDetailPage from './pages/TourPackageDetailPage.jsx';
import ExperiencesListPage from './pages/ExperiencesListPage.jsx';
import ExperienceDetailPage from './pages/ExperienceDetailPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import TravelPlansPage from './pages/TravelPlansPage.jsx';
import TravelPlanDetailPage from './pages/TravelPlanDetailPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import BookingDetailPage from './pages/BookingDetailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import HostDashboardPage from './pages/HostDashboardPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import InboxPage from './pages/InboxPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import CompanyDetailsPage from './pages/CompanyDetailsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <ToastProvider>
      <CurrencyProvider>
        <AuthProvider>
          <SocketProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  {/* 1. Public Browsing Routes (100% Unrestricted) */}
                  <Route index element={<HomePage />} />
                  <Route path="listings" element={<Navigate to="/" replace />} />
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
                  <Route path="company" element={<CompanyDetailsPage />} />
                  <Route path="about" element={<Navigate to="/company" replace />} />

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
                    path="bookings/:id"
                    element={
                      <ProtectedRoute>
                        <BookingDetailPage />
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
                    path="inbox"
                    element={
                      <ProtectedRoute>
                        <InboxPage />
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
                    path="dashboard"
                    element={
                      <ProtectedRoute>
                        <HostDashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 4. Administrator Protected Routes (Admin Role Required) */}
                  <Route
                    path="admin"
                    element={
                      <AdminRoute>
                        <AdminDashboardPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="listings/new"
                    element={
                      <AdminRoute>
                        <CreateListingPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="listings/:id/edit"
                    element={
                      <AdminRoute>
                        <EditListingPage />
                      </AdminRoute>
                    }
                  />

                  {/* 5. 404 Fallback */}
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </SocketProvider>
        </AuthProvider>
      </CurrencyProvider>
    </ToastProvider>
  );
}
