import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Search, Heart, Briefcase, MessageSquare, User } from 'lucide-react';

export default function MobileBottomNav() {
  const { user, unreadCount } = useAuth();
  const location = useLocation();

  const navItems = [
    {
      to: '/',
      label: 'Explore',
      icon: Search,
      isActive: location.pathname === '/' || location.pathname.startsWith('/listings') || location.pathname.startsWith('/search'),
    },
    {
      to: '/wishlist',
      label: 'Wishlists',
      icon: Heart,
      isActive: location.pathname.startsWith('/wishlist'),
    },
    {
      to: user ? '/profile#upcoming' : '/login',
      label: 'Trips',
      icon: Briefcase,
      isActive: location.pathname === '/profile' && location.hash === '#upcoming',
    },
    {
      to: user ? '/inbox' : '/login',
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadCount,
      isActive: location.pathname.startsWith('/inbox'),
    },
    {
      to: user ? '/profile' : '/login',
      label: user ? 'Profile' : 'Log in',
      icon: User,
      isActive: (location.pathname === '/profile' && location.hash !== '#upcoming') || location.pathname === '/login' || location.pathname === '/signup',
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-t border-[#DDDDDD] shadow-lg flex items-center justify-around px-2">
      {navItems.map((item, idx) => {
        const Icon = item.icon;
        const active = item.isActive;

        return (
          <NavLink
            key={idx}
            to={item.to}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all active:scale-90 relative ${
              active ? 'text-[#dc3545] font-bold' : 'text-[#717171] hover:text-zinc-900 font-medium'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 mb-0.5 ${active ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-[#dc3545] rounded-full ring-2 ring-white" />
              )}
            </div>
            <span className="text-[11px] tracking-tight">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
