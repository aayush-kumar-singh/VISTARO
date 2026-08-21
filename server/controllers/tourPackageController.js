const mongoose = require("mongoose");
const TourPackage = require("../models/TourPackage.js");
const Destination = require("../models/Destination.js");

// --------------------------------------------------
// Get all active tour packages (Public list view)
// Supports optional ?destination=<slug_or_id> query
// --------------------------------------------------
module.exports.index = async (req, res) => {
    const filter = { isActive: true };

    // Optional destination filter
    if (req.query.destination) {
        const destQuery = req.query.destination.trim();

        if (mongoose.Types.ObjectId.isValid(destQuery)) {
            filter.destination = destQuery;
        } else {
            // Treat as slug
            const destinationDoc = await Destination.findOne({
                slug: destQuery.toLowerCase(),
            });

            if (!destinationDoc) {
                // Destination does not exist -> return empty results cleanly
                return res.json({
                    success: true,
                    count: 0,
                    tourPackages: [],
                });
            }
            filter.destination = destinationDoc._id;
        }
    }

    const tourPackages = await TourPackage.find(filter)
        .populate("destination", "name slug state country shortTagline heroImage")
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: tourPackages.length,
        tourPackages,
    });
};

// --------------------------------------------------
// Get single tour package by slug (Full detail view)
// --------------------------------------------------
module.exports.getTourPackageBySlug = async (req, res) => {
    const { slug } = req.params;

    if (!slug) {
        return res.status(400).json({
            success: false,
            error: "Slug parameter is required.",
        });
    }

    const tourPackage = await TourPackage.findOne({
        slug: slug.toLowerCase().trim(),
        isActive: true,
    })
        .populate(
            "destination",
            "name slug state country shortTagline longDescription heroImage galleryImages coordinates"
        )
        .populate("createdBy", "username email")
        .populate({
            path: "reviews",
            populate: { path: "author", select: "username email" },
        });

    if (!tourPackage) {
        return res.status(404).json({
            success: false,
            error: "Tour package not found.",
        });
    }

    res.json({
        success: true,
        tourPackage,
    });
};
