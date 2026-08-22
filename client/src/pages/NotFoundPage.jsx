import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4 text-vistaro-primary transition-colors duration-200">
      <div className="w-16 h-16 rounded-full bg-vistaro-secondary border border-vistaro-border text-vistaro-accent flex items-center justify-center">
        <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '8s' }} />
      </div>
      <h1 className="text-display-hero text-6xl sm:text-7xl text-vistaro-primary">404</h1>
      <h2 className="text-display-h2 text-xl text-vistaro-primary">Page Not Found</h2>
      <p className="text-body text-vistaro-muted max-w-md">
        We couldn't find the page you were looking for. It might have been moved or removed.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-6 rounded-full transition-colors shadow-sm cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Homepage
      </Link>
    </div>
  );
}
