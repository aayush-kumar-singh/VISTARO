import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { adminApi } from '../api/adminApi.js';
import { destinationsApi } from '../api/destinationsApi.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
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
  AlertTriangle,
  X,
  Sparkles,
  Shield,
  Compass,
  Car,
  Navigation,
  ToggleLeft,
  ToggleRight,
  Star,
  Flame,
  MapPin,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'listings' | 'packages' | 'experiences' | 'transfers' | 'users' | 'bookings'
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [tourPackagesList, setTourPackagesList] = useState([]);
  const [experiencesList, setExperiencesList] = useState([]);
  const [transfersList, setTransfersList] = useState([]);
  const [destinationsList, setDestinationsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Search/Filter states for tables
  const [listingSearch, setListingSearch] = useState('');
  const [packageSearch, setPackageSearch] = useState('');
  const [experienceSearch, setExperienceSearch] = useState('');
  const [transferSearch, setTransferSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [error, setError] = useState(null);

  // Destination Modal State
  const [destinationModal, setDestinationModal] = useState(null);
  const [destinationForm, setDestinationForm] = useState({
    name: '',
    slug: '',
    state: '',
    country: 'India',
    shortTagline: '',
    longDescription: '',
    heroImageUrl: '',
    bestFor: '',
    identityTags: '',
    isFeatured: false,
    isTrending: false,
    isActive: true,
  });

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
    isFeatured: false,
    isTrending: false,
    isActive: true,
  });

  // Transfer Modal State (Phase 6 / Part 6.4)
  const [transferModal, setTransferModal] = useState(null);
  const [transferForm, setTransferForm] = useState({
    title: '',
    slug: '',
    destination: '',
    transferType: 'airport-pickup',
    vehicleType: 'SUV',
    capacity: 4,
    basePrice: 1200,
    priceUnit: 'per-trip',
    description: '',
    pickupLocation: '',
    dropLocation: '',
    estimatedDuration: '30 mins',
    includedFeatures: 'Professional Chauffeur\nAir Conditioning\nToll & Parking Included\nLuggage Carrier',
    coverImageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80',
    cancellationPolicy: 'flexible',
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
    isFeatured: false,
    isTrending: false,
    isActive: true,
  });

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(null); // { type: 'listing'|'user', id: string, name: string }

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, usersData, packagesData, destinationsData, experiencesData, transfersData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getTourPackages().catch(() => ({ success: false, tourPackages: [] })),
        destinationsApi.getDestinations().catch(() => ({ success: false, destinations: [] })),
        adminApi.getExperiences().catch(() => ({ success: false, experiences: [] })),
        adminApi.getTransfers().catch(() => ({ success: false, transfers: [] })),
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

      if (transfersData.success) {
        setTransfersList(transfersData.transfers || []);
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
      isFeatured: false,
      isTrending: false,
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
      isFeatured: exp.isFeatured ?? false,
      isTrending: exp.isTrending ?? false,
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
        isFeatured: Boolean(experienceForm.isFeatured),
        isTrending: Boolean(experienceForm.isTrending),
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
          prev.map((e) => (e._id === experienceModal.id ? res.experience : e))
        );
      }

      setExperienceModal(null);
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to save experience.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Destination Modal Open (Create / Edit)
  const openCreateDestinationModal = () => {
    setDestinationForm({
      name: '',
      slug: '',
      state: '',
      country: 'India',
      shortTagline: '',
      longDescription: '',
      heroImageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
      bestFor: 'Beaches, Nightlife, Heritage Stays, Water Sports',
      identityTags: 'Coastal, Tropical, Verified Hosts, Scenic Views',
      isFeatured: false,
      isTrending: false,
      isActive: true,
    });
    setDestinationModal({ mode: 'create' });
  };

  const openEditDestinationModal = (dest) => {
    setDestinationForm({
      name: dest.name || '',
      slug: dest.slug || '',
      state: dest.state || '',
      country: dest.country || 'India',
      shortTagline: dest.shortTagline || dest.tagline || '',
      longDescription: dest.longDescription || dest.description || '',
      heroImageUrl: dest.heroImage?.url || dest.image?.url || '',
      bestFor: Array.isArray(dest.bestFor) ? dest.bestFor.join(', ') : dest.bestFor || '',
      identityTags: Array.isArray(dest.identityTags) ? dest.identityTags.join(', ') : dest.identityTags || '',
      isFeatured: dest.isFeatured ?? false,
      isTrending: dest.isTrending ?? false,
      isActive: dest.isActive !== false,
    });
    setDestinationModal({ mode: 'edit', id: dest._id });
  };

  const handleSaveDestination = async (e) => {
    e.preventDefault();
    if (!destinationForm.name.trim() || !destinationForm.shortTagline.trim() || !destinationForm.heroImageUrl.trim()) {
      showError('Please provide a name, short tagline, and hero image URL.');
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        name: destinationForm.name.trim(),
        slug: destinationForm.slug.trim() || destinationForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        state: destinationForm.state.trim(),
        country: destinationForm.country.trim() || 'India',
        shortTagline: destinationForm.shortTagline.trim(),
        longDescription: destinationForm.longDescription.trim(),
        heroImage: { url: destinationForm.heroImageUrl.trim(), filename: '' },
        bestFor: destinationForm.bestFor.split(',').map(s => s.trim()).filter(Boolean),
        identityTags: destinationForm.identityTags.split(',').map(s => s.trim()).filter(Boolean),
        isFeatured: Boolean(destinationForm.isFeatured),
        isTrending: Boolean(destinationForm.isTrending),
        isActive: Boolean(destinationForm.isActive),
      };

      if (destinationModal.mode === 'create') {
        const res = await adminApi.createDestination(payload);
        showSuccess(res.message || 'Destination created successfully!');
        setDestinationsList((prev) => [res.destination, ...prev]);
      } else {
        const res = await adminApi.updateDestination(destinationModal.id, payload);
        showSuccess(res.message || 'Destination updated successfully!');
        setDestinationsList((prev) =>
          prev.map((d) => (d._id === destinationModal.id ? res.destination : d))
        );
      }
      setDestinationModal(null);
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to save destination.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleDestinationActive = async (dest) => {
    const action = dest.isActive !== false ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} "${dest.name}"?`)) return;

    try {
      setActionLoading(true);
      const nextActive = dest.isActive === false;
      const res = await adminApi.updateDestination(dest._id, { isActive: nextActive });
      showSuccess(res.message || `Destination ${nextActive ? 'activated' : 'deactivated'}.`);
      setDestinationsList((prev) =>
        prev.map((d) => (d._id === dest._id ? { ...d, isActive: nextActive } : d))
      );
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to update destination status.');
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

  // Handle Transfer Modal Open (Create / Edit — Phase 6 / Part 6.4)
  const openCreateTransferModal = () => {
    setTransferForm({
      title: '',
      slug: '',
      destination: destinationsList[0]?._id || '',
      transferType: 'airport-pickup',
      vehicleType: 'SUV',
      capacity: 4,
      basePrice: 1200,
      priceUnit: 'per-trip',
      description: '',
      pickupLocation: '',
      dropLocation: '',
      estimatedDuration: '30 mins',
      includedFeatures: 'Professional Chauffeur\nAir Conditioning\nToll & Parking Included\nLuggage Carrier',
      coverImageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80',
      cancellationPolicy: 'flexible',
      isActive: true,
    });
    setTransferModal({ mode: 'create' });
  };

  const openEditTransferModal = (transfer) => {
    const includedStr = Array.isArray(transfer.includedFeatures)
      ? transfer.includedFeatures.join('\n')
      : transfer.includedFeatures || '';

    setTransferForm({
      title: transfer.title || '',
      slug: transfer.slug || '',
      destination: transfer.destination?._id || transfer.destination || '',
      transferType: transfer.transferType || 'airport-pickup',
      vehicleType: transfer.vehicleType || 'SUV',
      capacity: transfer.capacity || 4,
      basePrice: transfer.price?.basePrice ?? transfer.basePrice ?? 1200,
      priceUnit: transfer.priceUnit || 'per-trip',
      description: transfer.description || '',
      pickupLocation: transfer.pickupLocation || '',
      dropLocation: transfer.dropLocation || '',
      estimatedDuration: transfer.estimatedDuration || '',
      includedFeatures: includedStr,
      coverImageUrl: transfer.coverImage?.url || transfer.image?.url || '',
      cancellationPolicy: transfer.cancellationPolicy || 'flexible',
      isActive: transfer.isActive !== false,
    });
    setTransferModal({ mode: 'edit', id: transfer._id });
  };

  const handleSaveTransfer = async (e) => {
    e.preventDefault();

    if (!transferForm.title.trim() || !transferForm.destination) {
      showError('Please fill in title and destination.');
      return;
    }

    try {
      setActionLoading(true);

      const payload = {
        title: transferForm.title.trim(),
        slug: transferForm.slug.trim().toLowerCase() || transferForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        destination: transferForm.destination,
        transferType: transferForm.transferType,
        vehicleType: transferForm.vehicleType,
        capacity: Number(transferForm.capacity),
        price: {
          basePrice: Number(transferForm.basePrice),
          currency: 'INR',
        },
        priceUnit: transferForm.priceUnit,
        description: transferForm.description.trim(),
        pickupLocation: transferForm.pickupLocation.trim(),
        dropLocation: transferForm.dropLocation.trim(),
        estimatedDuration: transferForm.estimatedDuration.trim(),
        includedFeatures: transferForm.includedFeatures.split('\n').map(s => s.trim()).filter(Boolean),
        coverImage: { url: transferForm.coverImageUrl.trim() || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80', filename: '' },
        cancellationPolicy: transferForm.cancellationPolicy,
        isActive: Boolean(transferForm.isActive),
      };

      if (transferModal.mode === 'create') {
        const res = await adminApi.createTransfer(payload);
        showSuccess(res.message || 'Transfer service created successfully!');
        setTransfersList((prev) => [res.transfer, ...prev]);
      } else {
        const res = await adminApi.updateTransfer(transferModal.id, payload);
        showSuccess(res.message || 'Transfer service updated successfully!');
        setTransfersList((prev) =>
          prev.map((item) => (item._id === transferModal.id ? res.transfer : item))
        );
      }

      setTransferModal(null);
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to save transfer service.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleTransferActive = async (transfer) => {
    const action = transfer.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} "${transfer.title}"?`)) return;

    try {
      setActionLoading(true);
      if (transfer.isActive) {
        const res = await adminApi.deactivateTransfer(transfer._id);
        showSuccess(res.message || 'Transfer service deactivated.');
        setTransfersList((prev) =>
          prev.map((t) => (t._id === transfer._id ? { ...t, isActive: false } : t))
        );
      } else {
        const res = await adminApi.updateTransfer(transfer._id, { isActive: true });
        showSuccess(res.message || 'Transfer service activated.');
        setTransfersList((prev) =>
          prev.map((t) => (t._id === transfer._id ? { ...t, isActive: true } : t))
        );
      }
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to update transfer status.');
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
      isFeatured: false,
      isTrending: false,
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
      isFeatured: pkg.isFeatured ?? false,
      isTrending: pkg.isTrending ?? false,
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
        isFeatured: Boolean(packageForm.isFeatured),
        isTrending: Boolean(packageForm.isTrending),
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
        const res = await adminApi.deactivateTourPackage(pkg._id);
        showSuccess(res.message || 'Tour package deactivated.');
        setTourPackagesList((prev) =>
          prev.map((p) => (p._id === pkg._id ? { ...p, isActive: false } : p))
        );
      } else {
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

  // Toggle Listing Curation (Featured / Trending)
  const handleToggleListingFeatured = async (listing) => {
    const nextVal = !listing.isFeatured;
    try {
      setRecentListings((prev) =>
        prev.map((l) => (l._id === listing._id ? { ...l, isFeatured: nextVal } : l))
      );
      await adminApi.updateListing(listing._id, { isFeatured: nextVal });
      showSuccess(`"${listing.title}" ${nextVal ? 'marked as Featured ⭐' : 'removed from Featured'}`);
    } catch (err) {
      setRecentListings((prev) =>
        prev.map((l) => (l._id === listing._id ? { ...l, isFeatured: listing.isFeatured } : l))
      );
      showError(err.response?.data?.error || err.message || 'Failed to update curation.');
    }
  };

  const handleToggleListingTrending = async (listing) => {
    const nextVal = !listing.isTrending;
    try {
      setRecentListings((prev) =>
        prev.map((l) => (l._id === listing._id ? { ...l, isTrending: nextVal } : l))
      );
      await adminApi.updateListing(listing._id, { isTrending: nextVal });
      showSuccess(`"${listing.title}" ${nextVal ? 'marked as Trending 🔥' : 'removed from Trending'}`);
    } catch (err) {
      setRecentListings((prev) =>
        prev.map((l) => (l._id === listing._id ? { ...l, isTrending: listing.isTrending } : l))
      );
      showError(err.response?.data?.error || err.message || 'Failed to update curation.');
    }
  };

  // Toggle Tour Package Curation (Featured / Trending)
  const handleTogglePackageFeatured = async (pkg) => {
    const nextVal = !pkg.isFeatured;
    try {
      setTourPackagesList((prev) =>
        prev.map((p) => (p._id === pkg._id ? { ...p, isFeatured: nextVal } : p))
      );
      await adminApi.updateTourPackage(pkg._id, { isFeatured: nextVal });
      showSuccess(`"${pkg.title}" ${nextVal ? 'marked as Featured ⭐' : 'removed from Featured'}`);
    } catch (err) {
      setTourPackagesList((prev) =>
        prev.map((p) => (p._id === pkg._id ? { ...p, isFeatured: pkg.isFeatured } : p))
      );
      showError(err.response?.data?.error || err.message || 'Failed to update curation.');
    }
  };

  const handleTogglePackageTrending = async (pkg) => {
    const nextVal = !pkg.isTrending;
    try {
      setTourPackagesList((prev) =>
        prev.map((p) => (p._id === pkg._id ? { ...p, isTrending: nextVal } : p))
      );
      await adminApi.updateTourPackage(pkg._id, { isTrending: nextVal });
      showSuccess(`"${pkg.title}" ${nextVal ? 'marked as Trending 🔥' : 'removed from Trending'}`);
    } catch (err) {
      setTourPackagesList((prev) =>
        prev.map((p) => (p._id === pkg._id ? { ...p, isTrending: pkg.isTrending } : p))
      );
      showError(err.response?.data?.error || err.message || 'Failed to update curation.');
    }
  };

  // Toggle Experience Curation (Featured / Trending)
  const handleToggleExperienceFeatured = async (exp) => {
    const nextVal = !exp.isFeatured;
    try {
      setExperiencesList((prev) =>
        prev.map((e) => (e._id === exp._id ? { ...e, isFeatured: nextVal } : e))
      );
      await adminApi.updateExperience(exp._id, { isFeatured: nextVal });
      showSuccess(`"${exp.title}" ${nextVal ? 'marked as Featured ⭐' : 'removed from Featured'}`);
    } catch (err) {
      setExperiencesList((prev) =>
        prev.map((e) => (e._id === exp._id ? { ...e, isFeatured: exp.isFeatured } : e))
      );
      showError(err.response?.data?.error || err.message || 'Failed to update curation.');
    }
  };

  const handleToggleExperienceTrending = async (exp) => {
    const nextVal = !exp.isTrending;
    try {
      setExperiencesList((prev) =>
        prev.map((e) => (e._id === exp._id ? { ...e, isTrending: nextVal } : e))
      );
      await adminApi.updateExperience(exp._id, { isTrending: nextVal });
      showSuccess(`"${exp.title}" ${nextVal ? 'marked as Trending 🔥' : 'removed from Trending'}`);
    } catch (err) {
      setExperiencesList((prev) =>
        prev.map((e) => (e._id === exp._id ? { ...e, isTrending: exp.isTrending } : e))
      );
      showError(err.response?.data?.error || err.message || 'Failed to update curation.');
    }
  };

  // Toggle Destination Curation (Featured / Trending)
  const handleToggleDestinationFeatured = async (dest) => {
    const nextVal = !dest.isFeatured;
    try {
      setDestinationsList((prev) =>
        prev.map((d) => (d._id === dest._id ? { ...d, isFeatured: nextVal } : d))
      );
      await adminApi.updateDestination(dest._id, { isFeatured: nextVal });
      showSuccess(`"${dest.name}" ${nextVal ? 'marked as Featured ⭐' : 'removed from Featured'}`);
    } catch (err) {
      setDestinationsList((prev) =>
        prev.map((d) => (d._id === dest._id ? { ...d, isFeatured: dest.isFeatured } : d))
      );
      showError(err.response?.data?.error || err.message || 'Failed to update destination.');
    }
  };

  const handleToggleDestinationTrending = async (dest) => {
    const nextVal = !dest.isTrending;
    try {
      setDestinationsList((prev) =>
        prev.map((d) => (d._id === dest._id ? { ...d, isTrending: nextVal } : d))
      );
      await adminApi.updateDestination(dest._id, { isTrending: nextVal });
      showSuccess(`"${dest.name}" ${nextVal ? 'marked as Trending 🔥' : 'removed from Trending'}`);
    } catch (err) {
      setDestinationsList((prev) =>
        prev.map((d) => (d._id === dest._id ? { ...d, isTrending: dest.isTrending } : d))
      );
      showError(err.response?.data?.error || err.message || 'Failed to update destination.');
    }
  };

  // Handle Role Selection (User / Host / Admin)
  const handleSelectRole = async (targetUser, newRole) => {
    if (targetUser.role === newRole) return;
    const confirmMsg = `Are you sure you want to change @${targetUser.username}'s role to ${newRole.toUpperCase()}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(true);
      const res = await adminApi.updateUserRole(targetUser._id, newRole);
      showSuccess(res.message || `User role updated to ${newRole}`);
      setUsersList((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, role: newRole, hostRequestStatus: (newRole === 'host' || newRole === 'admin') ? 'approved' : u.hostRequestStatus } : u))
      );
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to update user role.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Host Request Approval / Rejection
  const handleHostApproval = async (targetUser, action) => {
    try {
      setActionLoading(true);
      const res = await adminApi.handleHostRequest(targetUser._id, action);
      showSuccess(res.message || `Host request ${action}ed.`);
      setUsersList((prev) =>
        prev.map((u) => {
          if (u._id === targetUser._id) {
            return {
              ...u,
              role: action === 'approve' ? 'host' : action === 'revoke' ? 'user' : u.role,
              hostRequestStatus: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'none',
            };
          }
          return u;
        })
      );
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to update host request.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Role Toggle (Promote/Demote)
  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    await handleSelectRole(targetUser, newRole);
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
      <div className="max-w-md mx-auto my-16 p-8 bg-vistaro-surface border border-vistaro-error/30 rounded-3xl text-center space-y-4 shadow-sm text-vistaro-primary">
        <div className="w-12 h-12 rounded-full bg-vistaro-secondary text-vistaro-error flex items-center justify-center mx-auto border border-vistaro-border">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-vistaro-primary">Admin Console Error</h2>
        <p className="text-sm text-vistaro-secondary">{error}</p>
        <div className="pt-2">
          <button
            type="button"
            onClick={fetchAdminData}
            className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-xs font-bold py-3 px-6 rounded-full transition-colors cursor-pointer"
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

  // Filter transfers (Phase 6 / Part 6.4)
  const filteredTransfers = transfersList.filter((t) => {
    const q = transferSearch.toLowerCase();
    const title = (t.title || '').toLowerCase();
    const destName = (t.destination?.name || '').toLowerCase();
    const slug = (t.slug || '').toLowerCase();
    const type = (t.transferType || '').toLowerCase();
    const vehicle = (t.vehicleType || '').toLowerCase();
    return title.includes(q) || destName.includes(q) || slug.includes(q) || type.includes(q) || vehicle.includes(q);
  });

  return (
    <div className="w-full space-y-8 animate-fade-in text-vistaro-primary transition-colors duration-200">
      
      {/* 1. Header Banner & New Listing CTA */}
      <div className="bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 bg-vistaro-surface text-vistaro-accent border border-vistaro-accent/30 px-3 py-1 rounded-full text-caption">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-display-hero text-2xl sm:text-3xl text-vistaro-primary">
            Vistaro Global Admin Console
          </h1>
          <p className="text-body-sm text-vistaro-secondary max-w-xl">
            Manage properties, publish verified tour packages, host experiences & private transfers, review revenue, and oversee platform users.
          </p>
        </div>

        {/* Action Button: Quick CTAs */}
        <div className="relative z-10 shrink-0 flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={openCreateDestinationModal}
            className="bg-vistaro-surface hover:bg-vistaro-main text-vistaro-primary text-cta py-3 px-5 rounded-full transition-all border border-vistaro-border flex items-center justify-center gap-2 cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-sky-500" />
            <span>New Destination</span>
          </button>
          <button
            type="button"
            onClick={openCreateTransferModal}
            className="bg-vistaro-surface hover:bg-vistaro-main text-vistaro-primary text-cta py-3 px-5 rounded-full transition-all border border-vistaro-border flex items-center justify-center gap-2 cursor-pointer"
          >
            <Car className="w-4 h-4 text-emerald-500" />
            <span>New Transfer</span>
          </button>
          <button
            type="button"
            onClick={openCreateExperienceModal}
            className="bg-vistaro-surface hover:bg-vistaro-main text-vistaro-accent text-cta py-3 px-5 rounded-full transition-all border border-vistaro-border flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-vistaro-accent" />
            <span>New Experience</span>
          </button>
          <button
            type="button"
            onClick={openCreatePackageModal}
            className="bg-vistaro-surface hover:bg-vistaro-main text-vistaro-primary text-cta py-3 px-5 rounded-full transition-all border border-vistaro-border flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-vistaro-rating" />
            <span>New Package</span>
          </button>
          <Link
            to="/listings/new"
            className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-5 rounded-full transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>New Listing</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Metric 1: Total Revenue */}
        <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-vistaro-secondary text-vistaro-success flex items-center justify-center shrink-0 border border-vistaro-border">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-label text-vistaro-muted">Total Volume</div>
            <div className="text-price text-2xl text-vistaro-primary mt-0.5">
              {formatPrice(stats?.totalRevenue || 0)}
            </div>
            <div className="text-caption text-vistaro-success font-semibold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Gross
            </div>
          </div>
        </div>

        {/* Metric 2: Active Listings */}
        <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-vistaro-secondary text-vistaro-accent flex items-center justify-center shrink-0 border border-vistaro-border">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <div className="text-label text-vistaro-muted">Stays</div>
            <div className="text-price text-2xl text-vistaro-primary mt-0.5">
              {stats?.totalListings || 0}
            </div>
            <div className="text-caption text-vistaro-muted font-medium mt-0.5">
              Villas & stays
            </div>
          </div>
        </div>

        {/* Metric 3: Tour Packages */}
        <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-vistaro-secondary text-vistaro-rating flex items-center justify-center shrink-0 border border-vistaro-border">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="text-label text-vistaro-muted">Tours</div>
            <div className="text-price text-2xl text-vistaro-primary mt-0.5">
              {tourPackagesList.length}
            </div>
            <div className="text-caption text-vistaro-muted font-medium mt-0.5">
              Expeditions
            </div>
          </div>
        </div>

        {/* Metric 4: Experiences */}
        <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-vistaro-secondary text-vistaro-accent flex items-center justify-center shrink-0 border border-vistaro-border">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-label text-vistaro-muted">Experiences</div>
            <div className="text-price text-2xl text-vistaro-primary mt-0.5">
              {experiencesList.length}
            </div>
            <div className="text-caption text-vistaro-muted font-medium mt-0.5">
              Host immersions
            </div>
          </div>
        </div>

        {/* Metric 5: Transfers */}
        <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-vistaro-secondary text-emerald-500 flex items-center justify-center shrink-0 border border-vistaro-border">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="text-label text-vistaro-muted">Transfers</div>
            <div className="text-price text-2xl text-vistaro-primary mt-0.5">
              {transfersList.length}
            </div>
            <div className="text-caption text-vistaro-muted font-medium mt-0.5">
              Transit routes
            </div>
          </div>
        </div>

        {/* Metric 6: Registered Users */}
        <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-vistaro-secondary text-vistaro-accent flex items-center justify-center shrink-0 border border-vistaro-border">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-label text-vistaro-muted">Users</div>
            <div className="text-price text-2xl text-vistaro-primary mt-0.5">
              {stats?.totalUsers || 0}
            </div>
            <div className="text-caption text-vistaro-muted font-medium mt-0.5">
              Members
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-1.5 bg-vistaro-secondary border border-vistaro-border rounded-full max-w-full">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-full text-nav-link transition-all shrink-0 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-vistaro-accent text-white shadow-xs'
              : 'text-vistaro-secondary hover:bg-vistaro-surface hover:text-vistaro-primary'
          }`}
        >
          Console Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2.5 rounded-full text-nav-link transition-all shrink-0 cursor-pointer ${
            activeTab === 'listings'
              ? 'bg-vistaro-accent text-white shadow-xs'
              : 'text-vistaro-secondary hover:bg-vistaro-surface hover:text-vistaro-primary'
          }`}
        >
          All Listings ({recentListings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('destinations')}
          className={`px-4 py-2.5 rounded-full text-nav-link transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'destinations'
              ? 'bg-vistaro-accent text-white shadow-xs'
              : 'text-vistaro-secondary hover:bg-vistaro-surface hover:text-vistaro-primary'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-sky-500" />
          <span>Destinations ({destinationsList.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('packages')}
          className={`px-4 py-2.5 rounded-full text-nav-link transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'packages'
              ? 'bg-vistaro-accent text-white shadow-xs'
              : 'text-vistaro-secondary hover:bg-vistaro-surface hover:text-vistaro-primary'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-vistaro-rating" />
          <span>Tour Packages ({tourPackagesList.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('experiences')}
          className={`px-4 py-2.5 rounded-full text-nav-link transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'experiences'
              ? 'bg-vistaro-accent text-white shadow-xs'
              : 'text-vistaro-secondary hover:bg-vistaro-surface hover:text-vistaro-primary'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-vistaro-accent" />
          <span>Experiences ({experiencesList.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2.5 rounded-full text-nav-link transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'transfers'
              ? 'bg-vistaro-accent text-white shadow-xs'
              : 'text-vistaro-secondary hover:bg-vistaro-surface hover:text-vistaro-primary'
          }`}
        >
          <Car className="w-3.5 h-3.5 text-emerald-500" />
          <span>Transfers & Cabs ({transfersList.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-full text-nav-link transition-all shrink-0 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-vistaro-accent text-white shadow-xs'
              : 'text-vistaro-secondary hover:bg-vistaro-surface hover:text-vistaro-primary'
          }`}
        >
          User Management ({usersList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2.5 rounded-full text-nav-link transition-all shrink-0 cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-vistaro-accent text-white shadow-xs'
              : 'text-vistaro-secondary hover:bg-vistaro-surface hover:text-vistaro-primary'
          }`}
        >
          Bookings Log ({recentBookings.length})
        </button>
      </div>

      {/* 4. Tab Content */}
      
      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Quick Listings Preview */}
          <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-vistaro-border">
              <h3 className="font-bold text-base text-vistaro-primary flex items-center gap-2">
                <Home className="w-4 h-4 text-vistaro-accent" /> Recent Properties
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('listings')}
                className="text-xs font-bold text-vistaro-accent hover:underline cursor-pointer"
              >
                View all &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {recentListings.slice(0, 5).map((listing) => (
                <div
                  key={listing._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-vistaro-secondary border border-vistaro-border hover:border-vistaro-muted transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={listing.images?.[0]?.url || listing.image?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=60'}
                      alt={listing.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 bg-vistaro-surface"
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-body-sm text-vistaro-primary truncate">{listing.title}</h4>
                      <p className="text-muted truncate">{listing.location}, {listing.country}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-price text-sm text-vistaro-primary">{formatPrice(listing.price)}</div>
                    <span className="text-caption text-vistaro-muted capitalize">{listing.category || 'Stay'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Bookings Preview */}
          <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-vistaro-border">
              <h3 className="font-bold text-base text-vistaro-primary flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-vistaro-success" /> Recent Bookings
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('bookings')}
                className="text-xs font-bold text-vistaro-accent hover:underline cursor-pointer"
              >
                View all &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {recentBookings.length === 0 ? (
                <div className="text-center py-8 text-xs text-vistaro-muted">No reservations placed yet.</div>
              ) : (
                recentBookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-vistaro-secondary border border-vistaro-border hover:border-vistaro-muted transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-body-sm text-vistaro-primary truncate">
                        {booking.listing?.title || 'Stay Reservation'}
                      </div>
                      <div className="text-muted">
                        Guest: @{booking.user?.username || 'Guest'} &middot; {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-price text-sm text-vistaro-accent">
                        {formatPrice(booking.totalPrice || 0)}
                      </div>
                      <span className={`text-caption px-2 py-0.5 rounded-full border border-vistaro-border ${
                        booking.status === 'confirmed' ? 'bg-vistaro-surface text-vistaro-success' : 'bg-vistaro-surface text-vistaro-secondary'
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
        <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-vistaro-border">
            <div>
              <h3 className="font-bold text-base text-vistaro-primary">Platform Property Listings</h3>
              <p className="text-xs text-vistaro-muted">Review, inspect, edit, or delete any listing across Vistaro.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-vistaro-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter listings..."
                  value={listingSearch}
                  onChange={(e) => setListingSearch(e.target.value)}
                  className="bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-full pl-8 pr-4 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent w-48 sm:w-64"
                />
              </div>

              <Link
                to="/listings/new"
                className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-xs font-bold py-2 px-4 rounded-full transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Stay</span>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-vistaro-border text-vistaro-muted uppercase text-label">
                  <th className="pb-3 font-semibold">Stay</th>
                  <th className="pb-3 font-semibold">Location</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Price / Night</th>
                  <th className="pb-3 font-semibold">Host</th>
                  <th className="pb-3 font-semibold text-center">Curation</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vistaro-border">
                {filteredListings.map((listing) => (
                  <tr key={listing._id} className="hover:bg-vistaro-secondary/50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={listing.images?.[0]?.url || listing.image?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=60'}
                          alt={listing.title}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 bg-vistaro-surface"
                        />
                        <div className="font-semibold text-body-sm text-vistaro-primary truncate max-w-xs">{listing.title}</div>
                      </div>
                    </td>
                    <td className="py-3 text-vistaro-secondary">{listing.location}, {listing.country}</td>
                    <td className="py-3">
                      <span className="bg-vistaro-secondary text-vistaro-secondary border border-vistaro-border font-semibold px-2 py-0.5 rounded-full text-caption">
                        {listing.category || 'Stay'}
                      </span>
                    </td>
                    <td className="py-3 text-price text-sm text-vistaro-primary">{formatPrice(listing.price)}</td>
                    <td className="py-3 text-vistaro-secondary">@{listing.owner?.username || 'Host'}</td>
                    <td className="py-3 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-vistaro-secondary px-2 py-1 rounded-full border border-vistaro-border">
                        <button
                          type="button"
                          onClick={() => handleToggleListingFeatured(listing)}
                          className={`p-1 rounded-full transition-all cursor-pointer ${
                            listing.isFeatured
                              ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
                              : 'text-vistaro-muted hover:text-amber-500'
                          }`}
                          title={listing.isFeatured ? 'Featured (Click to remove)' : 'Mark as Featured ⭐'}
                        >
                          <Star className={`w-3.5 h-3.5 ${listing.isFeatured ? 'fill-amber-500' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleListingTrending(listing)}
                          className={`p-1 rounded-full transition-all cursor-pointer ${
                            listing.isTrending
                              ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30'
                              : 'text-vistaro-muted hover:text-rose-500'
                          }`}
                          title={listing.isTrending ? 'Trending (Click to remove)' : 'Mark as Trending 🔥'}
                        >
                          <Flame className={`w-3.5 h-3.5 ${listing.isTrending ? 'fill-rose-500' : ''}`} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/listings/${listing._id}`}
                          className="p-1.5 text-vistaro-muted hover:text-vistaro-primary hover:bg-vistaro-secondary rounded-lg transition-colors"
                          title="View on site"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/listings/${listing._id}/edit`}
                          className="p-1.5 text-vistaro-muted hover:text-vistaro-accent hover:bg-vistaro-secondary rounded-lg transition-colors"
                          title="Edit listing"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteModal({ type: 'listing', id: listing._id, name: listing.title })}
                          className="p-1.5 text-vistaro-muted hover:text-vistaro-error hover:bg-vistaro-secondary rounded-lg transition-colors cursor-pointer"
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

      {/* TAB: DESTINATIONS MANAGEMENT */}
      {activeTab === 'destinations' && (
        <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-vistaro-border">
            <div>
              <h3 className="font-bold text-base text-vistaro-primary">Curated Travel Destinations</h3>
              <p className="text-xs text-vistaro-muted">Manage regional travel hubs, configure curation tags (Featured / Trending), and publish destination guides.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-vistaro-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter destinations..."
                  value={destinationSearch}
                  onChange={(e) => setDestinationSearch(e.target.value)}
                  className="bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-full pl-8 pr-4 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent w-full sm:w-48 md:w-64"
                />
              </div>

              <button
                type="button"
                onClick={openCreateDestinationModal}
                className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-xs font-bold py-2 px-4 rounded-full transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Destination</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-vistaro-border text-vistaro-muted uppercase text-label">
                  <th className="pb-3 font-semibold">Destination Hub</th>
                  <th className="pb-3 font-semibold">Region / State</th>
                  <th className="pb-3 font-semibold">Tagline</th>
                  <th className="pb-3 font-semibold text-center">Curation</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vistaro-border">
                {destinationsList.filter((d) => 
                  (d.name || '').toLowerCase().includes(destinationSearch.toLowerCase()) ||
                  (d.state || '').toLowerCase().includes(destinationSearch.toLowerCase()) ||
                  (d.shortTagline || '').toLowerCase().includes(destinationSearch.toLowerCase())
                ).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-vistaro-muted">
                      No destinations found matching your criteria. Click "New Destination" to create one.
                    </td>
                  </tr>
                ) : (
                  destinationsList
                    .filter((d) => 
                      (d.name || '').toLowerCase().includes(destinationSearch.toLowerCase()) ||
                      (d.state || '').toLowerCase().includes(destinationSearch.toLowerCase()) ||
                      (d.shortTagline || '').toLowerCase().includes(destinationSearch.toLowerCase())
                    )
                    .map((dest) => (
                      <tr key={dest._id} className="hover:bg-vistaro-secondary/50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={dest.heroImage?.url || dest.image?.url || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=200&q=60'}
                              alt={dest.name}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 bg-vistaro-surface"
                            />
                            <div className="min-w-0">
                              <div className="font-semibold text-body-sm text-vistaro-primary truncate max-w-xs">{dest.name}</div>
                              <div className="text-caption text-vistaro-muted font-mono">/{dest.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="bg-vistaro-secondary text-vistaro-secondary border border-vistaro-border font-semibold px-2 py-0.5 rounded-full text-caption">
                            {dest.state || 'Region'}, {dest.country || 'India'}
                          </span>
                        </td>
                        <td className="py-3 text-vistaro-secondary truncate max-w-xs">
                          {dest.shortTagline || dest.tagline || '—'}
                        </td>
                        <td className="py-3 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-vistaro-secondary px-2 py-1 rounded-full border border-vistaro-border">
                            <button
                              type="button"
                              onClick={() => handleToggleDestinationFeatured(dest)}
                              className={`p-1 rounded-full transition-all cursor-pointer ${
                                dest.isFeatured
                                  ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
                                  : 'text-vistaro-muted hover:text-amber-500'
                              }`}
                              title={dest.isFeatured ? 'Featured (Click to remove)' : 'Mark as Featured ⭐'}
                            >
                              <Star className={`w-3.5 h-3.5 ${dest.isFeatured ? 'fill-amber-500' : ''}`} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleDestinationTrending(dest)}
                              className={`p-1 rounded-full transition-all cursor-pointer ${
                                dest.isTrending
                                  ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30'
                                  : 'text-vistaro-muted hover:text-rose-500'
                              }`}
                              title={dest.isTrending ? 'Trending (Click to remove)' : 'Mark as Trending 🔥'}
                            >
                              <Flame className={`w-3.5 h-3.5 ${dest.isTrending ? 'fill-rose-500' : ''}`} />
                            </button>
                          </div>
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-caption font-bold capitalize border border-vistaro-border ${
                              dest.isActive !== false
                                ? 'bg-vistaro-surface text-vistaro-success'
                                : 'bg-vistaro-surface text-vistaro-muted'
                            }`}
                          >
                            {dest.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              to={`/destinations/${dest.slug || dest._id}`}
                              className="p-1.5 text-vistaro-muted hover:text-vistaro-primary hover:bg-vistaro-secondary rounded-lg transition-colors"
                              title="View destination portal"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => openEditDestinationModal(dest)}
                              className="p-1.5 text-vistaro-muted hover:text-vistaro-accent hover:bg-vistaro-secondary rounded-lg transition-colors cursor-pointer"
                              title="Edit destination"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleDestinationActive(dest)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-vistaro-secondary ${
                                dest.isActive !== false
                                  ? 'text-vistaro-success hover:text-vistaro-rating'
                                  : 'text-vistaro-muted hover:text-vistaro-success'
                              }`}
                              title={dest.isActive !== false ? 'Deactivate destination' : 'Activate destination'}
                            >
                              {dest.isActive !== false ? (
                                <ToggleRight className="w-4 h-4 text-vistaro-success" />
                              ) : (
                                <ToggleLeft className="w-4 h-4 text-vistaro-muted" />
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

      {/* TAB: TOUR PACKAGES MANAGEMENT */}
      {activeTab === 'packages' && (
        <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-vistaro-border">
            <div>
              <h3 className="font-bold text-base text-vistaro-primary flex items-center gap-2">
                <Compass className="w-5 h-5 text-vistaro-rating" />
                <span>Regional Tour Packages ({tourPackagesList.length})</span>
              </h3>
              <p className="text-xs text-vistaro-muted">Create, publish, edit, or deactivate curated multi-day tour experiences.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-vistaro-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter packages..."
                  value={packageSearch}
                  onChange={(e) => setPackageSearch(e.target.value)}
                  className="bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-full pl-8 pr-4 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent w-full sm:w-48 md:w-64"
                />
              </div>

              <button
                type="button"
                onClick={openCreatePackageModal}
                className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-xs font-bold py-2 px-4 rounded-full transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Package</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-vistaro-border text-vistaro-muted uppercase text-label">
                  <th className="pb-3 font-semibold">Package Experience</th>
                  <th className="pb-3 font-semibold">Destination</th>
                  <th className="pb-3 font-semibold">Duration</th>
                  <th className="pb-3 font-semibold">Base Price</th>
                  <th className="pb-3 font-semibold">Difficulty</th>
                  <th className="pb-3 font-semibold text-center">Curation</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vistaro-border">
                {filteredTourPackages.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-vistaro-muted">
                      No tour packages found. Click "Create Package" to publish your first regional itinerary.
                    </td>
                  </tr>
                ) : (
                  filteredTourPackages.map((pkg) => (
                    <tr key={pkg._id} className="hover:bg-vistaro-secondary/50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={pkg.coverImage?.url || pkg.image?.url || 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=200&q=60'}
                            alt={pkg.title}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 bg-vistaro-surface"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-body-sm text-vistaro-primary truncate max-w-xs">{pkg.title}</div>
                            <div className="text-caption text-vistaro-muted font-mono">/{pkg.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="bg-vistaro-secondary text-vistaro-accent border border-vistaro-border font-semibold px-2 py-0.5 rounded-full text-caption">
                          {pkg.destination?.name || 'Curated'}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-vistaro-secondary">
                        {pkg.duration?.days || 1}D / {pkg.duration?.nights || 0}N
                      </td>
                      <td className="py-3 text-price text-sm text-vistaro-primary">
                        {formatPrice(pkg.price?.basePrice ?? pkg.basePrice ?? 0)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-full text-caption border border-vistaro-border ${
                            pkg.difficultyLevel === 'Easy'
                              ? 'bg-vistaro-surface text-vistaro-success'
                              : pkg.difficultyLevel === 'Challenging'
                              ? 'bg-vistaro-surface text-vistaro-rating'
                              : 'bg-vistaro-surface text-vistaro-accent'
                          }`}
                        >
                          {pkg.difficultyLevel || 'Moderate'}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-vistaro-secondary px-2 py-1 rounded-full border border-vistaro-border">
                          <button
                            type="button"
                            onClick={() => handleTogglePackageFeatured(pkg)}
                            className={`p-1 rounded-full transition-all cursor-pointer ${
                              pkg.isFeatured
                                ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
                                : 'text-vistaro-muted hover:text-amber-500'
                            }`}
                            title={pkg.isFeatured ? 'Featured (Click to remove)' : 'Mark as Featured ⭐'}
                          >
                            <Star className={`w-3.5 h-3.5 ${pkg.isFeatured ? 'fill-amber-500' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTogglePackageTrending(pkg)}
                            className={`p-1 rounded-full transition-all cursor-pointer ${
                              pkg.isTrending
                                ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30'
                                : 'text-vistaro-muted hover:text-rose-500'
                            }`}
                            title={pkg.isTrending ? 'Trending (Click to remove)' : 'Mark as Trending 🔥'}
                          >
                            <Flame className={`w-3.5 h-3.5 ${pkg.isTrending ? 'fill-rose-500' : ''}`} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-caption font-bold capitalize border border-vistaro-border ${
                            pkg.isActive !== false
                              ? 'bg-vistaro-surface text-vistaro-success'
                              : 'bg-vistaro-surface text-vistaro-muted'
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
                            className="p-1.5 text-vistaro-muted hover:text-vistaro-accent hover:bg-vistaro-secondary rounded-lg transition-colors cursor-pointer"
                            title="Edit package"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTogglePackageActive(pkg)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-vistaro-secondary ${
                              pkg.isActive !== false
                                ? 'text-vistaro-success hover:text-vistaro-rating'
                                : 'text-vistaro-muted hover:text-vistaro-success'
                            }`}
                            title={pkg.isActive !== false ? 'Deactivate package' : 'Activate package'}
                          >
                            {pkg.isActive !== false ? (
                              <ToggleRight className="w-4 h-4 text-vistaro-success" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-vistaro-muted" />
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

      {/* TAB: EXPERIENCES MANAGEMENT */}
      {activeTab === 'experiences' && (
        <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-vistaro-border">
            <div>
              <h3 className="font-bold text-base text-vistaro-primary flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-vistaro-accent" />
                <span>Host-Led Experiences ({experiencesList.length})</span>
              </h3>
              <p className="text-xs text-vistaro-muted">Create, publish, edit, or deactivate curated local immersion activities.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-vistaro-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter experiences..."
                  value={experienceSearch}
                  onChange={(e) => setExperienceSearch(e.target.value)}
                  className="bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-full pl-8 pr-4 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent w-full sm:w-48 md:w-64"
                />
              </div>

              <button
                type="button"
                onClick={openCreateExperienceModal}
                className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-xs font-bold py-2 px-4 rounded-full transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Experience</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-vistaro-border text-vistaro-muted uppercase text-label">
                  <th className="pb-3 font-semibold">Experience</th>
                  <th className="pb-3 font-semibold">Destination</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Duration</th>
                  <th className="pb-3 font-semibold">Base Price</th>
                  <th className="pb-3 font-semibold text-center">Curation</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vistaro-border">
                {filteredExperiences.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-vistaro-muted">
                      No experiences found. Click "Create Experience" to publish your first local host activity.
                    </td>
                  </tr>
                ) : (
                  filteredExperiences.map((exp) => (
                    <tr key={exp._id} className="hover:bg-vistaro-secondary/50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={exp.coverImage?.url || exp.image?.url || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=200&q=60'}
                            alt={exp.title}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 bg-vistaro-surface"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-body-sm text-vistaro-primary truncate max-w-xs">{exp.title}</div>
                            <div className="text-caption text-vistaro-muted font-mono">/{exp.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="bg-vistaro-secondary text-vistaro-accent border border-vistaro-border font-semibold px-2 py-0.5 rounded-full text-caption">
                          {exp.destination?.name || 'Curated'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="bg-vistaro-secondary text-vistaro-primary border border-vistaro-border font-semibold px-2 py-0.5 rounded-full text-caption">
                          {exp.category || 'Adventure'}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-vistaro-secondary">
                        {exp.durationHours || 2} Hours
                      </td>
                      <td className="py-3 text-price text-sm text-vistaro-primary">
                        {formatPrice(exp.price?.basePrice ?? exp.basePrice ?? 0)}
                      </td>
                      <td className="py-3 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-vistaro-secondary px-2 py-1 rounded-full border border-vistaro-border">
                          <button
                            type="button"
                            onClick={() => handleToggleExperienceFeatured(exp)}
                            className={`p-1 rounded-full transition-all cursor-pointer ${
                              exp.isFeatured
                                ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
                                : 'text-vistaro-muted hover:text-amber-500'
                            }`}
                            title={exp.isFeatured ? 'Featured (Click to remove)' : 'Mark as Featured ⭐'}
                          >
                            <Star className={`w-3.5 h-3.5 ${exp.isFeatured ? 'fill-amber-500' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleExperienceTrending(exp)}
                            className={`p-1 rounded-full transition-all cursor-pointer ${
                              exp.isTrending
                                ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30'
                                : 'text-vistaro-muted hover:text-rose-500'
                            }`}
                            title={exp.isTrending ? 'Trending (Click to remove)' : 'Mark as Trending 🔥'}
                          >
                            <Flame className={`w-3.5 h-3.5 ${exp.isTrending ? 'fill-rose-500' : ''}`} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-caption font-bold capitalize border border-vistaro-border ${
                            exp.isActive !== false
                              ? 'bg-vistaro-surface text-vistaro-success'
                              : 'bg-vistaro-surface text-vistaro-muted'
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
                            className="p-1.5 text-vistaro-muted hover:text-vistaro-accent hover:bg-vistaro-secondary rounded-lg transition-colors cursor-pointer"
                            title="Edit experience"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleExperienceActive(exp)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-vistaro-secondary ${
                              exp.isActive !== false
                                ? 'text-vistaro-success hover:text-vistaro-rating'
                                : 'text-vistaro-muted hover:text-vistaro-success'
                            }`}
                            title={exp.isActive !== false ? 'Deactivate experience' : 'Activate experience'}
                          >
                            {exp.isActive !== false ? (
                              <ToggleRight className="w-4 h-4 text-vistaro-success" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-vistaro-muted" />
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

      {/* TAB: TRANSFERS & CABS MANAGEMENT (Phase 6 / Part 6.4) */}
      {activeTab === 'transfers' && (
        <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-vistaro-border">
            <div>
              <h3 className="font-bold text-base text-vistaro-primary flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-500" />
                <span>Private Transfers & Transit Services</span>
              </h3>
              <p className="text-xs text-vistaro-muted">
                Create, update, and manage airport pickups, intercity cabs, and local vehicle hires.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-vistaro-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search transfers..."
                  value={transferSearch}
                  onChange={(e) => setTransferSearch(e.target.value)}
                  className="bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-full pl-8 pr-4 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent w-full sm:w-48 md:w-64"
                />
              </div>

              <button
                type="button"
                onClick={openCreateTransferModal}
                className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta text-xs py-2 px-4 rounded-full transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Transfer</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-vistaro-border text-vistaro-muted uppercase text-label">
                  <th className="pb-3 font-semibold">Service Title</th>
                  <th className="pb-3 font-semibold">Destination</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Vehicle & Capacity</th>
                  <th className="pb-3 font-semibold">Price Rate</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vistaro-border">
                {filteredTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-vistaro-muted">
                      No transfer services found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredTransfers.map((t) => (
                    <tr key={t._id} className="hover:bg-vistaro-secondary/50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={t.coverImage?.url || t.image?.url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80'}
                            alt={t.title}
                            className="w-12 h-9 rounded-lg object-cover border border-vistaro-border shrink-0"
                          />
                          <div className="max-w-xs truncate">
                            <div className="font-bold text-vistaro-primary truncate">{t.title}</div>
                            <div className="text-caption text-vistaro-muted font-mono truncate">/{t.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="bg-vistaro-secondary text-vistaro-accent border border-vistaro-border font-semibold px-2 py-0.5 rounded-full text-caption">
                          {t.destination?.name || 'Curated'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="capitalize text-caption px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                          {t.transferType ? t.transferType.replace(/-/g, ' ') : 'Transfer'}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-vistaro-secondary">
                        {t.vehicleType || 'SUV'} ({t.capacity || 4} Pax)
                      </td>
                      <td className="py-3 text-price text-sm text-vistaro-primary">
                        {formatPrice(t.price?.basePrice ?? t.basePrice ?? 0)}
                        <span className="text-2xs text-vistaro-muted font-normal ml-1">/{t.priceUnit || 'trip'}</span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`font-semibold px-2.5 py-0.5 rounded-full text-caption border border-vistaro-border ${
                            t.isActive !== false
                              ? 'bg-vistaro-surface text-vistaro-success'
                              : 'bg-vistaro-surface text-vistaro-muted'
                          }`}
                        >
                          {t.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditTransferModal(t)}
                            className="p-1.5 text-vistaro-muted hover:text-vistaro-primary hover:bg-vistaro-secondary rounded-lg transition-colors cursor-pointer"
                            title="Edit transfer service"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleTransferActive(t)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-vistaro-secondary ${
                              t.isActive !== false
                                ? 'text-vistaro-success hover:text-vistaro-rating'
                                : 'text-vistaro-muted hover:text-vistaro-success'
                            }`}
                            title={t.isActive !== false ? 'Deactivate transfer' : 'Activate transfer'}
                          >
                            {t.isActive !== false ? (
                              <ToggleRight className="w-4 h-4 text-vistaro-success" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-vistaro-muted" />
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

      {/* TAB 4: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Pending Host Applications Queue */}
          {usersList.filter((u) => u.hostRequestStatus === 'pending').length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
                <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Pending Host Access Applications ({usersList.filter((u) => u.hostRequestStatus === 'pending').length})</span>
                </div>
                <span className="text-caption bg-amber-500/20 text-amber-500 px-2.5 py-0.5 rounded-full font-bold">
                  Action Required
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {usersList
                  .filter((u) => u.hostRequestStatus === 'pending')
                  .map((applicant) => (
                    <div
                      key={applicant._id}
                      className="bg-vistaro-surface rounded-2xl border border-amber-500/30 p-4 flex flex-col justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-body-sm text-vistaro-primary">
                            @{applicant.username}
                          </span>
                          <span className="text-caption text-vistaro-muted">
                            {applicant.email}
                          </span>
                        </div>
                        {applicant.hostRequestReason ? (
                          <p className="text-xs text-vistaro-secondary bg-vistaro-secondary p-2.5 rounded-xl border border-vistaro-border">
                            <span className="font-semibold text-vistaro-primary">Application Note: </span>
                            "{applicant.hostRequestReason}"
                          </p>
                        ) : (
                          <p className="text-xs text-vistaro-muted italic">No specific note provided.</p>
                        )}
                        {applicant.hostRequestDate && (
                          <div className="text-2xs text-vistaro-muted">
                            Requested on: {new Date(applicant.hostRequestDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-vistaro-border">
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleHostApproval(applicant, 'reject')}
                          className="px-3 py-1.5 rounded-xl text-caption font-bold text-vistaro-error hover:bg-vistaro-error/10 border border-vistaro-error/20 transition-all cursor-pointer disabled:opacity-50"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleHostApproval(applicant, 'approve')}
                          className="px-4 py-1.5 rounded-xl text-caption font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          Approve Host Privileges
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* User Directory Table */}
          <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-vistaro-border">
              <div>
                <h3 className="font-bold text-base text-vistaro-primary">User Directory & Host Permissions</h3>
                <p className="text-xs text-vistaro-muted">Manage member accounts and assign Host or Administrator privileges.</p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-vistaro-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by username or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-full pl-8 pr-4 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent w-56 sm:w-72"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-vistaro-border text-vistaro-muted uppercase text-label">
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Joined Date</th>
                    <th className="pb-3 font-semibold">Listings</th>
                    <th className="pb-3 font-semibold">Bookings</th>
                    <th className="pb-3 font-semibold">Role & Status</th>
                    <th className="pb-3 font-semibold text-right">Access Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vistaro-border">
                  {filteredUsers.map((u) => {
                    const isCurrentAdmin = u._id === user?._id;

                    return (
                      <tr key={u._id} className="hover:bg-vistaro-secondary/50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5 font-bold text-vistaro-primary">
                            <div className="w-8 h-8 rounded-full bg-vistaro-secondary text-vistaro-primary border border-vistaro-border flex items-center justify-center font-bold text-xs uppercase">
                              {u.username?.charAt(0) || 'U'}
                            </div>
                            <span>@{u.username}</span>
                            {isCurrentAdmin && (
                              <span className="text-caption bg-vistaro-secondary text-vistaro-accent border border-vistaro-border px-2 py-0.5 rounded-full font-bold">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-vistaro-secondary">{u.email}</td>
                        <td className="py-3 text-vistaro-muted">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 font-semibold text-vistaro-primary">{u.listingCount || 0}</td>
                        <td className="py-3 font-semibold text-vistaro-primary">{u.bookingCount || 0}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-caption font-bold uppercase tracking-wider border border-vistaro-border ${
                                u.role === 'admin'
                                  ? 'bg-vistaro-secondary text-vistaro-accent'
                                  : u.role === 'host'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : 'bg-vistaro-secondary text-vistaro-secondary'
                              }`}
                            >
                              {u.role || 'user'}
                            </span>
                            {u.hostRequestStatus === 'pending' && (
                              <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                                Host Pending
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            {/* Role Dropdown Selector */}
                            <select
                              disabled={actionLoading || isCurrentAdmin}
                              value={u.role || 'user'}
                              onChange={(e) => handleSelectRole(u, e.target.value)}
                              className="bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-2.5 py-1 text-xs focus:outline-hidden focus:border-vistaro-accent cursor-pointer disabled:opacity-40"
                              title="Assign user role"
                            >
                              <option value="user">User (Traveler)</option>
                              <option value="host">Host (Verified)</option>
                              <option value="admin">Admin (Full)</option>
                            </select>

                            {!isCurrentAdmin && (
                              <button
                                type="button"
                                onClick={() => setDeleteModal({ type: 'user', id: u._id, name: `@${u.username}` })}
                                className="p-1.5 text-vistaro-muted hover:text-vistaro-error hover:bg-vistaro-secondary rounded-lg transition-colors cursor-pointer"
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
        </div>
      )}

      {/* TAB 4: PLATFORM BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-vistaro-border">
            <div>
              <h3 className="font-bold text-base text-vistaro-primary">All System Reservations</h3>
              <p className="text-xs text-vistaro-muted">Live feed of all customer bookings and transaction totals.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-vistaro-border text-vistaro-muted uppercase text-label">
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
              <tbody className="divide-y divide-vistaro-border">
                {recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-vistaro-secondary/50 transition-colors">
                    <td className="py-3 font-mono text-vistaro-muted text-caption">#{b._id.slice(-6)}</td>
                    <td className="py-3 font-semibold text-body-sm text-vistaro-primary truncate max-w-xs">{b.listing?.title || 'Stay'}</td>
                    <td className="py-3 text-vistaro-secondary">@{b.user?.username || 'Guest'}</td>
                    <td className="py-3 text-vistaro-secondary">{new Date(b.checkIn).toLocaleDateString()}</td>
                    <td className="py-3 text-vistaro-secondary">{new Date(b.checkOut).toLocaleDateString()}</td>
                    <td className="py-3 text-vistaro-secondary">{b.guests}</td>
                    <td className="py-3 text-price text-sm text-vistaro-accent">{formatPrice(b.totalPrice || 0)}</td>
                    <td className="py-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-caption font-bold capitalize border border-vistaro-border ${
                          b.status === 'confirmed'
                            ? 'bg-vistaro-surface text-vistaro-success'
                            : 'bg-vistaro-surface text-vistaro-error'
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
          <div className="bg-vistaro-surface rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-vistaro-border my-8 max-h-[90vh] overflow-y-auto text-vistaro-primary">
            <div className="flex items-center justify-between pb-4 border-b border-vistaro-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-vistaro-secondary text-vistaro-rating border border-vistaro-border flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-display-h3 text-lg text-vistaro-primary">
                    {packageModal.mode === 'create' ? 'Create Tour Package' : 'Edit Tour Package'}
                  </h3>
                  <p className="text-body-sm text-vistaro-muted">
                    {packageModal.mode === 'create' ? 'Publish a new regional multi-day package' : 'Update package details, duration, or pricing'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPackageModal(null)}
                className="p-2 text-vistaro-muted hover:text-vistaro-primary hover:bg-vistaro-secondary rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4 text-xs">
              
              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">
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
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-label text-vistaro-primary mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ladakh-high-altitude-bike-expedition"
                    value={packageForm.slug}
                    onChange={(e) => setPackageForm({ ...packageForm, slug: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-hidden focus:border-vistaro-accent"
                    required
                  />
                </div>
              </div>

              {/* Destination & Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">
                    Destination Region *
                  </label>
                  <select
                    value={packageForm.destination}
                    onChange={(e) => setPackageForm({ ...packageForm, destination: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent cursor-pointer"
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
                  <label className="block text-label text-vistaro-primary mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={packageForm.difficultyLevel}
                    onChange={(e) => setPackageForm({ ...packageForm, difficultyLevel: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent cursor-pointer"
                  >
                    <option value="Easy">Easy (Relaxed / Family-friendly)</option>
                    <option value="Moderate">Moderate (Active Walking / Exploring)</option>
                    <option value="Challenging">Challenging (High Altitude / Trekking)</option>
                  </select>
                </div>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-label text-vistaro-primary mb-1">
                  Cover Image URL *
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={packageForm.coverImageUrl}
                  onChange={(e) => setPackageForm({ ...packageForm, coverImageUrl: e.target.value })}
                  className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent"
                  required
                />
              </div>

              {/* Duration (Days/Nights) & Pricing & Max Group */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">
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
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-label text-vistaro-primary mb-1">
                    Nights *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={packageForm.durationNights}
                    onChange={(e) => setPackageForm({ ...packageForm, durationNights: Number(e.target.value) })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-label text-vistaro-primary mb-1">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={packageForm.basePrice}
                    onChange={(e) => setPackageForm({ ...packageForm, basePrice: Number(e.target.value) })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-label text-vistaro-primary mb-1">
                    Max Group
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={packageForm.maxGroupSize}
                    onChange={(e) => setPackageForm({ ...packageForm, maxGroupSize: Number(e.target.value) })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
              </div>

              {/* Short & Long Description */}
              <div>
                <label className="block text-label text-vistaro-primary mb-1">
                  Short Highlight Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. 7-day high altitude bike expedition across Khardung La and Pangong Tso."
                  value={packageForm.shortDescription}
                  onChange={(e) => setPackageForm({ ...packageForm, shortDescription: e.target.value })}
                  className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent"
                />
              </div>

              <div>
                <label className="block text-label text-vistaro-primary mb-1">
                  Long Detailed Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the overall journey, terrain, accommodations, and unique highlights..."
                  value={packageForm.longDescription}
                  onChange={(e) => setPackageForm({ ...packageForm, longDescription: e.target.value })}
                  className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent"
                />
              </div>

              {/* Day-by-Day Itinerary Builder */}
              <div className="space-y-3 pt-3 border-t border-vistaro-border">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-label text-vistaro-primary">
                      Day-by-Day Itinerary ({packageForm.itinerary?.length || 0} Days)
                    </label>
                    <p className="text-body-sm text-vistaro-muted">
                      Define daily schedule, locations, and planned activities.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItineraryDay}
                    className="inline-flex items-center gap-1 bg-vistaro-secondary hover:bg-vistaro-main text-vistaro-rating border border-vistaro-border text-cta py-1.5 px-3 rounded-full transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Day</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {(packageForm.itinerary || []).map((day, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-vistaro-secondary border border-vistaro-border space-y-2.5 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="bg-vistaro-accent text-white font-semibold text-caption px-2.5 py-0.5 rounded-full">
                          Day {day.dayNumber || idx + 1}
                        </span>

                        {(packageForm.itinerary || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItineraryDay(idx)}
                            className="text-vistaro-muted hover:text-vistaro-error p-1 transition-colors cursor-pointer"
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
                          className="w-full bg-vistaro-surface border border-vistaro-border text-vistaro-primary rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-hidden focus:border-vistaro-accent"
                          required
                        />

                        <textarea
                          rows={2}
                          placeholder="Day Description (Summary of route, terrain, and overnight stops...)"
                          value={day.description}
                          onChange={(e) => handleUpdateItineraryDay(idx, 'description', e.target.value)}
                          className="w-full bg-vistaro-surface border border-vistaro-border text-vistaro-primary rounded-xl px-3 py-1.5 text-xs focus:outline-hidden focus:border-vistaro-accent"
                        />

                        <input
                          type="text"
                          placeholder="Activities (comma-separated or one per line, e.g. Shanti Stupa, Local Market)"
                          value={day.activities}
                          onChange={(e) => handleUpdateItineraryDay(idx, 'activities', e.target.value)}
                          className="w-full bg-vistaro-surface border border-vistaro-border text-caption text-vistaro-secondary focus:outline-hidden focus:border-vistaro-accent"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-vistaro-border">
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">
                    Inclusions (one item per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Royal Enfield 500cc&#10;Mechanic Support&#10;Meals & Stay"
                    value={packageForm.inclusions}
                    onChange={(e) => setPackageForm({ ...packageForm, inclusions: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>

                <div>
                  <label className="block text-label text-vistaro-primary mb-1">
                    Exclusions (one item per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Airfare to Leh&#10;Personal Riding Gear&#10;Tips"
                    value={packageForm.exclusions}
                    onChange={(e) => setPackageForm({ ...packageForm, exclusions: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
              </div>

              {/* Curation & Active Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-vistaro-secondary/60 border border-vistaro-border p-3 rounded-2xl">
                  <input
                    type="checkbox"
                    checked={packageForm.isFeatured}
                    onChange={(e) => setPackageForm({ ...packageForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded border-vistaro-border focus:ring-amber-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 text-body-sm font-semibold text-vistaro-primary">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>Featured ⭐</span>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-vistaro-secondary/60 border border-vistaro-border p-3 rounded-2xl">
                  <input
                    type="checkbox"
                    checked={packageForm.isTrending}
                    onChange={(e) => setPackageForm({ ...packageForm, isTrending: e.target.checked })}
                    className="w-4 h-4 text-rose-500 rounded border-vistaro-border focus:ring-rose-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 text-body-sm font-semibold text-vistaro-primary">
                    <Flame className="w-4 h-4 text-rose-500" />
                    <span>Trending 🔥</span>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-vistaro-secondary/60 border border-vistaro-border p-3 rounded-2xl">
                  <input
                    type="checkbox"
                    checked={packageForm.isActive}
                    onChange={(e) => setPackageForm({ ...packageForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-vistaro-accent rounded border-vistaro-border focus:ring-vistaro-accent cursor-pointer"
                  />
                  <div className="text-body-sm font-semibold text-vistaro-primary">
                    <span>Active on Portal</span>
                  </div>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-vistaro-border">
                <button
                  type="button"
                  onClick={() => setPackageModal(null)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-full text-cta bg-vistaro-secondary hover:bg-vistaro-main text-vistaro-primary border border-vistaro-border transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-full text-cta bg-vistaro-accent hover:bg-vistaro-accent-hover text-white transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : packageModal.mode === 'create' ? 'Create Package' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Experience Create / Edit Modal */}
      {experienceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-vistaro-surface rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-vistaro-border my-8 max-h-[90vh] overflow-y-auto text-vistaro-primary">
            <div className="flex items-center justify-between pb-4 border-b border-vistaro-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-vistaro-secondary text-vistaro-accent border border-vistaro-border flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-display-h3 text-lg text-vistaro-primary">
                    {experienceModal.mode === 'create' ? 'Create Host Experience' : 'Edit Experience'}
                  </h3>
                  <p className="text-body-sm text-vistaro-muted">
                    {experienceModal.mode === 'create' ? 'Publish a unique local immersion or guided activity' : 'Update experience itinerary, inclusions, or pricing'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExperienceModal(null)}
                className="p-2 text-vistaro-muted hover:text-vistaro-primary hover:bg-vistaro-secondary rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExperience} className="space-y-4">
              {/* Title & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-label text-vistaro-primary mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Traditional Tea Tasting & Plantation Walk"
                    value={experienceForm.title}
                    onChange={(e) => setExperienceForm({ ...experienceForm, title: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">URL Slug</label>
                  <input
                    type="text"
                    placeholder="tea-tasting-walk"
                    value={experienceForm.slug}
                    onChange={(e) => setExperienceForm({ ...experienceForm, slug: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
              </div>

              {/* Destination Hub & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">Destination Hub *</label>
                  <select
                    value={experienceForm.destination}
                    onChange={(e) => setExperienceForm({ ...experienceForm, destination: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent cursor-pointer"
                    required
                  >
                    <option value="">Select Destination Hub</option>
                    {destinationsList.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.state})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">Category *</label>
                  <select
                    value={experienceForm.category}
                    onChange={(e) => setExperienceForm({ ...experienceForm, category: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent cursor-pointer"
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
                  <label className="block text-label text-vistaro-primary mb-1">Duration (Hours) *</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    required
                    value={experienceForm.durationHours}
                    onChange={(e) => setExperienceForm({ ...experienceForm, durationHours: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={experienceForm.basePrice}
                    onChange={(e) => setExperienceForm({ ...experienceForm, basePrice: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">Max Group</label>
                  <input
                    type="number"
                    min="1"
                    value={experienceForm.maxGroupSize}
                    onChange={(e) => setExperienceForm({ ...experienceForm, maxGroupSize: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">Difficulty</label>
                  <select
                    value={experienceForm.difficultyLevel}
                    onChange={(e) => setExperienceForm({ ...experienceForm, difficultyLevel: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Challenging">Challenging</option>
                  </select>
                </div>
              </div>

              {/* Cover Image URL & Meeting Point */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">Cover Image URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    value={experienceForm.coverImageUrl}
                    onChange={(e) => setExperienceForm({ ...experienceForm, coverImageUrl: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">Meeting Point Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g. Heritage Estate Main Gate, Kalimpong"
                    value={experienceForm.meetingPoint}
                    onChange={(e) => setExperienceForm({ ...experienceForm, meetingPoint: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
              </div>

              {/* What's Included */}
              <div>
                <label className="block text-label text-vistaro-primary mb-1">What's Included (1 per line)</label>
                <textarea
                  rows={3}
                  placeholder="Certified local guide&#10;Artisanal tea tasting&#10;Bakery pairing"
                  value={experienceForm.whatsIncluded}
                  onChange={(e) => setExperienceForm({ ...experienceForm, whatsIncluded: e.target.value })}
                  className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent"
                />
              </div>

              {/* Short & Long Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">Short Tagline</label>
                  <textarea
                    rows={3}
                    placeholder="Quick 1-2 sentence preview"
                    value={experienceForm.shortDescription}
                    onChange={(e) => setExperienceForm({ ...experienceForm, shortDescription: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">Full Long Description</label>
                  <textarea
                    rows={3}
                    placeholder="Detailed activity highlights and itinerary overview"
                    value={experienceForm.longDescription}
                    onChange={(e) => setExperienceForm({ ...experienceForm, longDescription: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
              </div>

              {/* Curation & Active Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-vistaro-secondary/60 border border-vistaro-border p-3 rounded-2xl">
                  <input
                    type="checkbox"
                    checked={experienceForm.isFeatured}
                    onChange={(e) => setExperienceForm({ ...experienceForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded border-vistaro-border focus:ring-amber-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 text-body-sm font-semibold text-vistaro-primary">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>Featured ⭐</span>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-vistaro-secondary/60 border border-vistaro-border p-3 rounded-2xl">
                  <input
                    type="checkbox"
                    checked={experienceForm.isTrending}
                    onChange={(e) => setExperienceForm({ ...experienceForm, isTrending: e.target.checked })}
                    className="w-4 h-4 text-rose-500 rounded border-vistaro-border focus:ring-rose-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 text-body-sm font-semibold text-vistaro-primary">
                    <Flame className="w-4 h-4 text-rose-500" />
                    <span>Trending 🔥</span>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-vistaro-secondary/60 border border-vistaro-border p-3 rounded-2xl">
                  <input
                    type="checkbox"
                    checked={experienceForm.isActive}
                    onChange={(e) => setExperienceForm({ ...experienceForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-vistaro-accent rounded border-vistaro-border focus:ring-vistaro-accent cursor-pointer"
                  />
                  <div className="text-body-sm font-semibold text-vistaro-primary">
                    <span>Active on Portal</span>
                  </div>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-vistaro-border">
                <button
                  type="button"
                  onClick={() => setExperienceModal(null)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-full text-cta bg-vistaro-secondary hover:bg-vistaro-main text-vistaro-primary border border-vistaro-border transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-full text-cta bg-vistaro-accent hover:bg-vistaro-accent-hover text-white transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : experienceModal.mode === 'create' ? 'Publish Experience' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Create / Edit Modal (Phase 6 / Part 6.4) */}
      {transferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-vistaro-surface rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-vistaro-border my-8 max-h-[90vh] overflow-y-auto text-vistaro-primary">
            <div className="flex items-center justify-between pb-4 border-b border-vistaro-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-vistaro-secondary text-emerald-500 border border-vistaro-border flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-display-h3 text-lg text-vistaro-primary">
                    {transferModal.mode === 'create' ? 'Create Transfer Service' : 'Edit Transfer Service'}
                  </h3>
                  <p className="text-body-sm text-vistaro-muted">
                    {transferModal.mode === 'create' ? 'Add a new private cab, airport pickup, or regional transit service' : 'Update route details, vehicle class, and rates'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTransferModal(null)}
                className="p-2 text-vistaro-muted hover:text-vistaro-primary hover:bg-vistaro-secondary rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransfer} className="space-y-4 text-xs">
              
              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">Service Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Leh Airport to City Hotel Private SUV"
                    value={transferForm.title}
                    onChange={(e) => {
                      const titleVal = e.target.value;
                      setTransferForm((prev) => ({
                        ...prev,
                        title: titleVal,
                        slug: transferModal.mode === 'create' ? titleVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : prev.slug,
                      }));
                    }}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. leh-airport-to-city-hotel-suv"
                    value={transferForm.slug}
                    onChange={(e) => setTransferForm({ ...transferForm, slug: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
              </div>

              {/* Destination & Transfer Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">Destination Region *</label>
                  <select
                    required
                    value={transferForm.destination}
                    onChange={(e) => setTransferForm({ ...transferForm, destination: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent cursor-pointer"
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
                  <label className="block text-label text-vistaro-primary mb-1">Transfer Type *</label>
                  <select
                    value={transferForm.transferType}
                    onChange={(e) => setTransferForm({ ...transferForm, transferType: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent cursor-pointer"
                  >
                    <option value="airport-pickup">Airport Pickup</option>
                    <option value="airport-drop">Airport Drop-off</option>
                    <option value="intercity">Intercity Route / One-Way</option>
                    <option value="local-day-hire">Local Day Hire (Full Day)</option>
                    <option value="scenic-drive">Scenic Transit Experience</option>
                  </select>
                </div>
              </div>

              {/* Vehicle Type, Capacity, Base Price, Price Unit */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">Vehicle Class *</label>
                  <select
                    value={transferForm.vehicleType}
                    onChange={(e) => setTransferForm({ ...transferForm, vehicleType: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent cursor-pointer"
                  >
                    <option value="Sedan">Sedan (4 Pax)</option>
                    <option value="SUV">SUV (6 Pax)</option>
                    <option value="Luxury SUV">Luxury SUV</option>
                    <option value="Tempo Traveller">Tempo Traveller (12 Pax)</option>
                    <option value="Bike / Cruiser">Bike / Cruiser</option>
                  </select>
                </div>
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">Capacity (Pax) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={transferForm.capacity}
                    onChange={(e) => setTransferForm({ ...transferForm, capacity: Number(e.target.value) })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={transferForm.basePrice}
                    onChange={(e) => setTransferForm({ ...transferForm, basePrice: Number(e.target.value) })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">Price Unit *</label>
                  <select
                    value={transferForm.priceUnit}
                    onChange={(e) => setTransferForm({ ...transferForm, priceUnit: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent cursor-pointer"
                  >
                    <option value="per-trip">Per Trip</option>
                    <option value="per-day">Per Day</option>
                    <option value="per-hour">Per Hour</option>
                  </select>
                </div>
              </div>

              {/* Pickup & Drop Points & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">Pickup Hub / Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g. Kushok Bakula Airport"
                    value={transferForm.pickupLocation}
                    onChange={(e) => setTransferForm({ ...transferForm, pickupLocation: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">Drop-off Hub / Zone</label>
                  <input
                    type="text"
                    placeholder="e.g. Leh City Hotels / Stays"
                    value={transferForm.dropLocation}
                    onChange={(e) => setTransferForm({ ...transferForm, dropLocation: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">Estimated Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 25-30 mins"
                    value={transferForm.estimatedDuration}
                    onChange={(e) => setTransferForm({ ...transferForm, estimatedDuration: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-label text-vistaro-primary mb-1">Cover Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={transferForm.coverImageUrl}
                  onChange={(e) => setTransferForm({ ...transferForm, coverImageUrl: e.target.value })}
                  className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent"
                />
              </div>

              {/* Inclusions (1 per line) */}
              <div>
                <label className="block text-label text-vistaro-primary mb-1">Included Amenities (1 per line)</label>
                <textarea
                  rows={3}
                  placeholder="Professional Chauffeur&#10;Air Conditioning&#10;Toll & Parking Included&#10;Luggage Carrier"
                  value={transferForm.includedFeatures}
                  onChange={(e) => setTransferForm({ ...transferForm, includedFeatures: e.target.value })}
                  className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-label text-vistaro-primary mb-1">Route & Service Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed notes on vehicle comfort, driver vetting, and baggage guidance..."
                  value={transferForm.description}
                  onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                  className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="transferIsActive"
                  checked={transferForm.isActive}
                  onChange={(e) => setTransferForm({ ...transferForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-vistaro-accent rounded-sm border-vistaro-border focus:ring-vistaro-accent cursor-pointer"
                />
                <label htmlFor="transferIsActive" className="text-body-sm font-semibold text-vistaro-primary cursor-pointer">
                  Publish transfer service immediately (Active on public portal)
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-vistaro-border">
                <button
                  type="button"
                  onClick={() => setTransferModal(null)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-full text-cta bg-vistaro-secondary hover:bg-vistaro-main text-vistaro-primary border border-vistaro-border transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-full text-cta bg-vistaro-accent hover:bg-vistaro-accent-hover text-white transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : transferModal.mode === 'create' ? 'Publish Transfer' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Destination Create / Edit Modal */}
      {destinationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-vistaro-surface rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-vistaro-border my-8 max-h-[90vh] overflow-y-auto text-vistaro-primary">
            <div className="flex items-center justify-between pb-4 border-b border-vistaro-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-vistaro-secondary text-sky-500 border border-vistaro-border flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-display-h3 text-lg text-vistaro-primary">
                    {destinationModal.mode === 'create' ? 'Create Travel Destination' : 'Edit Destination Hub'}
                  </h3>
                  <p className="text-body-sm text-vistaro-muted">
                    {destinationModal.mode === 'create' ? 'Publish a new regional travel destination and gateway' : 'Update destination details, hero imagery, and curation flags'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDestinationModal(null)}
                className="p-2 text-vistaro-muted hover:text-vistaro-primary hover:bg-vistaro-secondary rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDestination} className="space-y-4">
              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-label text-vistaro-primary mb-1">Destination Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Goa"
                    value={destinationForm.name}
                    onChange={(e) => setDestinationForm({ ...destinationForm, name: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">URL Slug</label>
                  <input
                    type="text"
                    placeholder="goa"
                    value={destinationForm.slug}
                    onChange={(e) => setDestinationForm({ ...destinationForm, slug: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
              </div>

              {/* State & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">State / Province</label>
                  <input
                    type="text"
                    placeholder="e.g. Goa / Ladakh / Himachal Pradesh"
                    value={destinationForm.state}
                    onChange={(e) => setDestinationForm({ ...destinationForm, state: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">Country</label>
                  <input
                    type="text"
                    value={destinationForm.country}
                    onChange={(e) => setDestinationForm({ ...destinationForm, country: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
              </div>

              {/* Short Tagline */}
              <div>
                <label className="block text-label text-vistaro-primary mb-1">Short Tagline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Golden Sands, Portuguese Architecture & Tropical Bliss"
                  value={destinationForm.shortTagline}
                  onChange={(e) => setDestinationForm({ ...destinationForm, shortTagline: e.target.value })}
                  className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent"
                />
              </div>

              {/* Hero Image URL */}
              <div>
                <label className="block text-label text-vistaro-primary mb-1">Hero Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={destinationForm.heroImageUrl}
                  onChange={(e) => setDestinationForm({ ...destinationForm, heroImageUrl: e.target.value })}
                  className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent"
                />
              </div>

              {/* Best For & Identity Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">Best For (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Beaches, Nightlife, Water Sports"
                    value={destinationForm.bestFor}
                    onChange={(e) => setDestinationForm({ ...destinationForm, bestFor: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
                <div>
                  <label className="block text-label text-vistaro-primary mb-1">Identity Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Coastal, Tropical, Heritage"
                    value={destinationForm.identityTags}
                    onChange={(e) => setDestinationForm({ ...destinationForm, identityTags: e.target.value })}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent"
                  />
                </div>
              </div>

              {/* Long Description */}
              <div>
                <label className="block text-label text-vistaro-primary mb-1">Destination Overview</label>
                <textarea
                  rows={3}
                  placeholder="Detailed background and travel narrative for this destination..."
                  value={destinationForm.longDescription}
                  onChange={(e) => setDestinationForm({ ...destinationForm, longDescription: e.target.value })}
                  className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-vistaro-accent"
                />
              </div>

              {/* Curation & Active Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-vistaro-secondary/60 border border-vistaro-border p-3 rounded-2xl">
                  <input
                    type="checkbox"
                    checked={destinationForm.isFeatured}
                    onChange={(e) => setDestinationForm({ ...destinationForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded border-vistaro-border focus:ring-amber-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 text-body-sm font-semibold text-vistaro-primary">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>Featured ⭐</span>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-vistaro-secondary/60 border border-vistaro-border p-3 rounded-2xl">
                  <input
                    type="checkbox"
                    checked={destinationForm.isTrending}
                    onChange={(e) => setDestinationForm({ ...destinationForm, isTrending: e.target.checked })}
                    className="w-4 h-4 text-rose-500 rounded border-vistaro-border focus:ring-rose-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 text-body-sm font-semibold text-vistaro-primary">
                    <Flame className="w-4 h-4 text-rose-500" />
                    <span>Trending 🔥</span>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-vistaro-secondary/60 border border-vistaro-border p-3 rounded-2xl">
                  <input
                    type="checkbox"
                    checked={destinationForm.isActive}
                    onChange={(e) => setDestinationForm({ ...destinationForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-vistaro-accent rounded border-vistaro-border focus:ring-vistaro-accent cursor-pointer"
                  />
                  <div className="text-body-sm font-semibold text-vistaro-primary">
                    <span>Active on Portal</span>
                  </div>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-vistaro-border">
                <button
                  type="button"
                  onClick={() => setDestinationModal(null)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-full text-cta bg-vistaro-secondary hover:bg-vistaro-main text-vistaro-primary border border-vistaro-border transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-full text-cta bg-vistaro-accent hover:bg-vistaro-accent-hover text-white transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : destinationModal.mode === 'create' ? 'Publish Destination' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-vistaro-surface rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-vistaro-border text-vistaro-primary">
            <div className="w-12 h-12 rounded-2xl bg-vistaro-secondary text-vistaro-error border border-vistaro-border flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-display-h3 text-lg text-vistaro-primary">
                Confirm Admin Deletion
              </h3>
              <p className="text-body-sm text-vistaro-secondary">
                Are you sure you want to permanently delete <b>{deleteModal.name}</b>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                disabled={actionLoading}
                className="flex-1 bg-vistaro-secondary hover:bg-vistaro-main text-vistaro-primary border border-vistaro-border text-cta py-3 rounded-full transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="flex-1 bg-vistaro-error hover:bg-vistaro-accent-hover text-white text-cta py-3 rounded-full transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
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
