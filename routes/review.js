const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const rateLimit = require("express-rate-limit");

const { reviewSchema } = require("../schema.js");
const {
    isLoggedIn,
    isOwner,
    isReviewauthor,
    validateObjectId,
    validateReviewReply,
} = require("../middleware.js");

const ReviewController = require("../controller/reviews.js");

// S5: Rate limit review submissions — max 5 per 10 min per IP
const reviewLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        req.flash("error", "You are submitting reviews too quickly. Please wait a few minutes.");
        res.redirect("back");
    },
});

// S5: Rate limit host reply submissions — max 10 per 10 min per IP
const replyLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        req.flash("error", "Too many replies submitted. Please wait a few minutes.");
        res.redirect("back");
    },
});


// Server-side review validation
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const errMsg = error.details
            .map((el) => el.message)
            .join(",");

        return next(new ExpressError(400, errMsg));
    }

    next();
};


// Create review
router.post(
    "/reviews",
    reviewLimiter,
    isLoggedIn,
    validateReview,
    wrapAsync(ReviewController.createReview)
);


// Delete review
router.delete(
    "/reviews/:reviewId",
    validateObjectId("reviewId"),
    isLoggedIn,
    isReviewauthor,
    wrapAsync(ReviewController.deleteReview)
);


// Submit Host Reply to Review (Owner only)
router.post(
    "/reviews/:reviewId/reply",
    validateObjectId("reviewId"),
    replyLimiter,
    isLoggedIn,
    isOwner,
    validateReviewReply,
    wrapAsync(ReviewController.addReviewReply)
);


// Delete Host Reply (Owner only)
router.delete(
    "/reviews/:reviewId/reply",
    validateObjectId("reviewId"),
    isLoggedIn,
    isOwner,
    wrapAsync(ReviewController.deleteReviewReply)
);


module.exports = router;