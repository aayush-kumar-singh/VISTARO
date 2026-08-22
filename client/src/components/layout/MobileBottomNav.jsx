import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Search, Heart, Briefcase, MessageSquare, User, Sun, Moon } from 'lucide-react';

export default function MobileBottomNav() {
  const { user, unreadCount } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    {
      to: '/explore',
      label: 'Explore',
      icon: Search,
      isActive: location.pathname === '/explore' || location.pathname.startsWith('/listings') || location.pathname.startsWith('/search'),
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-vistaro-surface/95 backdrop-blur-md border-t border-vistaro-border shadow-lg flex items-center justify-around px-2 transition-colors duration-200">
      {navItems.map((item, idx) => {
        const Icon = item.icon;
        const active = item.isActive;

        return (
          <NavLink
            key={idx}
            to={item.to}
            className={`flex flex-col items-center justify-center min-w-[48px] py-1 transition-all active:scale-90 relative ${active ? 'text-vistaro-accent' : 'text-vistaro-muted hover:text-vistaro-primary'
              }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 mb-0.5 ${active ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-vistaro-accent rounded-full ring-2 ring-vistaro-surface" />
              )}
            </div>
            <span className={`text-2xs ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
          </NavLink>
        );
      })}

      {/* Mobile Quick Theme Switcher */}
      <button
        type="button"
        onClick={toggleTheme}
        className="flex flex-col items-center justify-center min-w-[44px] py-1 text-vistaro-muted hover:text-vistaro-primary transition-all active:scale-90 cursor-pointer border-none bg-transparent"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? (
          <Sun className="w-5 h-5 mb-0.5 text-vistaro-rating" />
        ) : (
          <Moon className="w-5 h-5 mb-0.5 text-vistaro-secondary" />
        )}
        <span className="text-2xs font-medium">{isDark ? 'Light' : 'Dark'}</span>
      </button>
    </nav>
  );
}
