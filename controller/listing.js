const listings = require("../models/listing");
const User = require("../models/user.js");
const Booking = require("../models/booking.js");
const { cloudinary } = require("../cloudConfig.js");


// --------------------------------------------------
// Show all listings
// --------------------------------------------------

module.exports.index = async (req, res) => {
    const { minPrice, maxPrice, category, sort, page } = req.query;
    const filter = {};

    if (category) {
        filter.category = category;
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

    const limit = 9; // 9 items per page (3x3 grid)
    const totalListings = await listings.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(totalListings / limit));
    const requestedPage = parseInt(page, 10) || 1;
    const currentPage = Math.max(1, Math.min(requestedPage, totalPages));
    const skip = (currentPage - 1) * limit;

    const allListing = await listings
        .find(filter)
        .populate("reviews")
        .sort(sortQuery)
        .skip(skip)
        .limit(limit);

    let recentlyViewed = [];
    if (req.user) {
        try {
            const userDoc = await User.findById(req.user._id).populate({
                path: "recentlyViewed",
                populate: { path: "reviews" }
            });
            if (userDoc && userDoc.recentlyViewed) {
                recentlyViewed = userDoc.recentlyViewed.filter(Boolean);
            }
        } catch (e) {
            console.error("Error fetching recently viewed listings:", e);
        }
    }

    res.render("listings/index.ejs", {
        allListing,
        recentlyViewed,
        minPrice: minPrice || "",
        maxPrice: maxPrice || "",
        selectedCategory: category || "",
        sortOption: sort || "",
        currentPage,
        totalPages,
        totalListings,
    });
};


// --------------------------------------------------
// Render new listing form
// --------------------------------------------------

module.exports.rendernewForm = async (req, res) => {
    res.render("listings/form.ejs");
};


// --------------------------------------------------
// Show individual listing
// --------------------------------------------------

module.exports.showsallListings = async (req, res) => {
    const { id } = req.params;

    const listing = await listings
        .findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!listing) {
        req.flash(
            "error",
            "Listing you are requesting does not exist"
        );

        return res.redirect("/listings");
    }

    // Update logged-in user's recently viewed list (max 10, most recent first)
    if (req.user) {
        try {
            await User.findByIdAndUpdate(req.user._id, {
                $pull: { recentlyViewed: listing._id }
            });
            await User.findByIdAndUpdate(req.user._id, {
                $push: {
                    recentlyViewed: {
                        $each: [listing._id],
                        $position: 0,
                        $slice: 10
                    }
                }
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

    res.render("listings/show.ejs", {
        listing,
        activeBookings,
    });
};


// --------------------------------------------------
// Render edit listing form
// --------------------------------------------------

module.exports.rendereditForm = async (req, res) => {
    const { id } = req.params;

    const listing = await listings.findById(id);

    if (!listing) {
        req.flash(
            "error",
            "Listing you are requesting does not exist"
        );

        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image?.url || "";

    if (originalImageUrl) {
        originalImageUrl = originalImageUrl.replace(
            "/upload",
            "/upload/w_150,h_100"
        );
    }

    res.render("listings/edit.ejs", {
        listing,
        originalImageUrl,
    });
};


// --------------------------------------------------
// Update listing
// --------------------------------------------------

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    if (req.body.listing.amenities) {
        if (!Array.isArray(req.body.listing.amenities)) {
            req.body.listing.amenities = [req.body.listing.amenities];
        }
    } else {
        req.body.listing.amenities = [];
    }

    const listing = await listings.findByIdAndUpdate(
        id,
        {
            ...req.body.listing,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!listing) {
        req.flash(
            "error",
            "Listing you are requesting does not exist"
        );

        return res.redirect("/listings");
    }

    // If location or country changed, update coordinates
    if (req.body.listing.location && req.body.listing.country && process.env.GEOAPIFY_API_KEY) {
        try {
            const searchLocation = `${req.body.listing.location}, ${req.body.listing.country}`;
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

    // If new images were uploaded
    if (req.files && req.files.length > 0) {
        const uploadedImages = req.files.map((file) => ({
            url: file.path,
            filename: file.filename,
        }));

        listing.images = [...(listing.images || []), ...uploadedImages];
        listing.image = listing.images[0];
    }

    await listing.save();

    req.flash(
        "success",
        "Listing updated successfully"
    );

    res.redirect(`/listings/${listing._id}`);
};


// --------------------------------------------------
// Delete listing
// --------------------------------------------------

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;

    const listing = await listings.findByIdAndDelete(id);

    if (!listing) {
        req.flash(
            "error",
            "Listing you are requesting does not exist"
        );

        return res.redirect("/listings");
    }

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

    req.flash(
        "success",
        "Listing deleted successfully"
    );

    res.redirect("/listings");
};


// --------------------------------------------------
// Create listing
// --------------------------------------------------

module.exports.createListing = async (req, res, next) => {
    try {
        const {
            location,
            country,
        } = req.body.listing;

        // Make sure at least one image was uploaded
        if (!req.files || req.files.length === 0) {
            req.flash(
                "error",
                "Please upload at least one image for the listing."
            );

            return res.redirect("/listings/new");
        }

        // --------------------------------------------------
        // Geoapify Geocoding
        // --------------------------------------------------

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

        if (!response.ok) {
            throw new Error(
                `Geoapify request failed with status ${response.status}`
            );
        }

        const data = await response.json();

        if (
            !data.features ||
            data.features.length === 0
        ) {
            req.flash(
                "error",
                "Location could not be found. Please enter a valid location."
            );

            return res.redirect("/listings/new");
        }

        const geometry = data.features[0].geometry;

        // Make sure Geoapify returned a Point
        if (
            !geometry ||
            geometry.type !== "Point" ||
            !Array.isArray(geometry.coordinates) ||
            geometry.coordinates.length !== 2
        ) {
            throw new Error(
                "Geoapify returned invalid location coordinates."
            );
        }

        // --------------------------------------------------
        // Create listing
        // --------------------------------------------------

        if (req.body.listing.amenities) {
            if (!Array.isArray(req.body.listing.amenities)) {
                req.body.listing.amenities = [req.body.listing.amenities];
            }
        } else {
            req.body.listing.amenities = [];
        }

        const Listing = new listings(req.body.listing);

        Listing.owner = req.user._id;

        Listing.images = req.files.map((file) => ({
            url: file.path,
            filename: file.filename,
        }));

        Listing.image = Listing.images[0];

        Listing.geometry = geometry;

        const savedListing = await Listing.save();

        console.log(
            "Listing created:",
            savedListing._id
        );

        req.flash(
            "success",
            "New listing successfully created"
        );

        res.redirect("/listings");

    } catch (err) {
        next(err);
    }
};