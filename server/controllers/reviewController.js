const Review = require("../models/Review.js");
const Listing = require("../models/Listing.js");

module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        return res.status(404).json({
            success: false,
            error: "Listing not found.",
        });
    }

    // 1. Owner cannot review own listing
    if (listing.owner && listing.owner.equals(req.user._id)) {
        return res.status(400).json({
            success: false,
            error: "Hosts cannot submit reviews for their own listings.",
        });
    }

    // 2. Prevent duplicate reviews by the same user on the same listing
    const existingReview = await Review.findOne({
        _id: { $in: listing.reviews },
        author: req.user._id,
    });

    if (existingReview) {
        return res.status(400).json({
            success: false,
            error: "You have already submitted a review for this property.",
        });
    }

    const reviewData = req.validatedReview || req.body.review || req.body;
    const newReview = new Review(reviewData);
    newReview.author = req.user._id;

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    await newReview.populate("author", "username email");

    res.status(201).json({
        success: true,
        message: "Review created successfully.",
        review: newReview,
    });
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
        return res.status(404).json({
            success: false,
            error: "Listing not found.",
        });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({
            success: false,
            error: "Review not found.",
        });
    }

    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId },
    });

    await Review.findByIdAndDelete(reviewId);

    res.json({
        success: true,
        message: "Review deleted successfully.",
    });
};

module.exports.addReviewReply = async (req, res) => {
    const { id, reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({
            success: false,
            error: "Review not found.",
        });
    }

    const replyData = req.validatedReply || req.body.reply || req.body;
    review.ownerReply = {
        comment: replyData.comment,
        createdAt: new Date(),
    };

    await review.save();

    res.json({
        success: true,
        message: "Host response posted successfully.",
        ownerReply: review.ownerReply,
    });
};

module.exports.deleteReviewReply = async (req, res) => {
    const { id, reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({
            success: false,
            error: "Review not found.",
        });
    }

    review.ownerReply = undefined;
    await review.save();

    res.json({
        success: true,
        message: "Host response removed successfully.",
    });
};
