const Listing = require("../models/Listing.js");
const User = require("../models/User.js");
const Booking = require("../models/Booking.js");
const { cloudinary } = require("../config/cloudinary.js");

// --------------------------------------------------
// Get all listings (paginated + filtered)
// --------------------------------------------------
module.exports.index = async (req, res) => {
    const { minPrice, maxPrice, category, destination, sort, page, limit: queryLimit } = req.query;
    const filter = {};

    if (category && category !== "All") {
        filter.category = category;
    }

    if (destination) {
        filter.destination = destination;
    }

    if (req.query.featured === "true" || req.query.isFeatured === "true") {
        filter.isFeatured = true;
    }

    if (req.query.trending === "true" || req.query.isTrending === "true") {
        filter.isTrending = true;
    }

    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice && !isNaN(Number(minPrice))) {
            filter.price.$gte = Number(minPrice);
        }
        if (maxPrice && !isNaN(Number(maxPrice))) {
            filter.price.$lte = Number(maxPrice);
        }
    }

    let sortQuery = { _id: -1 };
    if (sort === "price_asc") {
        sortQuery = { price: 1 };
    } else if (sort === "price_desc") {
        sortQuery = { price: -1 };
    } else if (sort === "newest") {
        sortQuery = { _id: -1 };
    }

    const limit = parseInt(queryLimit, 10) || 12; // 12 items per page default for responsive grid
    const totalListings = await Listing.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(totalListings / limit));
    const requestedPage = parseInt(page, 10) || 1;
    const currentPage = Math.max(1, Math.min(requestedPage, totalPages));
    const skip = (currentPage - 1) * limit;

    const listings = await Listing.find(filter)
        .populate("reviews")
        .populate("destination", "name slug state country shortTagline heroImage")
        .sort(sortQuery)
        .skip(skip)
        .limit(limit);

    let recentlyViewed = [];
    if (req.user) {
        try {
            const userDoc = await User.findById(req.user._id).populate({
                path: "recentlyViewed",
                populate: { path: "reviews" },
            });
            if (userDoc && userDoc.recentlyViewed) {
                recentlyViewed = userDoc.recentlyViewed.filter(Boolean).slice(0, 5);
            }
        } catch (e) {
            console.error("Error fetching recently viewed listings:", e);
        }
    }

    res.json({
        success: true,
        listings,
        recentlyViewed,
        pagination: {
            currentPage,
            totalPages,
            totalListings,
            limit,
        },
    });
};

// --------------------------------------------------
// Get single listing by ID
// --------------------------------------------------
module.exports.getListingById = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
                select: "username email createdAt",
            },
        })
        .populate("owner", "username email createdAt")
        .populate("destination", "name slug state country shortTagline heroImage");

    if (!listing) {
        return res.status(404).json({
            success: false,
            error: "Listing not found.",
        });
    }

    // Update logged-in user's recently viewed list (max 5, most recent first)
    if (req.user) {
        try {
            await User.findByIdAndUpdate(req.user._id, {
                $pull: { recentlyViewed: listing._id },
            });
            await User.findByIdAndUpdate(req.user._id, {
                $push: {
                    recentlyViewed: {
                        $each: [listing._id],
                        $position: 0,
                        $slice: 5,
                    },
                },
            });
        } catch (historyErr) {
            console.error("Error updating recently viewed history:", historyErr);
        }
    }

    const activeBookings = await Booking.find({
        listing: id,
        status: "confirmed",
        checkOut: { $gte: new Date() },
    }).select("checkIn checkOut");

    // Similar listings (same category, exclude current, limit 4)
    const similarFilter = { _id: { $ne: listing._id } };
    if (listing.category) similarFilter.category = listing.category;
    const similarListings = await Listing.find(similarFilter)
        .select("title location country price images image category reviews")
        .populate("reviews", "rating")
        .limit(4)
        .lean();

    res.json({
        success: true,
        listing,
        activeBookings,
        similarListings,
    });
};

// --------------------------------------------------
// Create new listing
// --------------------------------------------------
module.exports.createListing = async (req, res, next) => {
    try {
        const listingData = req.validatedListing || req.body.listing || req.body;
        const { location, country } = listingData;

        // Ensure photos were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Please upload at least one photo for the listing.",
            });
        }

        // Geoapify Geocoding
        let geometry = { type: "Point", coordinates: [0, 0] };
        if (process.env.GEOAPIFY_API_KEY) {
            const searchLocation = `${location}, ${country}`;
            const geoapifyUrl =
                "https://api.geoapify.com/v1/geocode/search?" +
                new URLSearchParams({
                    text: searchLocation,
                    limit: "1",
                    format: "geojson",
                    apiKey: process.env.GEOAPIFY_API_KEY,
                });

            const response = await fetch(geoapifyUrl);
            if (response.ok) {
                const data = await response.json();
                if (data.features && data.features.length > 0) {
                    geometry = data.features[0].geometry;
                }
            }
        }

        // Parse amenities
        let amenities = listingData.amenities || [];
        if (typeof amenities === "string") {
            try {
                amenities = JSON.parse(amenities);
            } catch (e) {
                amenities = amenities.split(",").map((a) => a.trim()).filter(Boolean);
            }
        }

        const destinationId = (listingData.destination && listingData.destination !== "none" && listingData.destination !== "")
            ? listingData.destination
            : null;

        const newListing = new Listing({
            ...listingData,
            destination: destinationId,
            amenities,
            owner: req.user._id,
            geometry,
            images: req.files.map((file) => ({
                url: file.path,
                filename: file.filename,
            })),
        });

        newListing.image = newListing.images[0];
        const savedListing = await newListing.save();

        res.status(201).json({
            success: true,
            message: "New listing successfully created.",
            listing: savedListing,
        });
    } catch (err) {
        next(err);
    }
};

// --------------------------------------------------
// Update listing
// --------------------------------------------------
module.exports.updateListing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listingData = req.validatedListing || req.body.listing || req.body;

        let amenities = listingData.amenities;
        if (amenities) {
            if (typeof amenities === "string") {
                try {
                    amenities = JSON.parse(amenities);
                } catch (e) {
                    amenities = amenities.split(",").map((a) => a.trim()).filter(Boolean);
                }
            }
        }

        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).json({
                success: false,
                error: "Listing not found.",
            });
        }

        // Handle destination assignment
        let destinationId = listing.destination;
        if (listingData.destination !== undefined) {
            destinationId = (listingData.destination && listingData.destination !== "none" && listingData.destination !== "")
                ? listingData.destination
                : null;
        }

        // Update scalar fields
        Object.assign(listing, {
            ...listingData,
            destination: destinationId,
            amenities: amenities || listing.amenities,
        });

        // Geocoding update if location/country changed
        if (listingData.location && listingData.country && process.env.GEOAPIFY_API_KEY) {
            try {
                const searchLocation = `${listingData.location}, ${listingData.country}`;
                const geoapifyUrl =
                    "https://api.geoapify.com/v1/geocode/search?" +
                    new URLSearchParams({
                        text: searchLocation,
                        limit: "1",
                        format: "geojson",
                        apiKey: process.env.GEOAPIFY_API_KEY,
                    });

                const geoRes = await fetch(geoapifyUrl);
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData.features && geoData.features.length > 0) {
                        listing.geometry = geoData.features[0].geometry;
                    }
                }
            } catch (geoErr) {
                console.error("Geocoding update failed:", geoErr);
            }
        }

        // Handle image deletions
        let deleteImages = req.body.deleteImages;
        if (deleteImages) {
            if (typeof deleteImages === "string") {
                try {
                    deleteImages = JSON.parse(deleteImages);
                } catch (e) {
                    deleteImages = [deleteImages];
                }
            }
            if (!Array.isArray(deleteImages)) {
                deleteImages = [deleteImages];
            }

            for (const filename of deleteImages) {
                if (filename && filename !== "listingimage") {
                    try {
                        await cloudinary.uploader.destroy(filename);
                    } catch (delErr) {
                        console.error("Failed to delete image from Cloudinary:", filename, delErr);
                    }
                }
            }

            listing.images = (listing.images || []).filter(
                (img) => !deleteImages.includes(img.filename)
            );
        }

        // Handle newly uploaded images (max 5 total)
        if (req.files && req.files.length > 0) {
            const uploadedImages = req.files.map((file) => ({
                url: file.path,
                filename: file.filename,
            }));
            const combined = [...(listing.images || []), ...uploadedImages];
            listing.images = combined.slice(0, 5);
        }

        if (!listing.images || listing.images.length === 0) {
            return res.status(400).json({
                success: false,
                error: "A property listing must have at least one photo. Please upload a new image before deleting existing photos.",
            });
        }

        listing.image = listing.images[0];

        await listing.save();

        res.json({
            success: true,
            message: "Listing updated successfully.",
            listing,
        });
    } catch (err) {
        next(err);
    }
};

// --------------------------------------------------
// Delete listing
// --------------------------------------------------
module.exports.destroyListing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findByIdAndDelete(id);

        if (!listing) {
            return res.status(404).json({
                success: false,
                error: "Listing not found.",
            });
        }

        // Clean up Cloudinary images
        if (listing.images && listing.images.length > 0) {
            for (const img of listing.images) {
                if (img.filename && img.filename !== "listingimage") {
                    try {
                        await cloudinary.uploader.destroy(img.filename);
                    } catch (err) {
                        console.error("Failed to delete Cloudinary image on listing delete:", err);
                    }
                }
            }
        } else if (listing.image?.filename && listing.image.filename !== "listingimage") {
            try {
                await cloudinary.uploader.destroy(listing.image.filename);
            } catch (err) {
                console.error("Failed to delete Cloudinary image on listing delete:", err);
            }
        }

        res.json({
            success: true,
            message: "Listing deleted successfully.",
        });
    } catch (err) {
        next(err);
    }
};
