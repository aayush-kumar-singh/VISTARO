const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const { reviewSchema } = require("../schema.js");
const {
    isLoggedIn,
    isOwner,
    isReviewauthor,
    validateObjectId,
    validateReviewReply,
} = require("../middleware.js");

const ReviewController = require("../controller/reviews.js");


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