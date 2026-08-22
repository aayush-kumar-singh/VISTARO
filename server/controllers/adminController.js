const User = require("../models/User.js");
const Listing = require("../models/Listing.js");
const Booking = require("../models/Booking.js");
const Review = require("../models/Review.js");
const Destination = require("../models/Destination.js");
const TourPackage = require("../models/TourPackage.js");
const Experience = require("../models/Experience.js");
const Transfer = require("../models/Transfer.js");
const cloudinary = require("../config/cloudinary.js").cloudinary;

// GET /api/admin/stats
module.exports.getStats = async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalReviews = await Review.countDocuments();
    const totalDestinations = await Destination.countDocuments();
    const totalTourPackages = await TourPackage.countDocuments();
    const totalExperiences = await Experience.countDocuments();
    const totalTransfers = await Transfer.countDocuments();

    // Calculate total confirmed booking volume
    const confirmedBookings = await Booking.find({ status: "confirmed" });
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    // Recent 10 bookings
    const recentBookings = await Booking.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("user", "username email")
        .populate("listing", "title location country image images")
        .populate("tourPackage", "title destination slug coverImage price");

    // Recent 8 listings
    const recentListings = await Listing.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("owner", "username email role");

    res.json({
        success: true,
        stats: {
            totalUsers,
            totalListings,
            totalBookings,
            totalReviews,
            totalDestinations,
            totalTourPackages,
            totalExperiences,
            totalTransfers,
            totalRevenue,
        },
        recentBookings,
        recentListings,
    });
};

// GET /api/admin/users
module.exports.getAllUsers = async (req, res) => {
    const users = await User.find()
        .select("-hash -salt")
        .sort({ createdAt: -1 });

    // Aggregate listing counts per user
    const usersWithStats = await Promise.all(
        users.map(async (u) => {
            const listingCount = await Listing.countDocuments({ owner: u._id });
            const bookingCount = await Booking.countDocuments({ user: u._id });

            return {
                _id: u._id,
                username: u.username,
                email: u.email,
                role: u.role || "user",
                bio: u.bio || "",
                createdAt: u.createdAt,
                listingCount,
                bookingCount,
            };
        })
    );

    res.json({
        success: true,
        users: usersWithStats,
    });
};

// PATCH /api/admin/users/:id/role
module.exports.updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
        return res.status(400).json({
            success: false,
            error: "Role must be either 'user' or 'admin'.",
        });
    }

    // Prevent last admin from demoting themselves
    if (req.user._id.toString() === id && role !== "admin") {
        const adminCount = await User.countDocuments({ role: "admin" });
        if (adminCount <= 1) {
            return res.status(400).json({
                success: false,
                error: "Cannot demote the only remaining administrator.",
            });
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true }
    ).select("-hash -salt");

    if (!updatedUser) {
        return res.status(404).json({
            success: false,
            error: "User not found.",
        });
    }

    res.json({
        success: true,
        message: `User ${updatedUser.username} role updated to ${role}.`,
        user: updatedUser,
    });
};

// DELETE /api/admin/listings/:id
module.exports.deleteListingAdmin = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
        return res.status(404).json({
            success: false,
            error: "Listing not found.",
        });
    }

    // Delete associated reviews
    if (listing.reviews && listing.reviews.length > 0) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }

    // Delete associated bookings
    await Booking.deleteMany({ listing: id });

    // Clean up Cloudinary images if stored
    try {
        const imagesToDelete = [];
        if (listing.image && listing.image.filename) {
            imagesToDelete.push(listing.image.filename);
        }
        if (listing.images && listing.images.length > 0) {
            listing.images.forEach((img) => {
                if (img.filename) imagesToDelete.push(img.filename);
            });
        }

        for (const filename of imagesToDelete) {
            await cloudinary.uploader.destroy(filename).catch(() => {});
        }
    } catch (e) {
        console.error("Cloudinary cleanup error during admin delete:", e);
    }

    await Listing.findByIdAndDelete(id);

    res.json({
        success: true,
        message: "Listing deleted successfully by administrator.",
    });
};

// DELETE /api/admin/users/:id
module.exports.deleteUserAdmin = async (req, res) => {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
        return res.status(400).json({
            success: false,
            error: "You cannot delete your own admin account.",
        });
    }

    const userToDelete = await User.findById(id);
    if (!userToDelete) {
        return res.status(404).json({
            success: false,
            error: "User not found.",
        });
    }

    // Remove user's listings
    await Listing.deleteMany({ owner: id });
    // Remove user's bookings
    await Booking.deleteMany({ user: id });
    // Remove user's reviews
    await Review.deleteMany({ author: id });

    await User.findByIdAndDelete(id);

    res.json({
        success: true,
        message: `User ${userToDelete.username} and associated data successfully deleted.`,
    });
};

// --------------------------------------------------
// POST /api/admin/destinations — Create Destination
// --------------------------------------------------
module.exports.createDestinationAdmin = async (req, res) => {
    const data = req.body.destination || req.body;
    const { name, slug, shortTagline, tagline, heroImage, image, state, country, longDescription, description, galleryImages, bestFor, identityTags, coordinates, isActive } = data;

    const finalName = (name || "").trim();
    const finalSlug = (slug || "").toLowerCase().trim().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
    const finalTagline = (shortTagline || tagline || "").trim();
    
    let finalHeroImage = heroImage || image;
    if (typeof finalHeroImage === "string") {
        finalHeroImage = { url: finalHeroImage, filename: "" };
    }

    if (!finalName || !finalSlug || !finalTagline || !finalHeroImage || !finalHeroImage.url) {
        return res.status(400).json({
            success: false,
            error: "Validation failed: 'name', 'slug', 'shortTagline', and 'heroImage.url' are required.",
        });
    }

    // Check slug uniqueness
    const existingSlug = await Destination.findOne({ slug: finalSlug });
    if (existingSlug) {
        return res.status(409).json({
            success: false,
            error: `A destination with slug '${finalSlug}' already exists. Please choose a unique slug.`,
        });
    }

    const newDestination = new Destination({
        name: finalName,
        slug: finalSlug,
        state: (state || "").trim(),
        country: (country || "India").trim(),
        shortTagline: finalTagline,
        longDescription: (longDescription || description || "").trim(),
        heroImage: finalHeroImage,
        galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
        bestFor: Array.isArray(bestFor) ? bestFor.map(t => String(t).trim()).filter(Boolean) : [],
        identityTags: Array.isArray(identityTags) ? identityTags.map(t => String(t).trim()).filter(Boolean) : [],
        coordinates: coordinates || { lat: 0, lng: 0 },
        isActive: typeof isActive === "boolean" ? isActive : true,
    });

    const saved = await newDestination.save();

    res.status(201).json({
        success: true,
        message: `Destination '${saved.name}' created successfully.`,
        destination: saved,
    });
};

// --------------------------------------------------
// PATCH /api/admin/destinations/:id — Update Destination
// --------------------------------------------------
module.exports.updateDestinationAdmin = async (req, res) => {
    const { id } = req.params;
    const data = req.body.destination || req.body;

    const destination = await Destination.findById(id);
    if (!destination) {
        return res.status(404).json({
            success: false,
            error: "Destination not found.",
        });
    }

    // If updating slug, check uniqueness against other destinations
    if (data.slug) {
        const newSlug = String(data.slug).toLowerCase().trim().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
        if (newSlug !== destination.slug) {
            const conflict = await Destination.findOne({
                _id: { $ne: id },
                slug: newSlug,
            });
            if (conflict) {
                return res.status(409).json({
                    success: false,
                    error: `A destination with slug '${newSlug}' already exists.`,
                });
            }
            destination.slug = newSlug;
        }
    }

    if (data.name !== undefined) destination.name = String(data.name).trim();
    if (data.state !== undefined) destination.state = String(data.state).trim();
    if (data.country !== undefined) destination.country = String(data.country).trim();
    if (data.shortTagline !== undefined || data.tagline !== undefined) {
        destination.shortTagline = String(data.shortTagline || data.tagline).trim();
    }
    if (data.longDescription !== undefined || data.description !== undefined) {
        destination.longDescription = String(data.longDescription || data.description).trim();
    }
    if (data.heroImage !== undefined || data.image !== undefined) {
        const img = data.heroImage || data.image;
        destination.heroImage = typeof img === "string" ? { url: img, filename: "" } : img;
    }
    if (Array.isArray(data.galleryImages)) destination.galleryImages = data.galleryImages;
    if (Array.isArray(data.bestFor)) {
        destination.bestFor = data.bestFor.map(t => String(t).trim()).filter(Boolean);
    }
    if (Array.isArray(data.identityTags)) {
        destination.identityTags = data.identityTags.map(t => String(t).trim()).filter(Boolean);
    }
    if (data.coordinates !== undefined) destination.coordinates = data.coordinates;
    if (typeof data.isActive === "boolean") destination.isActive = data.isActive;

    // Validate and save
    const updated = await destination.save();

    res.json({
        success: true,
        message: `Destination '${updated.name}' updated successfully.`,
        destination: updated,
    });
};

// --------------------------------------------------
// DELETE /api/admin/destinations/:id — Soft-delete (Deactivate)
// --------------------------------------------------
module.exports.deactivateDestinationAdmin = async (req, res) => {
    const { id } = req.params;

    const destination = await Destination.findById(id);
    if (!destination) {
        return res.status(404).json({
            success: false,
            error: "Destination not found.",
        });
    }

    destination.isActive = false;
    await destination.save();

    res.json({
        success: true,
        message: `Destination '${destination.name}' has been deactivated (soft-deleted).`,
        destination,
    });
};

// --------------------------------------------------
// GET /api/admin/tour-packages — List all packages (including inactive)
// --------------------------------------------------
module.exports.getAllTourPackagesAdmin = async (req, res) => {
    const packages = await TourPackage.find()
        .populate("destination", "name slug state country shortTagline heroImage")
        .populate("createdBy", "username email")
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: packages.length,
        tourPackages: packages,
    });
};

// --------------------------------------------------
// POST /api/admin/tour-packages — Create Tour Package
// --------------------------------------------------
module.exports.createTourPackageAdmin = async (req, res) => {
    const data = req.body.tourPackage || req.body;
    const {
        title,
        slug,
        destination,
        shortDescription,
        longDescription,
        description,
        coverImage,
        image,
        galleryImages,
        duration,
        price,
        maxGroupSize,
        inclusions,
        exclusions,
        difficultyLevel,
        itinerary,
        isActive,
    } = data;

    const finalTitle = (title || "").trim();
    const finalSlug = (slug || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-");
    const finalDestId = destination;

    let finalCoverImage = coverImage || image;
    if (typeof finalCoverImage === "string") {
        finalCoverImage = { url: finalCoverImage, filename: "" };
    }

    // Handle files if uploaded via multipart
    if (req.files && req.files.length > 0) {
        finalCoverImage = {
            url: req.files[0].path,
            filename: req.files[0].filename,
        };
    }

    // Validation
    if (!finalTitle || !finalSlug || !finalDestId || !finalCoverImage || !finalCoverImage.url) {
        return res.status(400).json({
            success: false,
            error: "Validation failed: 'title', 'slug', 'destination', and 'coverImage.url' are required.",
        });
    }

    // Validate duration
    const finalDays = Number(duration?.days || duration || 1);
    const finalNights = Number(duration?.nights ?? Math.max(0, finalDays - 1));
    if (isNaN(finalDays) || finalDays < 1) {
        return res.status(400).json({
            success: false,
            error: "Validation failed: 'duration.days' must be at least 1.",
        });
    }

    // Validate price
    const finalBasePrice = Number(price?.basePrice ?? price ?? 0);
    if (isNaN(finalBasePrice) || finalBasePrice < 0) {
        return res.status(400).json({
            success: false,
            error: "Validation failed: 'price.basePrice' must be a non-negative number.",
        });
    }

    // Check that Destination exists
    const destinationDoc = await Destination.findById(finalDestId);
    if (!destinationDoc) {
        return res.status(400).json({
            success: false,
            error: "Selected destination does not exist. Please provide a valid destination ID.",
        });
    }

    // Check slug uniqueness
    const existingSlug = await TourPackage.findOne({ slug: finalSlug });
    if (existingSlug) {
        return res.status(409).json({
            success: false,
            error: `A tour package with slug '${finalSlug}' already exists. Please choose a unique slug.`,
        });
    }

    // Parse inclusions / exclusions if strings
    let parsedInclusions = inclusions || [];
    if (typeof parsedInclusions === "string") {
        parsedInclusions = parsedInclusions.split("\n").map(s => s.trim()).filter(Boolean);
    }
    let parsedExclusions = exclusions || [];
    if (typeof parsedExclusions === "string") {
        parsedExclusions = parsedExclusions.split("\n").map(s => s.trim()).filter(Boolean);
    }

    // Parse itinerary if provided
    let parsedItinerary = [];
    if (Array.isArray(itinerary)) {
        parsedItinerary = itinerary
            .map((item, idx) => ({
                dayNumber: Number(item.dayNumber || idx + 1),
                title: String(item.title || `Day ${idx + 1}`).trim(),
                description: String(item.description || "").trim(),
                activities: Array.isArray(item.activities)
                    ? item.activities.map(a => String(a).trim()).filter(Boolean)
                    : typeof item.activities === "string"
                    ? item.activities.split("\n").map(a => a.trim()).filter(Boolean)
                    : [],
            }))
            .filter(item => item.title)
            .sort((a, b) => a.dayNumber - b.dayNumber);
    }

    const newPackage = new TourPackage({
        title: finalTitle,
        slug: finalSlug,
        destination: finalDestId,
        shortDescription: (shortDescription || "").trim(),
        longDescription: (longDescription || description || "").trim(),
        coverImage: finalCoverImage,
        galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
        duration: { days: finalDays, nights: finalNights },
        price: {
            basePrice: finalBasePrice,
            currency: (price?.currency || "INR").trim(),
        },
        maxGroupSize: Number(maxGroupSize || 12),
        inclusions: parsedInclusions,
        exclusions: parsedExclusions,
        difficultyLevel: ["Easy", "Moderate", "Challenging"].includes(difficultyLevel)
            ? difficultyLevel
            : "Moderate",
        itinerary: parsedItinerary,
        isActive: typeof isActive === "boolean" ? isActive : true,
        createdBy: req.user?._id || null,
    });

    const saved = await newPackage.save();
    await saved.populate("destination", "name slug state country shortTagline heroImage");

    res.status(201).json({
        success: true,
        message: `Tour package '${saved.title}' created successfully.`,
        tourPackage: saved,
    });
};

// --------------------------------------------------
// PATCH /api/admin/tour-packages/:id — Update Tour Package
// --------------------------------------------------
module.exports.updateTourPackageAdmin = async (req, res) => {
    const { id } = req.params;
    const data = req.body.tourPackage || req.body;

    const tourPackage = await TourPackage.findById(id);
    if (!tourPackage) {
        return res.status(404).json({
            success: false,
            error: "Tour package not found.",
        });
    }

    // Slug update with uniqueness check
    if (data.slug) {
        const newSlug = String(data.slug)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-");

        if (newSlug !== tourPackage.slug) {
            const conflict = await TourPackage.findOne({
                _id: { $ne: id },
                slug: newSlug,
            });
            if (conflict) {
                return res.status(409).json({
                    success: false,
                    error: `A tour package with slug '${newSlug}' already exists.`,
                });
            }
            tourPackage.slug = newSlug;
        }
    }

    // Validate destination if updated
    if (data.destination) {
        const destDoc = await Destination.findById(data.destination);
        if (!destDoc) {
            return res.status(400).json({
                success: false,
                error: "Selected destination does not exist.",
            });
        }
        tourPackage.destination = data.destination;
    }

    if (data.title !== undefined) tourPackage.title = String(data.title).trim();
    if (data.shortDescription !== undefined) tourPackage.shortDescription = String(data.shortDescription).trim();
    if (data.longDescription !== undefined || data.description !== undefined) {
        tourPackage.longDescription = String(data.longDescription || data.description).trim();
    }
    if (data.coverImage !== undefined || data.image !== undefined) {
        const img = data.coverImage || data.image;
        tourPackage.coverImage = typeof img === "string" ? { url: img, filename: "" } : img;
    }
    if (Array.isArray(data.galleryImages)) tourPackage.galleryImages = data.galleryImages;

    if (data.duration) {
        const dDays = data.duration.days !== undefined ? Number(data.duration.days) : tourPackage.duration.days;
        const dNights = data.duration.nights !== undefined ? Number(data.duration.nights) : tourPackage.duration.nights;
        tourPackage.duration = { days: dDays, nights: dNights };
    }

    if (data.price) {
        const bPrice = data.price.basePrice !== undefined ? Number(data.price.basePrice) : (typeof data.price === "number" ? data.price : tourPackage.price.basePrice);
        const curr = data.price.currency || tourPackage.price.currency || "INR";
        tourPackage.price = { basePrice: bPrice, currency: curr };
    }

    if (data.maxGroupSize !== undefined) tourPackage.maxGroupSize = Number(data.maxGroupSize);
    if (data.difficultyLevel && ["Easy", "Moderate", "Challenging"].includes(data.difficultyLevel)) {
        tourPackage.difficultyLevel = data.difficultyLevel;
    }
    if (data.inclusions !== undefined) {
        tourPackage.inclusions = Array.isArray(data.inclusions)
            ? data.inclusions
            : String(data.inclusions).split("\n").map(s => s.trim()).filter(Boolean);
    }
    if (data.exclusions !== undefined) {
        tourPackage.exclusions = Array.isArray(data.exclusions)
            ? data.exclusions
            : String(data.exclusions).split("\n").map(s => s.trim()).filter(Boolean);
    }
    if (data.itinerary !== undefined) {
        if (Array.isArray(data.itinerary)) {
            tourPackage.itinerary = data.itinerary
                .map((item, idx) => ({
                    dayNumber: Number(item.dayNumber || idx + 1),
                    title: String(item.title || `Day ${idx + 1}`).trim(),
                    description: String(item.description || "").trim(),
                    activities: Array.isArray(item.activities)
                        ? item.activities.map(a => String(a).trim()).filter(Boolean)
                        : typeof item.activities === "string"
                        ? item.activities.split("\n").map(a => a.trim()).filter(Boolean)
                        : [],
                }))
                .filter(item => item.title)
                .sort((a, b) => a.dayNumber - b.dayNumber);
        } else {
            tourPackage.itinerary = [];
        }
    }
    if (typeof data.isActive === "boolean") tourPackage.isActive = data.isActive;

    const updated = await tourPackage.save();
    await updated.populate("destination", "name slug state country shortTagline heroImage");

    res.json({
        success: true,
        message: `Tour package '${updated.title}' updated successfully.`,
        tourPackage: updated,
    });
};

// --------------------------------------------------
// DELETE /api/admin/tour-packages/:id — Soft-delete (Deactivate)
// --------------------------------------------------
module.exports.deactivateTourPackageAdmin = async (req, res) => {
    const { id } = req.params;

    const tourPackage = await TourPackage.findById(id);
    if (!tourPackage) {
        return res.status(404).json({
            success: false,
            error: "Tour package not found.",
        });
    }

    tourPackage.isActive = false;
    await tourPackage.save();

    res.json({
        success: true,
        message: `Tour package '${tourPackage.title}' has been deactivated (soft-deleted).`,
        tourPackage,
    });
};

// ==================================================
// EXPERIENCE MANAGEMENT (Phase 3 / Part 3.4)
// ==================================================

// --------------------------------------------------
// GET /api/admin/experiences — List all experiences
// --------------------------------------------------
module.exports.getAllExperiencesAdmin = async (req, res) => {
    const experiences = await Experience.find()
        .populate("destination", "name slug state country shortTagline heroImage")
        .populate("createdBy", "username email")
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: experiences.length,
        experiences,
    });
};

// --------------------------------------------------
// POST /api/admin/experiences — Create Experience
// --------------------------------------------------
module.exports.createExperienceAdmin = async (req, res) => {
    const data = req.body.experience || req.body;
    const {
        title,
        slug,
        destination,
        category,
        shortDescription,
        longDescription,
        description,
        coverImage,
        image,
        galleryImages,
        durationHours,
        price,
        maxGroupSize,
        whatsIncluded,
        inclusions,
        meetingPoint,
        difficultyLevel,
        isActive,
    } = data;

    const finalTitle = (title || "").trim();
    const finalSlug = (slug || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-");
    const finalDestId = destination;

    let finalCoverImage = coverImage || image;
    if (typeof finalCoverImage === "string") {
        finalCoverImage = { url: finalCoverImage, filename: "" };
    }

    if (req.files && req.files.length > 0) {
        finalCoverImage = {
            url: req.files[0].path,
            filename: req.files[0].filename,
        };
    }

    // Validation
    if (!finalTitle || !finalSlug || !finalDestId || !finalCoverImage || !finalCoverImage.url) {
        return res.status(400).json({
            success: false,
            error: "Validation failed: 'title', 'slug', 'destination', and 'coverImage.url' are required.",
        });
    }

    const finalDurationHours = Number(durationHours || 2);
    if (isNaN(finalDurationHours) || finalDurationHours < 0.5) {
        return res.status(400).json({
            success: false,
            error: "Validation failed: 'durationHours' must be at least 0.5 hours.",
        });
    }

    const finalBasePrice = Number(price?.basePrice ?? price ?? 0);
    if (isNaN(finalBasePrice) || finalBasePrice < 0) {
        return res.status(400).json({
            success: false,
            error: "Validation failed: 'price.basePrice' must be a non-negative number.",
        });
    }

    // Verify Destination exists
    const destinationDoc = await Destination.findById(finalDestId);
    if (!destinationDoc) {
        return res.status(400).json({
            success: false,
            error: "Selected destination does not exist. Please provide a valid destination ID.",
        });
    }

    // Enforce unique slug
    const existingSlug = await Experience.findOne({ slug: finalSlug });
    if (existingSlug) {
        return res.status(409).json({
            success: false,
            error: `An experience with slug '${finalSlug}' already exists. Please choose a unique slug.`,
        });
    }

    let parsedWhatsIncluded = whatsIncluded || inclusions || [];
    if (typeof parsedWhatsIncluded === "string") {
        parsedWhatsIncluded = parsedWhatsIncluded.split("\n").map(s => s.trim()).filter(Boolean);
    }

    const validCategories = [
        "Adventure",
        "Cultural",
        "Food & Drink",
        "Nature",
        "Wellness",
        "Photography",
        "Workshop",
    ];
    const finalCategory = validCategories.includes(category) ? category : "Adventure";

    const newExperience = new Experience({
        title: finalTitle,
        slug: finalSlug,
        destination: finalDestId,
        category: finalCategory,
        shortDescription: (shortDescription || "").trim(),
        longDescription: (longDescription || description || "").trim(),
        coverImage: finalCoverImage,
        galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
        durationHours: finalDurationHours,
        price: {
            basePrice: finalBasePrice,
            currency: (price?.currency || "INR").trim(),
        },
        maxGroupSize: Number(maxGroupSize || 10),
        whatsIncluded: parsedWhatsIncluded,
        meetingPoint: (meetingPoint || "").trim(),
        difficultyLevel: ["Easy", "Moderate", "Challenging"].includes(difficultyLevel)
            ? difficultyLevel
            : "Easy",
        isActive: typeof isActive === "boolean" ? isActive : true,
        createdBy: req.user?._id || null,
    });

    const saved = await newExperience.save();
    await saved.populate("destination", "name slug state country shortTagline heroImage");

    res.status(201).json({
        success: true,
        message: `Experience '${saved.title}' created successfully.`,
        experience: saved,
    });
};

// --------------------------------------------------
// PATCH /api/admin/experiences/:id — Update Experience
// --------------------------------------------------
module.exports.updateExperienceAdmin = async (req, res) => {
    const { id } = req.params;
    const data = req.body.experience || req.body;

    const experience = await Experience.findById(id);
    if (!experience) {
        return res.status(404).json({
            success: false,
            error: "Experience not found.",
        });
    }

    // Slug uniqueness
    if (data.slug) {
        const newSlug = String(data.slug)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-");

        if (newSlug !== experience.slug) {
            const conflict = await Experience.findOne({
                _id: { $ne: id },
                slug: newSlug,
            });
            if (conflict) {
                return res.status(409).json({
                    success: false,
                    error: `An experience with slug '${newSlug}' already exists.`,
                });
            }
            experience.slug = newSlug;
        }
    }

    if (data.destination) {
        const destDoc = await Destination.findById(data.destination);
        if (!destDoc) {
            return res.status(400).json({
                success: false,
                error: "Selected destination does not exist.",
            });
        }
        experience.destination = data.destination;
    }

    if (data.title !== undefined) experience.title = String(data.title).trim();
    if (data.category && ["Adventure", "Cultural", "Food & Drink", "Nature", "Wellness", "Photography", "Workshop"].includes(data.category)) {
        experience.category = data.category;
    }
    if (data.shortDescription !== undefined) experience.shortDescription = String(data.shortDescription).trim();
    if (data.longDescription !== undefined || data.description !== undefined) {
        experience.longDescription = String(data.longDescription || data.description).trim();
    }
    if (data.coverImage !== undefined || data.image !== undefined) {
        const img = data.coverImage || data.image;
        experience.coverImage = typeof img === "string" ? { url: img, filename: "" } : img;
    }
    if (Array.isArray(data.galleryImages)) experience.galleryImages = data.galleryImages;

    if (data.durationHours !== undefined) {
        const dHours = Number(data.durationHours);
        if (!isNaN(dHours) && dHours >= 0.5) experience.durationHours = dHours;
    }

    if (data.price) {
        const bPrice = data.price.basePrice !== undefined ? Number(data.price.basePrice) : (typeof data.price === "number" ? data.price : experience.price.basePrice);
        const curr = data.price.currency || experience.price.currency || "INR";
        experience.price = { basePrice: bPrice, currency: curr };
    }

    if (data.maxGroupSize !== undefined) experience.maxGroupSize = Number(data.maxGroupSize);
    if (data.difficultyLevel && ["Easy", "Moderate", "Challenging"].includes(data.difficultyLevel)) {
        experience.difficultyLevel = data.difficultyLevel;
    }
    if (data.whatsIncluded !== undefined || data.inclusions !== undefined) {
        const inc = data.whatsIncluded !== undefined ? data.whatsIncluded : data.inclusions;
        experience.whatsIncluded = Array.isArray(inc)
            ? inc
            : String(inc).split("\n").map(s => s.trim()).filter(Boolean);
    }
    if (data.meetingPoint !== undefined) experience.meetingPoint = String(data.meetingPoint).trim();
    if (typeof data.isActive === "boolean") experience.isActive = data.isActive;

    const updated = await experience.save();
    await updated.populate("destination", "name slug state country shortTagline heroImage");

    res.json({
        success: true,
        message: `Experience '${updated.title}' updated successfully.`,
        experience: updated,
    });
};

// --------------------------------------------------
// DELETE /api/admin/experiences/:id — Soft-delete (Deactivate)
// --------------------------------------------------
module.exports.deactivateExperienceAdmin = async (req, res) => {
    const { id } = req.params;

    const experience = await Experience.findById(id);
    if (!experience) {
        return res.status(404).json({
            success: false,
            error: "Experience not found.",
        });
    }

    experience.isActive = false;
    await experience.save();

    res.json({
        success: true,
        message: `Experience '${experience.title}' has been deactivated (soft-deleted).`,
        experience,
    });
};

// ==================================================
// TRANSFER & TRANSPORT MANAGEMENT (Phase 6 / Part 6.4)
// ==================================================

// --------------------------------------------------
// GET /api/admin/transfers — List all transfers (including inactive)
// --------------------------------------------------
module.exports.getAllTransfersAdmin = async (req, res) => {
    const transfers = await Transfer.find()
        .populate("destination", "name slug state country shortTagline heroImage")
        .populate("createdBy", "username email")
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: transfers.length,
        transfers,
    });
};

// --------------------------------------------------
// POST /api/admin/transfers — Create Transfer Service
// --------------------------------------------------
module.exports.createTransferAdmin = async (req, res) => {
    const data = req.body.transfer || req.body;
    const {
        title,
        slug,
        destination,
        transferType,
        vehicleType,
        capacity,
        price,
        priceUnit,
        description,
        pickupLocation,
        dropLocation,
        estimatedDuration,
        includedFeatures,
        inclusions,
        coverImage,
        image,
        cancellationPolicy,
        isActive,
    } = data;

    const finalTitle = (title || "").trim();
    let finalSlug = (slug || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-");

    if (!finalSlug && finalTitle) {
        finalSlug = finalTitle
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-");
    }

    const finalDestId = destination;

    let finalCoverImage = coverImage || image;
    if (typeof finalCoverImage === "string") {
        finalCoverImage = { url: finalCoverImage, filename: "" };
    }
    if (!finalCoverImage || !finalCoverImage.url) {
        finalCoverImage = {
            url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80",
            filename: "",
        };
    }

    if (req.files && req.files.length > 0) {
        finalCoverImage = {
            url: req.files[0].path,
            filename: req.files[0].filename,
        };
    }

    // Validation
    if (!finalTitle || !finalSlug || !finalDestId) {
        return res.status(400).json({
            success: false,
            error: "Validation failed: 'title', 'slug', and 'destination' are required.",
        });
    }

    const finalCapacity = Number(capacity || 4);
    if (isNaN(finalCapacity) || finalCapacity < 1) {
        return res.status(400).json({
            success: false,
            error: "Validation failed: 'capacity' must be at least 1 passenger.",
        });
    }

    const finalBasePrice = Number(price?.basePrice ?? price ?? 0);
    if (isNaN(finalBasePrice) || finalBasePrice < 0) {
        return res.status(400).json({
            success: false,
            error: "Validation failed: 'price.basePrice' must be a non-negative number.",
        });
    }

    // Verify Destination exists
    const destinationDoc = await Destination.findById(finalDestId);
    if (!destinationDoc) {
        return res.status(400).json({
            success: false,
            error: "Selected destination does not exist. Please provide a valid destination ID.",
        });
    }

    // Enforce unique slug
    const existingSlug = await Transfer.findOne({ slug: finalSlug });
    if (existingSlug) {
        return res.status(409).json({
            success: false,
            error: `A transfer service with slug '${finalSlug}' already exists. Please choose a unique slug.`,
        });
    }

    let parsedFeatures = includedFeatures || inclusions || [];
    if (typeof parsedFeatures === "string") {
        parsedFeatures = parsedFeatures.split("\n").map(s => s.trim()).filter(Boolean);
    }

    const validTransferTypes = [
        "airport-pickup",
        "airport-drop",
        "intercity",
        "local-day-hire",
        "scenic-drive",
    ];
    const finalTransferType = validTransferTypes.includes(transferType) ? transferType : "airport-pickup";

    const validVehicleTypes = [
        "Sedan",
        "SUV",
        "Luxury SUV",
        "Tempo Traveller",
        "Bike / Cruiser",
    ];
    const finalVehicleType = validVehicleTypes.includes(vehicleType) ? vehicleType : "SUV";

    const validPriceUnits = ["per-trip", "per-day", "per-hour"];
    const finalPriceUnit = validPriceUnits.includes(priceUnit) ? priceUnit : "per-trip";

    const newTransfer = new Transfer({
        title: finalTitle,
        slug: finalSlug,
        destination: finalDestId,
        transferType: finalTransferType,
        vehicleType: finalVehicleType,
        capacity: finalCapacity,
        price: {
            basePrice: finalBasePrice,
            currency: (price?.currency || "INR").trim(),
        },
        priceUnit: finalPriceUnit,
        description: (description || "").trim(),
        pickupLocation: (pickupLocation || "").trim(),
        dropLocation: (dropLocation || "").trim(),
        estimatedDuration: (estimatedDuration || "").trim(),
        includedFeatures: parsedFeatures,
        coverImage: finalCoverImage,
        cancellationPolicy: ["flexible", "moderate", "strict"].includes(cancellationPolicy)
            ? cancellationPolicy
            : "flexible",
        isActive: typeof isActive === "boolean" ? isActive : true,
        createdBy: req.user?._id || null,
    });

    const saved = await newTransfer.save();
    await saved.populate("destination", "name slug state country shortTagline heroImage");

    res.status(201).json({
        success: true,
        message: `Transfer service '${saved.title}' created successfully.`,
        transfer: saved,
    });
};

// --------------------------------------------------
// PATCH /api/admin/transfers/:id — Update Transfer Service
// --------------------------------------------------
module.exports.updateTransferAdmin = async (req, res) => {
    const { id } = req.params;
    const data = req.body.transfer || req.body;

    const transfer = await Transfer.findById(id);
    if (!transfer) {
        return res.status(404).json({
            success: false,
            error: "Transfer service not found.",
        });
    }

    // Slug uniqueness check
    if (data.slug) {
        const newSlug = String(data.slug)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-");

        if (newSlug !== transfer.slug) {
            const conflict = await Transfer.findOne({
                _id: { $ne: id },
                slug: newSlug,
            });
            if (conflict) {
                return res.status(409).json({
                    success: false,
                    error: `A transfer service with slug '${newSlug}' already exists.`,
                });
            }
            transfer.slug = newSlug;
        }
    }

    if (data.destination) {
        const destDoc = await Destination.findById(data.destination);
        if (!destDoc) {
            return res.status(400).json({
                success: false,
                error: "Selected destination does not exist.",
            });
        }
        transfer.destination = data.destination;
    }

    if (data.title !== undefined) transfer.title = String(data.title).trim();
    if (data.transferType && ["airport-pickup", "airport-drop", "intercity", "local-day-hire", "scenic-drive"].includes(data.transferType)) {
        transfer.transferType = data.transferType;
    }
    if (data.vehicleType && ["Sedan", "SUV", "Luxury SUV", "Tempo Traveller", "Bike / Cruiser"].includes(data.vehicleType)) {
        transfer.vehicleType = data.vehicleType;
    }
    if (data.capacity !== undefined) {
        const cap = Number(data.capacity);
        if (!isNaN(cap) && cap >= 1) transfer.capacity = cap;
    }
    if (data.price) {
        const bPrice = data.price.basePrice !== undefined ? Number(data.price.basePrice) : (typeof data.price === "number" ? data.price : transfer.price.basePrice);
        const curr = data.price.currency || transfer.price.currency || "INR";
        transfer.price = { basePrice: bPrice, currency: curr };
    }
    if (data.priceUnit && ["per-trip", "per-day", "per-hour"].includes(data.priceUnit)) {
        transfer.priceUnit = data.priceUnit;
    }
    if (data.description !== undefined) transfer.description = String(data.description).trim();
    if (data.pickupLocation !== undefined) transfer.pickupLocation = String(data.pickupLocation).trim();
    if (data.dropLocation !== undefined) transfer.dropLocation = String(data.dropLocation).trim();
    if (data.estimatedDuration !== undefined) transfer.estimatedDuration = String(data.estimatedDuration).trim();
    if (data.includedFeatures !== undefined || data.inclusions !== undefined) {
        const inc = data.includedFeatures !== undefined ? data.includedFeatures : data.inclusions;
        transfer.includedFeatures = Array.isArray(inc)
            ? inc
            : String(inc).split("\n").map(s => s.trim()).filter(Boolean);
    }
    if (data.coverImage !== undefined || data.image !== undefined) {
        const img = data.coverImage || data.image;
        transfer.coverImage = typeof img === "string" ? { url: img, filename: "" } : img;
    }
    if (data.cancellationPolicy && ["flexible", "moderate", "strict"].includes(data.cancellationPolicy)) {
        transfer.cancellationPolicy = data.cancellationPolicy;
    }
    if (typeof data.isActive === "boolean") transfer.isActive = data.isActive;

    const updated = await transfer.save();
    await updated.populate("destination", "name slug state country shortTagline heroImage");

    res.json({
        success: true,
        message: `Transfer service '${updated.title}' updated successfully.`,
        transfer: updated,
    });
};

// --------------------------------------------------
// DELETE /api/admin/transfers/:id — Soft-delete (Deactivate)
// --------------------------------------------------
module.exports.deactivateTransferAdmin = async (req, res) => {
    const { id } = req.params;

    const transfer = await Transfer.findById(id);
    if (!transfer) {
        return res.status(404).json({
            success: false,
            error: "Transfer service not found.",
        });
    }

    transfer.isActive = false;
    await transfer.save();

    res.json({
        success: true,
        message: `Transfer service '${transfer.title}' has been deactivated (soft-deleted).`,
        transfer,
    });
};



