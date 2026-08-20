import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import { CurrencyProvider } from './context/CurrencyContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

import Layout from './components/layout/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import ListingDetailPage from './pages/ListingDetailPage.jsx';
import CreateListingPage from './pages/CreateListingPage.jsx';
import EditListingPage from './pages/EditListingPage.jsx';
import SearchResultsPage from './pages/SearchResultsPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import HostDashboardPage from './pages/HostDashboardPage.jsx';
import InboxPage from './pages/InboxPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
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
                  {/* Home & Listings */}
                  <Route index element={<HomePage />} />
                  <Route path="listings" element={<Navigate to="/" replace />} />
                  <Route path="listings/new" element={<CreateListingPage />} />
                  <Route path="listings/:id" element={<ListingDetailPage />} />
                  <Route path="listings/:id/edit" element={<EditListingPage />} />

                  {/* Search & Categories */}
                  <Route path="search" element={<SearchResultsPage />} />
                  <Route path="category/:category" element={<CategoryPage />} />

                  {/* User features */}
                  <Route path="wishlist" element={<WishlistPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="dashboard" element={<HostDashboardPage />} />
                  <Route path="inbox" element={<InboxPage />} />

                  {/* Auth */}
                  <Route path="login" element={<LoginPage />} />
                  <Route path="signup" element={<SignupPage />} />

                  {/* 404 */}
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
