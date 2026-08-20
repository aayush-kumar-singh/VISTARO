import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-full bg-red-50 text-[#dc3545] flex items-center justify-center">
        <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '8s' }} />
      </div>
      <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-zinc-800">Page Not Found</h2>
      <p className="text-sm text-zinc-500 max-w-md">
        We couldn't find the page you were looking for. It might have been moved or removed.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs sm:text-sm font-bold py-3 px-6 rounded-full transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Homepage
      </Link>
    </div>
  );
}
