import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { adminApi } from '../api/adminApi.js';
import { destinationsApi } from '../api/destinationsApi.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
  ShieldCheck,
  PlusCircle,
  Users,
  Home,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  AlertTriangle,
  X,
  Building2,
  Clock,
  Sparkles,
  ChevronRight,
  Shield,
  Compass,
  MapPin,
  Layers,
  Tag,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Eye,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'listings' | 'packages' | 'users' | 'bookings'
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [tourPackagesList, setTourPackagesList] = useState([]);
  const [experiencesList, setExperiencesList] = useState([]);
  const [destinationsList, setDestinationsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Search/Filter states for tables
  const [listingSearch, setListingSearch] = useState('');
  const [packageSearch, setPackageSearch] = useState('');
  const [experienceSearch, setExperienceSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [error, setError] = useState(null);

  // Experience Modal State
  const [experienceModal, setExperienceModal] = useState(null);
  const [experienceForm, setExperienceForm] = useState({
    title: '',
    slug: '',
    destination: '',
    category: 'Adventure',
    shortDescription: '',
    longDescription: '',
    coverImageUrl: '',
    durationHours: 2,
    basePrice: 2500,
    maxGroupSize: 10,
    difficultyLevel: 'Easy',
    whatsIncluded: '',
    meetingPoint: '',
    isActive: true,
  });

  // Package Modal State
  const [packageModal, setPackageModal] = useState(null);
  const [packageForm, setPackageForm] = useState({
    title: '',
    slug: '',
    destination: '',
    shortDescription: '',
    longDescription: '',
    coverImageUrl: '',
    durationDays: 3,
    durationNights: 2,
    basePrice: 15000,
    maxGroupSize: 12,
    difficultyLevel: 'Moderate',
    inclusions: '',
    exclusions: '',
    isActive: true,
  });

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(null); // { type: 'listing'|'user', id: string, name: string }

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, usersData, packagesData, destinationsData, experiencesData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getTourPackages().catch(() => ({ success: false, tourPackages: [] })),
        destinationsApi.getDestinations().catch(() => ({ success: false, destinations: [] })),
        adminApi.getExperiences().catch(() => ({ success: false, experiences: [] })),
      ]);

      if (statsData.success) {
        setStats(statsData.stats);
        setRecentBookings(statsData.recentBookings || []);
        setRecentListings(statsData.recentListings || []);
      }

      if (usersData.success) {
        setUsersList(usersData.users || []);
      }

      if (packagesData.success) {
        setTourPackagesList(packagesData.tourPackages || []);
      }

      if (destinationsData.success) {
        setDestinationsList(destinationsData.destinations || []);
      }

      if (experiencesData.success) {
        setExperiencesList(experiencesData.experiences || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load administrative data.');
      showError(err.message || 'Failed to load administrative data.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Handle Experience Modal Open (Create / Edit)
  const openCreateExperienceModal = () => {
    setExperienceForm({
      title: '',
      slug: '',
      destination: destinationsList[0]?._id || '',
      category: 'Adventure',
      shortDescription: '',
      longDescription: '',
      coverImageUrl: '',
      durationHours: 2,
      basePrice: 2500,
      maxGroupSize: 10,
      difficultyLevel: 'Easy',
      whatsIncluded: 'Certified local host guide\nEssential safety gear & permits\nRefreshments & tasting snacks',
      meetingPoint: 'Central Meeting Landmark',
      isActive: true,
    });
    setExperienceModal({ mode: 'create' });
  };

  const openEditExperienceModal = (exp) => {
    const includedStr = Array.isArray(exp.whatsIncluded)
      ? exp.whatsIncluded.join('\n')
      : exp.whatsIncluded || '';

    setExperienceForm({
      title: exp.title || '',
      slug: exp.slug || '',
      destination: exp.destination?._id || exp.destination || '',
      category: exp.category || 'Adventure',
      shortDescription: exp.shortDescription || '',
      longDescription: exp.longDescription || '',
      coverImageUrl: exp.coverImage?.url || exp.image?.url || '',
      durationHours: exp.durationHours || 2,
      basePrice: exp.price?.basePrice ?? exp.basePrice ?? 2500,
      maxGroupSize: exp.maxGroupSize || 10,
      difficultyLevel: exp.difficultyLevel || 'Easy',
      whatsIncluded: includedStr,
      meetingPoint: exp.meetingPoint || '',
      isActive: exp.isActive !== false,
    });
    setExperienceModal({ mode: 'edit', id: exp._id });
  };

  const handleSaveExperience = async (e) => {
    e.preventDefault();
    if (!experienceForm.title.trim() || !experienceForm.destination) {
      showError('Please provide a title and select a valid destination.');
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        title: experienceForm.title.trim(),
        slug: experienceForm.slug.trim() || experienceForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        destination: experienceForm.destination,
        category: experienceForm.category,
        shortDescription: experienceForm.shortDescription.trim(),
        longDescription: experienceForm.longDescription.trim(),
        coverImage: { url: experienceForm.coverImageUrl.trim(), filename: '' },
        durationHours: Number(experienceForm.durationHours),
        price: {
          basePrice: Number(experienceForm.basePrice),
          currency: 'INR',
        },
        maxGroupSize: Number(experienceForm.maxGroupSize),
        difficultyLevel: experienceForm.difficultyLevel,
        whatsIncluded: experienceForm.whatsIncluded.split('\n').map(s => s.trim()).filter(Boolean),
        meetingPoint: experienceForm.meetingPoint.trim(),
        isActive: Boolean(experienceForm.isActive),
      };

      if (experienceModal.mode === 'create') {
        const res = await adminApi.createExperience(payload);
        showSuccess(res.message || 'Experience created successfully!');
        setExperiencesList((prev) => [res.experience, ...prev]);
      } else {
        const res = await adminApi.updateExperience(experienceModal.id, payload);
        showSuccess(res.message || 'Experience updated successfully!');
        setExperiencesList((prev) =>
          prev.map((item) => (item._id === experienceModal.id ? res.experience : item))
        );
      }

      setExperienceModal(null);
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to save experience.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleExperienceActive = async (exp) => {
    const action = exp.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} "${exp.title}"?`)) return;

    try {
      setActionLoading(true);
      if (exp.isActive) {
        const res = await adminApi.deactivateExperience(exp._id);
        showSuccess(res.message || 'Experience deactivated.');
        setExperiencesList((prev) =>
          prev.map((e) => (e._id === exp._id ? { ...e, isActive: false } : e))
        );
      } else {
        const res = await adminApi.updateExperience(exp._id, { isActive: true });
        showSuccess(res.message || 'Experience activated.');
        setExperiencesList((prev) =>
          prev.map((e) => (e._id === exp._id ? { ...e, isActive: true } : e))
        );
      }
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to update experience status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Package Modal Open (Create / Edit)
  const openCreatePackageModal = () => {
    setPackageForm({
      title: '',
      slug: '',
      destination: destinationsList[0]?._id || '',
      shortDescription: '',
      longDescription: '',
      coverImageUrl: '',
      durationDays: 3,
      durationNights: 2,
      basePrice: 15000,
      maxGroupSize: 12,
      difficultyLevel: 'Moderate',
      inclusions: 'Luxury Accommodation\nBreakfast & Dinner\nLocal Guide & Sightseeing\nAirport Transfers',
      exclusions: 'Personal Expenses\nFlight Tickets\nInsurance',
      itinerary: [
        { dayNumber: 1, title: 'Arrival & Welcome Briefing', description: 'Arrive at destination, check into accommodations, and meet your trip leader for an orientation dinner.', activities: 'Airport meet & greet\nHotel check-in\nWelcome briefing' },
        { dayNumber: 2, title: 'Regional Discovery & Highlights', description: 'Full-day guided excursion exploring iconic natural landmarks, heritage points, and local artisan spots.', activities: 'Guided sightseeing tour\nLocal cuisine tasting\nScenic photography' },
        { dayNumber: 3, title: 'Farewell & Departure', description: 'Morning leisure, breakfast at the stay, and private transfer to airport or onward journey.', activities: 'Breakfast at stay\nSouvenir shopping\nAirport drop-off' },
      ],
      isActive: true,
    });
    setPackageModal({ mode: 'create' });
  };

  const openEditPackageModal = (pkg) => {
    const rawItinerary = Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0
      ? pkg.itinerary.map((d, idx) => ({
          dayNumber: d.dayNumber || idx + 1,
          title: d.title || `Day ${idx + 1}`,
          description: d.description || '',
          activities: Array.isArray(d.activities) ? d.activities.join('\n') : d.activities || '',
        }))
      : [
          { dayNumber: 1, title: 'Arrival & Briefing', description: '', activities: '' },
        ];

    setPackageForm({
      title: pkg.title || '',
      slug: pkg.slug || '',
      destination: typeof pkg.destination === 'object' ? pkg.destination?._id : pkg.destination || '',
      shortDescription: pkg.shortDescription || '',
      longDescription: pkg.longDescription || '',
      coverImageUrl: pkg.coverImage?.url || pkg.image?.url || '',
      durationDays: pkg.duration?.days || 3,
      durationNights: pkg.duration?.nights || 2,
      basePrice: pkg.price?.basePrice ?? pkg.basePrice ?? 15000,
      maxGroupSize: pkg.maxGroupSize || 12,
      difficultyLevel: pkg.difficultyLevel || 'Moderate',
      inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions.join('\n') : pkg.inclusions || '',
      exclusions: Array.isArray(pkg.exclusions) ? pkg.exclusions.join('\n') : pkg.exclusions || '',
      itinerary: rawItinerary,
      isActive: pkg.isActive ?? true,
    });
    setPackageModal({ mode: 'edit', id: pkg._id });
  };

  // Itinerary builder handlers
  const handleAddItineraryDay = () => {
    setPackageForm((prev) => {
      const nextDay = (prev.itinerary || []).length + 1;
      return {
        ...prev,
        itinerary: [
          ...(prev.itinerary || []),
          { dayNumber: nextDay, title: `Day ${nextDay} Itinerary`, description: '', activities: '' },
        ],
      };
    });
  };

  const handleRemoveItineraryDay = (indexToRemove) => {
    setPackageForm((prev) => {
      const filtered = (prev.itinerary || []).filter((_, i) => i !== indexToRemove);
      return {
        ...prev,
        itinerary: filtered.map((day, idx) => ({ ...day, dayNumber: idx + 1 })),
      };
    });
  };

  const handleUpdateItineraryDay = (index, field, value) => {
    setPackageForm((prev) => {
      const updated = [...(prev.itinerary || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, itinerary: updated };
    });
  };

  // Handle Save Package (Create or Update)
  const handleSavePackage = async (e) => {
    e.preventDefault();

    if (!packageForm.title.trim() || !packageForm.slug.trim() || !packageForm.destination || !packageForm.coverImageUrl.trim()) {
      showError('Please fill in title, slug, destination, and cover image URL.');
      return;
    }

    try {
      setActionLoading(true);

      const parsedItinerary = (packageForm.itinerary || [])
        .filter((d) => d.title && d.title.trim())
        .map((d, idx) => ({
          dayNumber: Number(d.dayNumber || idx + 1),
          title: d.title.trim(),
          description: (d.description || '').trim(),
          activities: typeof d.activities === 'string'
            ? d.activities.split('\n').map((a) => a.trim()).filter(Boolean)
            : Array.isArray(d.activities) ? d.activities : [],
        }));

      const payload = {
        title: packageForm.title.trim(),
        slug: packageForm.slug.trim().toLowerCase(),
        destination: packageForm.destination,
        shortDescription: packageForm.shortDescription.trim(),
        longDescription: packageForm.longDescription.trim(),
        coverImage: { url: packageForm.coverImageUrl.trim(), filename: '' },
        duration: {
          days: Number(packageForm.durationDays),
          nights: Number(packageForm.durationNights),
        },
        price: {
          basePrice: Number(packageForm.basePrice),
          currency: 'INR',
        },
        maxGroupSize: Number(packageForm.maxGroupSize),
        difficultyLevel: packageForm.difficultyLevel,
        inclusions: packageForm.inclusions.split('\n').map(s => s.trim()).filter(Boolean),
        exclusions: packageForm.exclusions.split('\n').map(s => s.trim()).filter(Boolean),
        itinerary: parsedItinerary,
        isActive: Boolean(packageForm.isActive),
      };

      if (packageModal.mode === 'create') {
        const res = await adminApi.createTourPackage(payload);
        showSuccess(res.message || 'Tour package created successfully!');
        setTourPackagesList((prev) => [res.tourPackage, ...prev]);
      } else {
        const res = await adminApi.updateTourPackage(packageModal.id, payload);
        showSuccess(res.message || 'Tour package updated successfully!');
        setTourPackagesList((prev) =>
          prev.map((p) => (p._id === packageModal.id ? res.tourPackage : p))
        );
      }

      setPackageModal(null);
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to save tour package.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Package Deactivate / Toggle
  const handleTogglePackageActive = async (pkg) => {
    const action = pkg.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} "${pkg.title}"?`)) return;

    try {
      setActionLoading(true);
      if (pkg.isActive) {
        // Soft delete via DELETE
        const res = await adminApi.deactivateTourPackage(pkg._id);
        showSuccess(res.message || 'Tour package deactivated.');
        setTourPackagesList((prev) =>
          prev.map((p) => (p._id === pkg._id ? { ...p, isActive: false } : p))
        );
      } else {
        // Activate via PATCH
        const res = await adminApi.updateTourPackage(pkg._id, { isActive: true });
        showSuccess(res.message || 'Tour package activated.');
        setTourPackagesList((prev) =>
          prev.map((p) => (p._id === pkg._id ? { ...p, isActive: true } : p))
        );
      }
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to update tour package status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Role Toggle (Promote/Demote)
  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const confirmMsg = `Are you sure you want to change @${targetUser.username}'s role to ${newRole.toUpperCase()}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(true);
      const res = await adminApi.updateUserRole(targetUser._id, newRole);
      showSuccess(res.message || `User role updated to ${newRole}`);
      // Refresh user list locally
      setUsersList((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      showError(err.message || 'Failed to update user role.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Deletions (Listing or User)
  const handleConfirmDelete = async () => {
    if (!deleteModal) return;

    try {
      setActionLoading(true);
      if (deleteModal.type === 'listing') {
        const res = await adminApi.deleteListing(deleteModal.id);
        showSuccess(res.message || 'Listing permanently removed.');
        setRecentListings((prev) => prev.filter((l) => l._id !== deleteModal.id));
        setStats((prev) => (prev ? { ...prev, totalListings: Math.max(0, prev.totalListings - 1) } : prev));
      } else if (deleteModal.type === 'user') {
        const res = await adminApi.deleteUser(deleteModal.id);
        showSuccess(res.message || 'User account deleted.');
        setUsersList((prev) => prev.filter((u) => u._id !== deleteModal.id));
        setStats((prev) => (prev ? { ...prev, totalUsers: Math.max(0, prev.totalUsers - 1) } : prev));
      }
      setDeleteModal(null);
    } catch (err) {
      showError(err.message || 'Failed to delete item.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading Administrator Dashboard..." />;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-red-200 rounded-3xl text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-red-100 text-[#dc3545] flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Admin Console Error</h2>
        <p className="text-sm text-zinc-500">{error}</p>
        <div className="pt-2">
          <button
            type="button"
            onClick={fetchAdminData}
            className="bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs font-bold py-3 px-6 rounded-full transition-colors cursor-pointer"
          >
            Retry Loading Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Filter listings
  const filteredListings = recentListings.filter(
    (l) =>
      l.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
      l.location.toLowerCase().includes(listingSearch.toLowerCase()) ||
      l.category?.toLowerCase().includes(listingSearch.toLowerCase())
  );

  // Filter users
  const filteredUsers = usersList.filter(
    (u) =>
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Filter tour packages
  const filteredTourPackages = tourPackagesList.filter((pkg) => {
    const q = packageSearch.toLowerCase();
    const title = (pkg.title || '').toLowerCase();
    const destName = (pkg.destination?.name || '').toLowerCase();
    const slug = (pkg.slug || '').toLowerCase();
    return title.includes(q) || destName.includes(q) || slug.includes(q);
  });

  // Filter experiences
  const filteredExperiences = experiencesList.filter((exp) => {
    const q = experienceSearch.toLowerCase();
    const title = (exp.title || '').toLowerCase();
    const destName = (exp.destination?.name || '').toLowerCase();
    const slug = (exp.slug || '').toLowerCase();
    const cat = (exp.category || '').toLowerCase();
    return title.includes(q) || destName.includes(q) || slug.includes(q) || cat.includes(q);
  });

  return (
    <div className="w-full space-y-8 animate-fade-in text-[#222222]">
      
      {/* 1. Header Banner & New Listing CTA */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Shield className="w-3.5 h-3.5 text-[#dc3545]" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Vistaro Global Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
            Manage properties, publish verified tour packages & host-led experiences, review platform revenue, and oversee user roles.
          </p>
        </div>

        {/* Action Button: Quick CTAs */}
        <div className="relative z-10 shrink-0 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openCreateExperienceModal}
            className="bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs sm:text-sm font-bold py-3 px-5 rounded-full transition-all border border-purple-400/30 flex items-center justify-center gap-2 cursor-pointer backdrop-blur-xs"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>New Experience</span>
          </button>
          <button
            type="button"
            onClick={openCreatePackageModal}
            className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold py-3 px-5 rounded-full transition-all border border-white/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>New Package</span>
          </button>
          <Link
            to="/listings/new"
            className="bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs sm:text-sm font-bold py-3 px-5 rounded-full transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>New Listing</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1: Total Revenue */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Booking Volume</div>
            <div className="text-xl font-extrabold text-zinc-900 mt-0.5">
              {formatPrice(stats?.totalRevenue || 0)}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Gross Total
            </div>
          </div>
        </div>

        {/* Metric 2: Active Listings */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#dc3545] flex items-center justify-center shrink-0">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Active Listings</div>
            <div className="text-xl font-extrabold text-zinc-900 mt-0.5">
              {stats?.totalListings || 0}
            </div>
            <div className="text-[10px] text-zinc-400 font-medium mt-0.5">
              Published stays
            </div>
          </div>
        </div>

        {/* Metric 3: Tour Packages */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Tour Packages</div>
            <div className="text-xl font-extrabold text-zinc-900 mt-0.5">
              {tourPackagesList.length}
            </div>
            <div className="text-[10px] text-zinc-400 font-medium mt-0.5">
              Multi-day expeditions
            </div>
          </div>
        </div>

        {/* Metric 4: Experiences */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Experiences</div>
            <div className="text-xl font-extrabold text-zinc-900 mt-0.5">
              {experiencesList.length}
            </div>
            <div className="text-[10px] text-zinc-400 font-medium mt-0.5">
              Host immersion sessions
            </div>
          </div>
        </div>

        {/* Metric 5: Registered Users */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Registered Users</div>
            <div className="text-xl font-extrabold text-zinc-900 mt-0.5">
              {stats?.totalUsers || 0}
            </div>
            <div className="text-[10px] text-zinc-400 font-medium mt-0.5">
              Platform members
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs Bar */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-zinc-200/60 rounded-full w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#222222] text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Console Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'listings'
              ? 'bg-[#222222] text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          All Listings ({recentListings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('packages')}
          className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'packages'
              ? 'bg-[#222222] text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-amber-500" />
          <span>Tour Packages ({tourPackagesList.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('experiences')}
          className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'experiences'
              ? 'bg-[#222222] text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <span>Experiences ({experiencesList.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-[#222222] text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          User Management ({usersList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-[#222222] text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Platform Bookings ({recentBookings.length})
        </button>
      </div>

      {/* 4. Tab Content */}
      
      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Quick Listings Preview */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
                <Home className="w-4 h-4 text-[#dc3545]" /> Recent Properties
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('listings')}
                className="text-xs font-bold text-[#dc3545] hover:underline"
              >
                View all &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {recentListings.slice(0, 5).map((listing) => (
                <div
                  key={listing._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={listing.images?.[0]?.url || listing.image?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=60'}
                      alt={listing.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 bg-zinc-200"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-zinc-900 truncate">{listing.title}</h4>
                      <p className="text-[11px] text-zinc-500 truncate">{listing.location}, {listing.country}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-zinc-900">{formatPrice(listing.price)}</div>
                    <span className="text-[10px] text-zinc-400 capitalize">{listing.category || 'Stay'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Bookings Preview */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-600" /> Recent Bookings
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('bookings')}
                className="text-xs font-bold text-[#dc3545] hover:underline"
              >
                View all &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {recentBookings.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-400">No reservations placed yet.</div>
              ) : (
                recentBookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-zinc-900 truncate">
                        {booking.listing?.title || 'Stay Reservation'}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Guest: @{booking.user?.username || 'Guest'} &middot; {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-extrabold text-[#dc3545]">
                        {formatPrice(booking.totalPrice || 0)}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: ALL LISTINGS MANAGEMENT */}
      {activeTab === 'listings' && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
            <div>
              <h3 className="font-bold text-base text-zinc-900">Platform Property Listings</h3>
              <p className="text-xs text-zinc-500">Review, inspect, edit, or delete any listing across Vistaro.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter listings..."
                  value={listingSearch}
                  onChange={(e) => setListingSearch(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-full pl-8 pr-4 py-2 text-xs focus:outline-hidden focus:border-[#dc3545] w-48 sm:w-64"
                />
              </div>

              <Link
                to="/listings/new"
                className="bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs font-bold py-2 px-4 rounded-full transition-colors shrink-0 flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Stay</span>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Stay</th>
                  <th className="pb-3 font-semibold">Location</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Price / Night</th>
                  <th className="pb-3 font-semibold">Host</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredListings.map((listing) => (
                  <tr key={listing._id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={listing.images?.[0]?.url || listing.image?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=60'}
                          alt={listing.title}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 bg-zinc-200"
                        />
                        <div className="font-bold text-zinc-900 truncate max-w-xs">{listing.title}</div>
                      </div>
                    </td>
                    <td className="py-3 text-zinc-600">{listing.location}, {listing.country}</td>
                    <td className="py-3">
                      <span className="bg-zinc-100 text-zinc-700 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                        {listing.category || 'Stay'}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-zinc-900">{formatPrice(listing.price)}</td>
                    <td className="py-3 text-zinc-600">@{listing.owner?.username || 'Host'}</td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/listings/${listing._id}`}
                          className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                          title="View on site"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/listings/${listing._id}/edit`}
                          className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit listing"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteModal({ type: 'listing', id: listing._id, name: listing.title })}
                          className="p-1.5 text-zinc-500 hover:text-[#dc3545] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: TOUR PACKAGES MANAGEMENT */}
      {activeTab === 'packages' && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
            <div>
              <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-600" />
                <span>Regional Tour Packages ({tourPackagesList.length})</span>
              </h3>
              <p className="text-xs text-zinc-500">Create, publish, edit, or deactivate curated multi-day tour experiences.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter packages..."
                  value={packageSearch}
                  onChange={(e) => setPackageSearch(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-full pl-8 pr-4 py-2 text-xs focus:outline-hidden focus:border-[#dc3545] w-48 sm:w-64"
                />
              </div>

              <button
                type="button"
                onClick={openCreatePackageModal}
                className="bg-zinc-900 hover:bg-black text-white text-xs font-bold py-2 px-4 rounded-full transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Package</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Package Experience</th>
                  <th className="pb-3 font-semibold">Destination</th>
                  <th className="pb-3 font-semibold">Duration</th>
                  <th className="pb-3 font-semibold">Base Price</th>
                  <th className="pb-3 font-semibold">Difficulty</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredTourPackages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400">
                      No tour packages found. Click "Create Package" to publish your first regional itinerary.
                    </td>
                  </tr>
                ) : (
                  filteredTourPackages.map((pkg) => (
                    <tr key={pkg._id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={pkg.coverImage?.url || pkg.image?.url || 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=200&q=60'}
                            alt={pkg.title}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 bg-zinc-200"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-zinc-900 truncate max-w-xs">{pkg.title}</div>
                            <div className="text-[10px] text-zinc-400 font-mono">/{pkg.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="bg-red-50 text-[#dc3545] font-semibold px-2 py-0.5 rounded-full text-[10px]">
                          {pkg.destination?.name || 'Curated'}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-zinc-700">
                        {pkg.duration?.days || 1}D / {pkg.duration?.nights || 0}N
                      </td>
                      <td className="py-3 font-bold text-zinc-900">
                        {formatPrice(pkg.price?.basePrice ?? pkg.basePrice ?? 0)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                            pkg.difficultyLevel === 'Easy'
                              ? 'bg-emerald-50 text-emerald-700'
                              : pkg.difficultyLevel === 'Challenging'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {pkg.difficultyLevel || 'Moderate'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            pkg.isActive !== false
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-zinc-200 text-zinc-600'
                          }`}
                        >
                          {pkg.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditPackageModal(pkg)}
                            className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit package"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTogglePackageActive(pkg)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              pkg.isActive !== false
                                ? 'text-zinc-500 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={pkg.isActive !== false ? 'Deactivate package' : 'Activate package'}
                          >
                            {pkg.isActive !== false ? (
                              <ToggleRight className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-zinc-400" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: EXPERIENCES MANAGEMENT (Phase 3) */}
      {activeTab === 'experiences' && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
            <div>
              <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Host-Led Experiences ({experiencesList.length})</span>
              </h3>
              <p className="text-xs text-zinc-500">Create, publish, edit, or deactivate curated local immersion activities.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter experiences..."
                  value={experienceSearch}
                  onChange={(e) => setExperienceSearch(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded-full pl-8 pr-4 py-2 text-xs focus:outline-hidden focus:border-[#dc3545] w-48 sm:w-64"
                />
              </div>

              <button
                type="button"
                onClick={openCreateExperienceModal}
                className="bg-zinc-900 hover:bg-black text-white text-xs font-bold py-2 px-4 rounded-full transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Experience</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Experience</th>
                  <th className="pb-3 font-semibold">Destination</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Duration</th>
                  <th className="pb-3 font-semibold">Base Price</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredExperiences.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400">
                      No experiences found. Click "Create Experience" to publish your first local host activity.
                    </td>
                  </tr>
                ) : (
                  filteredExperiences.map((exp) => (
                    <tr key={exp._id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={exp.coverImage?.url || exp.image?.url || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=200&q=60'}
                            alt={exp.title}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 bg-zinc-200"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-zinc-900 truncate max-w-xs">{exp.title}</div>
                            <div className="text-[10px] text-zinc-400 font-mono">/{exp.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="bg-red-50 text-[#dc3545] font-semibold px-2 py-0.5 rounded-full text-[10px]">
                          {exp.destination?.name || 'Curated'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                          {exp.category || 'Adventure'}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-zinc-700">
                        {exp.durationHours || 2} Hours
                      </td>
                      <td className="py-3 font-bold text-zinc-900">
                        {formatPrice(exp.price?.basePrice ?? exp.basePrice ?? 0)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            exp.isActive !== false
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-zinc-200 text-zinc-600'
                          }`}
                        >
                          {exp.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditExperienceModal(exp)}
                            className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit experience"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleExperienceActive(exp)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              exp.isActive !== false
                                ? 'text-zinc-500 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={exp.isActive !== false ? 'Deactivate experience' : 'Activate experience'}
                          >
                            {exp.isActive !== false ? (
                              <ToggleRight className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-zinc-400" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
            <div>
              <h3 className="font-bold text-base text-zinc-900">User Directory & Roles</h3>
              <p className="text-xs text-zinc-500">Manage user accounts and grant/revoke administrator roles.</p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by username or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-full pl-8 pr-4 py-2 text-xs focus:outline-hidden focus:border-[#dc3545] w-56 sm:w-72"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Joined Date</th>
                  <th className="pb-3 font-semibold">Listings</th>
                  <th className="pb-3 font-semibold">Bookings</th>
                  <th className="pb-3 font-semibold">Current Role</th>
                  <th className="pb-3 font-semibold text-right">Role Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredUsers.map((u) => {
                  const isCurrentAdmin = u._id === user?._id;

                  return (
                    <tr key={u._id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5 font-bold text-zinc-900">
                          <div className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center font-bold text-xs uppercase">
                            {u.username?.charAt(0) || 'U'}
                          </div>
                          <span>@{u.username}</span>
                          {isCurrentAdmin && (
                            <span className="text-[10px] bg-red-100 text-[#dc3545] px-2 py-0.5 rounded-full font-bold">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-zinc-600">{u.email}</td>
                      <td className="py-3 text-zinc-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 font-semibold text-zinc-800">{u.listingCount || 0}</td>
                      <td className="py-3 font-semibold text-zinc-800">{u.bookingCount || 0}</td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-red-50 text-[#dc3545] border border-red-200'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            disabled={actionLoading || isCurrentAdmin}
                            onClick={() => handleToggleRole(u)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                              u.role === 'admin'
                                ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                                : 'bg-[#dc3545] hover:bg-[#b02a37] text-white shadow-xs'
                            }`}
                          >
                            {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                          </button>

                          {!isCurrentAdmin && (
                            <button
                              type="button"
                              onClick={() => setDeleteModal({ type: 'user', id: u._id, name: `@${u.username}` })}
                              className="p-1.5 text-zinc-400 hover:text-[#dc3545] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete user account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PLATFORM BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div>
              <h3 className="font-bold text-base text-zinc-900">All System Reservations</h3>
              <p className="text-xs text-zinc-500">Live feed of all customer bookings and transaction totals.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Booking ID</th>
                  <th className="pb-3 font-semibold">Stay</th>
                  <th className="pb-3 font-semibold">Guest</th>
                  <th className="pb-3 font-semibold">Check-In</th>
                  <th className="pb-3 font-semibold">Check-Out</th>
                  <th className="pb-3 font-semibold">Guests</th>
                  <th className="pb-3 font-semibold">Total Paid</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3 font-mono text-zinc-400 text-[10px]">#{b._id.slice(-6)}</td>
                    <td className="py-3 font-bold text-zinc-900 truncate max-w-xs">{b.listing?.title || 'Stay'}</td>
                    <td className="py-3 text-zinc-700">@{b.user?.username || 'Guest'}</td>
                    <td className="py-3 text-zinc-600">{new Date(b.checkIn).toLocaleDateString()}</td>
                    <td className="py-3 text-zinc-600">{new Date(b.checkOut).toLocaleDateString()}</td>
                    <td className="py-3 text-zinc-700">{b.guests}</td>
                    <td className="py-3 font-extrabold text-[#dc3545]">{formatPrice(b.totalPrice || 0)}</td>
                    <td className="py-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tour Package Create / Edit Modal */}
      {packageModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-zinc-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-zinc-900">
                    {packageModal.mode === 'create' ? 'Create Tour Package' : 'Edit Tour Package'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {packageModal.mode === 'create' ? 'Publish a new regional multi-day package' : 'Update package details, duration, or pricing'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPackageModal(null)}
                className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4 text-xs">
              
              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Package Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ladakh High Altitude Bike Expedition"
                    value={packageForm.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPackageForm((prev) => ({
                        ...prev,
                        title: val,
                        slug: packageModal.mode === 'create' ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : prev.slug,
                      }));
                    }}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#dc3545]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ladakh-high-altitude-bike-expedition"
                    value={packageForm.slug}
                    onChange={(e) => setPackageForm({ ...packageForm, slug: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-hidden focus:border-[#dc3545]"
                    required
                  />
                </div>
              </div>

              {/* Destination & Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Destination Region *
                  </label>
                  <select
                    value={packageForm.destination}
                    onChange={(e) => setPackageForm({ ...packageForm, destination: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#dc3545] cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select a curated destination</option>
                    {destinationsList.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} {d.state ? `(${d.state})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={packageForm.difficultyLevel}
                    onChange={(e) => setPackageForm({ ...packageForm, difficultyLevel: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#dc3545] cursor-pointer"
                  >
                    <option value="Easy">Easy (Relaxed / Family-friendly)</option>
                    <option value="Moderate">Moderate (Active Walking / Exploring)</option>
                    <option value="Challenging">Challenging (High Altitude / Trekking)</option>
                  </select>
                </div>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  Cover Image URL *
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={packageForm.coverImageUrl}
                  onChange={(e) => setPackageForm({ ...packageForm, coverImageUrl: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#dc3545]"
                  required
                />
              </div>

              {/* Duration (Days/Nights) & Pricing & Max Group */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Days *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={packageForm.durationDays}
                    onChange={(e) => {
                      const d = Number(e.target.value);
                      setPackageForm({ ...packageForm, durationDays: d, durationNights: Math.max(0, d - 1) });
                    }}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#dc3545]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Nights *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={packageForm.durationNights}
                    onChange={(e) => setPackageForm({ ...packageForm, durationNights: Number(e.target.value) })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#dc3545]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={packageForm.basePrice}
                    onChange={(e) => setPackageForm({ ...packageForm, basePrice: Number(e.target.value) })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#dc3545]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Max Group
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={packageForm.maxGroupSize}
                    onChange={(e) => setPackageForm({ ...packageForm, maxGroupSize: Number(e.target.value) })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#dc3545]"
                  />
                </div>
              </div>

              {/* Short & Long Description */}
              <div>
                <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  Short Highlight Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. 7-day high altitude bike expedition across Khardung La and Pangong Tso."
                  value={packageForm.shortDescription}
                  onChange={(e) => setPackageForm({ ...packageForm, shortDescription: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs focus:outline-hidden focus:border-[#dc3545]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  Long Detailed Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the overall journey, terrain, accommodations, and unique highlights..."
                  value={packageForm.longDescription}
                  onChange={(e) => setPackageForm({ ...packageForm, longDescription: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs focus:outline-hidden focus:border-[#dc3545]"
                />
              </div>

              {/* Day-by-Day Itinerary Builder */}
              <div className="space-y-3 pt-3 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-bold text-zinc-800 uppercase tracking-wider text-[11px]">
                      Day-by-Day Itinerary ({packageForm.itinerary?.length || 0} Days)
                    </label>
                    <p className="text-[11px] text-zinc-500">
                      Define daily schedule, locations, and planned activities.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItineraryDay}
                    className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold py-1.5 px-3 rounded-full transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Day</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {(packageForm.itinerary || []).map((day, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2.5 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="bg-zinc-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">
                          Day {day.dayNumber || idx + 1}
                        </span>

                        {(packageForm.itinerary || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItineraryDay(idx)}
                            className="text-zinc-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                            title="Remove this day"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        <input
                          type="text"
                          placeholder="Day Title (e.g. Arrival in Leh & Acclimatization)"
                          value={day.title}
                          onChange={(e) => handleUpdateItineraryDay(idx, 'title', e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-hidden focus:border-[#dc3545]"
                          required
                        />

                        <textarea
                          rows={2}
                          placeholder="Day Description (Summary of route, terrain, and overnight stops...)"
                          value={day.description}
                          onChange={(e) => handleUpdateItineraryDay(idx, 'description', e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs focus:outline-hidden focus:border-[#dc3545]"
                        />

                        <input
                          type="text"
                          placeholder="Activities (comma-separated or one per line, e.g. Shanti Stupa, Local Market)"
                          value={day.activities}
                          onChange={(e) => handleUpdateItineraryDay(idx, 'activities', e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-[11px] text-zinc-600 focus:outline-hidden focus:border-[#dc3545]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Inclusions (one item per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Royal Enfield 500cc&#10;Mechanic Support&#10;Meals & Stay"
                    value={packageForm.inclusions}
                    onChange={(e) => setPackageForm({ ...packageForm, inclusions: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-hidden focus:border-[#dc3545]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Exclusions (one item per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Airfare to Leh&#10;Personal Riding Gear&#10;Tips"
                    value={packageForm.exclusions}
                    onChange={(e) => setPackageForm({ ...packageForm, exclusions: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-hidden focus:border-[#dc3545]"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="packageIsActive"
                  checked={packageForm.isActive}
                  onChange={(e) => setPackageForm({ ...packageForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#dc3545] rounded border-zinc-300 focus:ring-[#dc3545] cursor-pointer"
                />
                <label htmlFor="packageIsActive" className="text-xs font-bold text-zinc-700 cursor-pointer">
                  Publish package immediately (Active on public portal)
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setPackageModal(null)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#dc3545] hover:bg-[#b02a37] text-white transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : packageModal.mode === 'create' ? 'Create Package' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Experience Create / Edit Modal (Phase 3) */}
      {experienceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-zinc-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-zinc-900">
                    {experienceModal.mode === 'create' ? 'Create Experience' : 'Edit Experience'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {experienceModal.mode === 'create' ? 'Publish a new host-led immersive activity' : 'Update experience details, category, or pricing'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExperienceModal(null)}
                className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExperience} className="space-y-4 text-xs">
              
              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunrise Yoga & Himalayan Tea"
                    value={experienceForm.title}
                    onChange={(e) => {
                      const titleVal = e.target.value;
                      setExperienceForm((prev) => ({
                        ...prev,
                        title: titleVal,
                        slug: experienceModal.mode === 'create' ? titleVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : prev.slug,
                      }));
                    }}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#dc3545]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. sunrise-yoga-himalayan-tea"
                    value={experienceForm.slug}
                    onChange={(e) => setExperienceForm({ ...experienceForm, slug: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-hidden focus:border-[#dc3545]"
                  />
                </div>
              </div>

              {/* Destination & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">Destination *</label>
                  <select
                    required
                    value={experienceForm.destination}
                    onChange={(e) => setExperienceForm({ ...experienceForm, destination: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#dc3545] cursor-pointer"
                  >
                    <option value="" disabled>Select a Destination</option>
                    {destinationsList.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.state || d.country})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">Category *</label>
                  <select
                    value={experienceForm.category}
                    onChange={(e) => setExperienceForm({ ...experienceForm, category: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#dc3545] cursor-pointer"
                  >
                    {["Adventure", "Cultural", "Food & Drink", "Nature", "Wellness", "Photography", "Workshop"].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration, Price, Group Size, Difficulty */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">Duration (Hours) *</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    required
                    value={experienceForm.durationHours}
                    onChange={(e) => setExperienceForm({ ...experienceForm, durationHours: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#dc3545]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={experienceForm.basePrice}
                    onChange={(e) => setExperienceForm({ ...experienceForm, basePrice: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#dc3545]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">Max Group</label>
                  <input
                    type="number"
                    min="1"
                    value={experienceForm.maxGroupSize}
                    onChange={(e) => setExperienceForm({ ...experienceForm, maxGroupSize: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#dc3545]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">Difficulty</label>
                  <select
                    value={experienceForm.difficultyLevel}
                    onChange={(e) => setExperienceForm({ ...experienceForm, difficultyLevel: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#dc3545] cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Challenging">Challenging</option>
                  </select>
                </div>
              </div>

              {/* Cover Image URL & Meeting Point */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">Cover Image URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    value={experienceForm.coverImageUrl}
                    onChange={(e) => setExperienceForm({ ...experienceForm, coverImageUrl: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#dc3545]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">Meeting Point Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g. Heritage Estate Main Gate, Kalimpong"
                    value={experienceForm.meetingPoint}
                    onChange={(e) => setExperienceForm({ ...experienceForm, meetingPoint: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#dc3545]"
                  />
                </div>
              </div>

              {/* What's Included */}
              <div>
                <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">What's Included (1 per line)</label>
                <textarea
                  rows={3}
                  placeholder="Certified local guide&#10;Artisanal tea tasting&#10;Bakery pairing"
                  value={experienceForm.whatsIncluded}
                  onChange={(e) => setExperienceForm({ ...experienceForm, whatsIncluded: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#dc3545]"
                />
              </div>

              {/* Short & Long Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">Short Tagline</label>
                  <textarea
                    rows={3}
                    placeholder="Quick 1-2 sentence preview"
                    value={experienceForm.shortDescription}
                    onChange={(e) => setExperienceForm({ ...experienceForm, shortDescription: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#dc3545]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider mb-1">Full Long Description</label>
                  <textarea
                    rows={3}
                    placeholder="Detailed activity highlights and itinerary overview"
                    value={experienceForm.longDescription}
                    onChange={(e) => setExperienceForm({ ...experienceForm, longDescription: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#dc3545]"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="experienceIsActive"
                  checked={experienceForm.isActive}
                  onChange={(e) => setExperienceForm({ ...experienceForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#dc3545] rounded-sm border-zinc-300 focus:ring-[#dc3545] cursor-pointer"
                />
                <label htmlFor="experienceIsActive" className="text-xs font-bold text-zinc-700 cursor-pointer">
                  Publish experience immediately (Active on public portal)
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setExperienceModal(null)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : experienceModal.mode === 'create' ? 'Publish Experience' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-zinc-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#dc3545] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-lg text-zinc-900">
                Confirm Admin Deletion
              </h3>
              <p className="text-xs text-zinc-600">
                Are you sure you want to permanently delete <b>{deleteModal.name}</b>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                disabled={actionLoading}
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold py-3 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="flex-1 bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs font-bold py-3 rounded-full transition-colors shadow-sm disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
