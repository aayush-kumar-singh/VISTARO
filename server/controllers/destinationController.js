const Destination = require("../models/Destination.js");

// --------------------------------------------------
// Get all active destinations (Lightweight payload, sorted alphabetically)
// --------------------------------------------------
module.exports.index = async (req, res) => {
    const filter = { isActive: true };

    if (req.query.featured === "true" || req.query.isFeatured === "true") {
        filter.isFeatured = true;
    }
    if (req.query.trending === "true" || req.query.isTrending === "true") {
        filter.isTrending = true;
    }

    let query = Destination.find(filter)
        .select("name slug state country shortTagline heroImage bestFor identityTags coordinates isFeatured isTrending createdAt")
        .sort({ name: 1 });

    if (req.query.limit && !isNaN(Number(req.query.limit))) {
        query = query.limit(Number(req.query.limit));
    }

    const destinations = await query.lean();

    res.json({
        success: true,
        count: destinations.length,
        destinations,
    });
};

// --------------------------------------------------
// Get single destination by slug (Full detail payload)
// --------------------------------------------------
module.exports.getDestinationBySlug = async (req, res) => {
    const { slug } = req.params;

    if (!slug) {
        return res.status(400).json({
            success: false,
            error: "Slug parameter is required.",
        });
    }

    const destination = await Destination.findOne({
        slug: slug.toLowerCase().trim(),
        isActive: true,
    }).lean();

    if (!destination) {
        return res.status(404).json({
            success: false,
            error: "Destination not found.",
        });
    }

    res.json({
        success: true,
        destination,
    });
};
