const mongoose = require("mongoose");
const Experience = require("../models/Experience.js");
const Destination = require("../models/Destination.js");

// --------------------------------------------------
// Get all active experiences (Public list view)
// Supports optional ?destination=<slug_or_id> and ?category=<category>
// --------------------------------------------------
module.exports.index = async (req, res) => {
    const filter = { isActive: true };

    // Optional destination filter (by ID or Slug)
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
                    experiences: [],
                });
            }
            filter.destination = destinationDoc._id;
        }
    }

    // Optional category filter
    if (req.query.category && req.query.category !== "All") {
        filter.category = req.query.category.trim();
    }

    const experiences = await Experience.find(filter)
        .populate("destination", "name slug state country shortTagline heroImage")
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: experiences.length,
        experiences,
    });
};

// --------------------------------------------------
// Get single experience by slug (Full detail view)
// --------------------------------------------------
module.exports.getExperienceBySlug = async (req, res) => {
    const { slug } = req.params;

    if (!slug) {
        return res.status(400).json({
            success: false,
            error: "Slug parameter is required.",
        });
    }

    const experience = await Experience.findOne({
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

    if (!experience) {
        return res.status(404).json({
            success: false,
            error: "Experience not found.",
        });
    }

    res.json({
        success: true,
        experience,
    });
};
