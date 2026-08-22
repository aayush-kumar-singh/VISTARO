const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isReviewAuthor, isHostOrAdmin, validateObjectId } = require("../middleware/auth.js");
const { validateReview, validateReviewReply } = require("../middleware/validate.js");
const { bookingLimiter, reviewLimiter, replyLimiter } = require("../middleware/rateLimiter.js");
const experienceController = require("../controllers/experienceController.js");
const bookingController = require("../controllers/bookingController.js");
const reviewController = require("../controllers/reviewController.js");

// Public Read-Only Experience Routes
router.get("/", wrapAsync(experienceController.index));
router.get("/:slug", wrapAsync(experienceController.getExperienceBySlug));

// Authenticated Experience Booking Route
router.post(
    "/:id/bookings",
    bookingLimiter,
    isLoggedIn,
    validateObjectId("id"),
    wrapAsync(bookingController.createExperienceBooking)
);

// Authenticated Experience Reviews (Phase 3 / Part 3.8)
router.post(
    "/:id/reviews",
    validateObjectId("id"),
    reviewLimiter,
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createExperienceReview)
);

router.delete(
    "/:id/reviews/:reviewId",
    validateObjectId("id"),
    validateObjectId("reviewId"),
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.deleteExperienceReview)
);

router.post(
    "/:id/reviews/:reviewId/reply",
    validateObjectId("id"),
    validateObjectId("reviewId"),
    replyLimiter,
    isLoggedIn,
    isHostOrAdmin,
    validateReviewReply,
    wrapAsync(reviewController.addExperienceReviewReply)
);

router.delete(
    "/:id/reviews/:reviewId/reply",
    validateObjectId("id"),
    validateObjectId("reviewId"),
    isLoggedIn,
    isHostOrAdmin,
    wrapAsync(reviewController.deleteExperienceReviewReply)
);

module.exports = router;
