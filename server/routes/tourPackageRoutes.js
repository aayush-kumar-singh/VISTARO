const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isReviewAuthor, isHostOrAdmin, validateObjectId } = require("../middleware/auth.js");
const { validateReview, validateReviewReply } = require("../middleware/validate.js");
const { bookingLimiter, reviewLimiter, replyLimiter } = require("../middleware/rateLimiter.js");
const tourPackageController = require("../controllers/tourPackageController.js");
const bookingController = require("../controllers/bookingController.js");
const reviewController = require("../controllers/reviewController.js");

// Public Read-Only Tour Package Routes
router.get("/", wrapAsync(tourPackageController.index));
router.get("/:slug", wrapAsync(tourPackageController.getTourPackageBySlug));

// Authenticated Tour Package Booking Route
router.post(
    "/:id/bookings",
    bookingLimiter,
    isLoggedIn,
    validateObjectId("id"),
    wrapAsync(bookingController.createPackageBooking)
);

// Authenticated Tour Package Reviews
router.post(
    "/:id/reviews",
    validateObjectId("id"),
    reviewLimiter,
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createPackageReview)
);

router.delete(
    "/:id/reviews/:reviewId",
    validateObjectId("id"),
    validateObjectId("reviewId"),
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.deletePackageReview)
);

router.post(
    "/:id/reviews/:reviewId/reply",
    validateObjectId("id"),
    validateObjectId("reviewId"),
    replyLimiter,
    isLoggedIn,
    isHostOrAdmin,
    validateReviewReply,
    wrapAsync(reviewController.addPackageReviewReply)
);

router.delete(
    "/:id/reviews/:reviewId/reply",
    validateObjectId("id"),
    validateObjectId("reviewId"),
    isLoggedIn,
    isHostOrAdmin,
    wrapAsync(reviewController.deletePackageReviewReply)
);

module.exports = router;
