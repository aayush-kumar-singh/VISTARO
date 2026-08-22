const mongoose = require("mongoose");
const Transfer = require("../models/Transfer.js");
const Destination = require("../models/Destination.js");

// --------------------------------------------------
// GET /api/transfers — List all active transfer services
// Supports optional ?destination=<slug_or_id>, ?transferType=<type>, ?vehicleType=<type>
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
                    transfers: [],
                });
            }
            filter.destination = destinationDoc._id;
        }
    }

    // Optional transferType filter
    if (req.query.transferType && req.query.transferType !== "all" && req.query.transferType !== "All") {
        filter.transferType = req.query.transferType.trim();
    }

    // Optional vehicleType filter
    if (req.query.vehicleType && req.query.vehicleType !== "all" && req.query.vehicleType !== "All") {
        filter.vehicleType = req.query.vehicleType.trim();
    }

    const transfers = await Transfer.find(filter)
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
// GET /api/transfers/:id (or :slug) — Single transfer service detail
// --------------------------------------------------
module.exports.getTransferById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            error: "Transfer ID or slug is required.",
        });
    }

    let transfer = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
        transfer = await Transfer.findOne({
            _id: id,
            isActive: true,
        })
            .populate(
                "destination",
                "name slug state country shortTagline longDescription heroImage galleryImages coordinates"
            )
            .populate("createdBy", "username email");
    }

    if (!transfer) {
        // Attempt lookup by slug
        transfer = await Transfer.findOne({
            slug: id.toLowerCase().trim(),
            isActive: true,
        })
            .populate(
                "destination",
                "name slug state country shortTagline longDescription heroImage galleryImages coordinates"
            )
            .populate("createdBy", "username email");
    }

    if (!transfer) {
        return res.status(404).json({
            success: false,
            error: "Transfer service not found.",
        });
    }

    res.json({
        success: true,
        transfer,
    });
};
