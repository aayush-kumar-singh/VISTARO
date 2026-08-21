import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import MobileBottomNav from './MobileBottomNav.jsx';
import ToastContainer from '../common/ToastContainer.jsx';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-vistaro-main text-vistaro-primary transition-colors duration-200">
      <ToastContainer />
      <Navbar />

      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-8 md:px-10 lg:px-12 py-6 pb-24 md:pb-8">
        <Outlet />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
