const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, isReviewAuthor, validateObjectId } = require("../middleware/auth.js");
const { validateReview, validateReviewReply } = require("../middleware/validate.js");
const { reviewLimiter, replyLimiter } = require("../middleware/rateLimiter.js");
const reviewController = require("../controllers/reviewController.js");

// Create review on listing
router.post(
    "/",
    validateObjectId("id"),
    reviewLimiter,
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createReview)
);

// Delete review
router.delete(
    "/:reviewId",
    validateObjectId("id"),
    validateObjectId("reviewId"),
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.deleteReview)
);

// Post host reply
router.post(
    "/:reviewId/reply",
    validateObjectId("id"),
    validateObjectId("reviewId"),
    replyLimiter,
    isLoggedIn,
    isOwner,
    validateReviewReply,
    wrapAsync(reviewController.addReviewReply)
);

// Delete host reply
router.delete(
    "/:reviewId/reply",
    validateObjectId("id"),
    validateObjectId("reviewId"),
    isLoggedIn,
    isOwner,
    wrapAsync(reviewController.deleteReviewReply)
);

module.exports = router;
