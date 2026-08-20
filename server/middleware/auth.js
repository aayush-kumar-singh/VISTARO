const mongoose = require("mongoose");
const Listing = require("../models/Listing.js");
const Review = require("../models/Review.js");
const ExpressError = require("../utils/ExpressError.js");

module.exports.validateObjectId = (paramName = "id") => {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (id && !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: "Invalid resource identifier.",
            });
        }
        next();
    };
};

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false,
            error: "Please log in to continue.",
        });
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) {
            return res.status(404).json({
                success: false,
                error: "Listing not found.",
            });
        }

        if (!listing.owner) {
            return res.status(400).json({
                success: false,
                error: "This listing does not have a valid owner.",
            });
        }

        if (!req.user || !listing.owner.equals(req.user._id)) {
            return res.status(403).json({
                success: false,
                error: "You do not have permission to modify this listing.",
            });
        }

        next();
    } catch (err) {
        next(err);
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                error: "Review not found.",
            });
        }

        if (!review.author) {
            return res.status(400).json({
                success: false,
                error: "This review does not have a valid author.",
            });
        }

        if (!req.user || !review.author.equals(req.user._id)) {
            return res.status(403).json({
                success: false,
                error: "You are not the author of this review.",
            });
        }

        next();
    } catch (err) {
        next(err);
    }
};
