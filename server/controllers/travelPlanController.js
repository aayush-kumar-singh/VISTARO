const mongoose = require("mongoose");
const TravelPlan = require("../models/TravelPlan.js");
const Destination = require("../models/Destination.js");
const Listing = require("../models/Listing.js");
const TourPackage = require("../models/TourPackage.js");
const Experience = require("../models/Experience.js");
const Transfer = require("../models/Transfer.js");

// 1. Create a new Travel Plan (Owner is always req.user._id)
module.exports.createPlan = async (req, res) => {
    const { title, destination, startDate, endDate } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
            success: false,
            error: "Please provide a valid title for your travel plan.",
        });
    }

    let destinationId = null;
    if (destination) {
        if (!mongoose.Types.ObjectId.isValid(destination)) {
            return res.status(400).json({
                success: false,
                error: "Invalid destination identifier provided.",
            });
        }
        const destExists = await Destination.findById(destination);
        if (!destExists) {
            return res.status(404).json({
                success: false,
                error: "Selected destination not found.",
            });
        }
        destinationId = destination;
    }

    let start = null;
    let end = null;
    if (startDate) {
        start = new Date(startDate);
        if (isNaN(start.getTime())) {
            return res.status(400).json({
                success: false,
                error: "Invalid start date format.",
            });
        }
    }
    if (endDate) {
        end = new Date(endDate);
        if (isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                error: "Invalid end date format.",
            });
        }
    }

    if (start && end && start > end) {
        return res.status(400).json({
            success: false,
            error: "Start date cannot be after end date.",
        });
    }

    const plan = new TravelPlan({
        title: title.trim(),
        owner: req.user._id,
        destination: destinationId,
        startDate: start,
        endDate: end,
        items: [],
        isArchived: false,
    });

    await plan.save();
    await plan.populate("destination", "name slug state country heroImage image");

    res.status(201).json({
        success: true,
        message: "Travel plan created successfully.",
        plan,
    });
};

// 2. List the logged-in user's travel plans only
module.exports.getUserPlans = async (req, res) => {
    const includeArchived = req.query.archived === "true" || req.query.all === "true";

    const filter = {
        owner: req.user._id,
    };

    if (!includeArchived) {
        filter.isArchived = false;
    }

    const plans = await TravelPlan.find(filter)
        .populate("destination", "name slug state country heroImage image")
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: plans.length,
        plans,
    });
};

// 3. Get single travel plan by ID (Strict ownership enforced, 404 if not found/not owned)
module.exports.getPlanById = async (req, res) => {
    const { id } = req.params;

    const plan = await TravelPlan.findById(id)
        .populate("owner", "username email")
        .populate("destination", "name slug state country heroImage image")
        .populate("items.itemId");

    if (!plan || plan.owner._id.toString() !== req.user._id.toString()) {
        return res.status(404).json({
            success: false,
            error: "Travel plan not found.",
        });
    }

    res.json({
        success: true,
        plan,
    });
};

// 4. Update travel plan details (Owner only)
module.exports.updatePlan = async (req, res) => {
    const { id } = req.params;
    const { title, destination, startDate, endDate, isArchived } = req.body;

    const plan = await TravelPlan.findById(id);

    if (!plan || plan.owner.toString() !== req.user._id.toString()) {
        return res.status(404).json({
            success: false,
            error: "Travel plan not found.",
        });
    }

    if (title !== undefined) {
        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                success: false,
                error: "Plan title cannot be empty.",
            });
        }
        plan.title = title.trim();
    }

    if (destination !== undefined) {
        if (destination === null || destination === "") {
            plan.destination = null;
        } else {
            if (!mongoose.Types.ObjectId.isValid(destination)) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid destination identifier provided.",
                });
            }
            const destExists = await Destination.findById(destination);
            if (!destExists) {
                return res.status(404).json({
                    success: false,
                    error: "Selected destination not found.",
                });
            }
            plan.destination = destination;
        }
    }

    if (startDate !== undefined) {
        if (!startDate) {
            plan.startDate = null;
        } else {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid start date format.",
                });
            }
            plan.startDate = start;
        }
    }

    if (endDate !== undefined) {
        if (!endDate) {
            plan.endDate = null;
        } else {
            const end = new Date(endDate);
            if (isNaN(end.getTime())) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid end date format.",
                });
            }
            plan.endDate = end;
        }
    }

    if (plan.startDate && plan.endDate && plan.startDate > plan.endDate) {
        return res.status(400).json({
            success: false,
            error: "Start date cannot be after end date.",
        });
    }

    if (isArchived !== undefined) {
        plan.isArchived = Boolean(isArchived);
    }

    await plan.save();
    await plan.populate("destination", "name slug state country heroImage image");
    await plan.populate("items.itemId");

    res.json({
        success: true,
        message: "Travel plan updated successfully.",
        plan,
    });
};

// 5. Delete or archive travel plan (Owner only)
module.exports.deletePlan = async (req, res) => {
    const { id } = req.params;
    const isPermanent = req.query.permanent === "true";

    const plan = await TravelPlan.findById(id);

    if (!plan || plan.owner.toString() !== req.user._id.toString()) {
        return res.status(404).json({
            success: false,
            error: "Travel plan not found.",
        });
    }

    if (isPermanent) {
        await TravelPlan.findByIdAndDelete(id);
        return res.json({
            success: true,
            message: "Travel plan permanently deleted.",
        });
    }

    // Default: Soft archive
    plan.isArchived = true;
    await plan.save();

    res.json({
        success: true,
        message: "Travel plan archived successfully.",
    });
};

// 6. Add Item (Listing, TourPackage, Experience) to Travel Plan (Owner only)
module.exports.addItemToPlan = async (req, res) => {
    const { id } = req.params;
    const { itemType, itemId, notes } = req.body;

    // Validate itemType
    const allowedTypes = ["listing", "tourPackage", "experience", "transfer"];
    if (!itemType || !allowedTypes.includes(itemType)) {
        return res.status(400).json({
            success: false,
            error: "Invalid item type. Must be 'listing', 'tourPackage', 'experience', or 'transfer'.",
        });
    }

    // Validate itemId
    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({
            success: false,
            error: "Invalid item identifier.",
        });
    }

    // Find and verify plan ownership
    const plan = await TravelPlan.findById(id);
    if (!plan || plan.owner.toString() !== req.user._id.toString()) {
        return res.status(404).json({
            success: false,
            error: "Travel plan not found.",
        });
    }

    // Verify item existence in corresponding collection
    let existingItem = null;
    if (itemType === "listing") {
        existingItem = await Listing.findById(itemId);
    } else if (itemType === "tourPackage") {
        existingItem = await TourPackage.findById(itemId);
    } else if (itemType === "experience") {
        existingItem = await Experience.findById(itemId);
    } else if (itemType === "transfer") {
        existingItem = await Transfer.findById(itemId);
    }

    if (!existingItem) {
        return res.status(404).json({
            success: false,
            error: `The specified ${itemType} item could not be found.`,
        });
    }

    // Duplicate check
    const isDuplicate = plan.items.some(
        (it) => it.itemType === itemType && it.itemId.toString() === itemId.toString()
    );
    if (isDuplicate) {
        return res.status(400).json({
            success: false,
            error: `This ${itemType === "tourPackage" ? "tour package" : itemType} is already in your travel plan.`,
        });
    }

    // Push new item
    plan.items.push({
        itemType,
        itemId,
        notes: (notes || "").trim(),
        addedAt: new Date(),
    });

    await plan.save();
    await plan.populate("items.itemId");
    await plan.populate("destination", "name slug state country heroImage image");

    res.status(201).json({
        success: true,
        message: `Added "${existingItem.title}" to your travel plan!`,
        plan,
    });
};

// 7. Remove an Item from a Travel Plan (Owner only)
module.exports.removeItemFromPlan = async (req, res) => {
    const { id, itemSubDocId } = req.params;

    if (!itemSubDocId || !mongoose.Types.ObjectId.isValid(itemSubDocId)) {
        return res.status(400).json({
            success: false,
            error: "Invalid item sub-document identifier.",
        });
    }

    const plan = await TravelPlan.findById(id);
    if (!plan || plan.owner.toString() !== req.user._id.toString()) {
        return res.status(404).json({
            success: false,
            error: "Travel plan not found.",
        });
    }

    const itemIndex = plan.items.findIndex(
        (it) => it._id.toString() === itemSubDocId.toString()
    );

    if (itemIndex === -1) {
        return res.status(404).json({
            success: false,
            error: "Item not found in this travel plan.",
        });
    }

    plan.items.splice(itemIndex, 1);
    await plan.save();
    await plan.populate("items.itemId");
    await plan.populate("destination", "name slug state country heroImage image");

    res.json({
        success: true,
        message: "Item removed from travel plan.",
        plan,
    });
};
