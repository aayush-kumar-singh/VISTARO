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

// ==================================================
// TOUR PACKAGE REVIEWS (Phase 2 / Part 2.9)
// ==================================================

const TourPackage = require("../models/TourPackage.js");
const Booking = require("../models/Booking.js");

module.exports.createPackageReview = async (req, res) => {
    const { id } = req.params;
    const tourPackage = await TourPackage.findById(id);

    if (!tourPackage || !tourPackage.isActive) {
        return res.status(404).json({
            success: false,
            error: "Tour package not found or is inactive.",
        });
    }

    // 1. Authorization Guard: Only users who booked this package can review
    const userBooking = await Booking.findOne({
        user: req.user._id,
        tourPackage: tourPackage._id,
        status: "confirmed",
    });

    if (!userBooking) {
        return res.status(403).json({
            success: false,
            error: "Only verified explorers who have a confirmed booking for this package can submit a review.",
        });
    }

    // 2. Duplicate Prevention: User can only review a package once
    const existingReview = await Review.findOne({
        _id: { $in: tourPackage.reviews },
        author: req.user._id,
    });

    if (existingReview) {
        return res.status(400).json({
            success: false,
            error: "You have already submitted a review for this tour package.",
        });
    }

    const reviewData = req.validatedReview || req.body.review || req.body;
    const newReview = new Review({
        comment: reviewData.comment,
        rating: reviewData.rating,
        author: req.user._id,
        targetType: "package",
        tourPackage: tourPackage._id,
        booking: userBooking._id,
    });

    await newReview.save();
    tourPackage.reviews.push(newReview._id);
    await tourPackage.save();

    await newReview.populate("author", "username email");

    res.status(201).json({
        success: true,
        message: "Expedition review submitted successfully.",
        review: newReview,
    });
};

module.exports.deletePackageReview = async (req, res) => {
    const { id, reviewId } = req.params;

    const tourPackage = await TourPackage.findById(id);
    if (!tourPackage) {
        return res.status(404).json({
            success: false,
            error: "Tour package not found.",
        });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({
            success: false,
            error: "Review not found.",
        });
    }

    // Authorization: Review author or Admin
    const isAuthor = review.author && review.author.equals(req.user._id);
    const isAdmin = req.user && req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
        return res.status(403).json({
            success: false,
            error: "You do not have permission to delete this review.",
        });
    }

    await TourPackage.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId },
    });

    await Review.findByIdAndDelete(reviewId);

    res.json({
        success: true,
        message: "Expedition review deleted successfully.",
    });
};

module.exports.addPackageReviewReply = async (req, res) => {
    const { id, reviewId } = req.params;

    const tourPackage = await TourPackage.findById(id);
    if (!tourPackage) {
        return res.status(404).json({
            success: false,
            error: "Tour package not found.",
        });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({
            success: false,
            error: "Review not found.",
        });
    }

    // Authorization: Admin or Package Creator
    const isCreator = tourPackage.createdBy && tourPackage.createdBy.equals(req.user._id);
    const isAdmin = req.user && req.user.role === "admin";

    if (!isCreator && !isAdmin) {
        return res.status(403).json({
            success: false,
            error: "Only tour package directors or admins can reply to reviews.",
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
        message: "Operator reply posted successfully.",
        ownerReply: review.ownerReply,
    });
};

module.exports.deletePackageReviewReply = async (req, res) => {
    const { id, reviewId } = req.params;

    const tourPackage = await TourPackage.findById(id);
    if (!tourPackage) {
        return res.status(404).json({
            success: false,
            error: "Tour package not found.",
        });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({
            success: false,
            error: "Review not found.",
        });
    }

    const isCreator = tourPackage.createdBy && tourPackage.createdBy.equals(req.user._id);
    const isAdmin = req.user && req.user.role === "admin";

    if (!isCreator && !isAdmin) {
        return res.status(403).json({
            success: false,
            error: "You do not have permission to delete this reply.",
        });
    }

    review.ownerReply = undefined;
    await review.save();

    res.json({
        success: true,
        message: "Operator reply removed successfully.",
    });
};

// ==================================================
// EXPERIENCE REVIEWS (Phase 3 / Part 3.8)
// ==================================================

const Experience = require("../models/Experience.js");

module.exports.createExperienceReview = async (req, res) => {
    const { id } = req.params;
    const experience = await Experience.findById(id);

    if (!experience || !experience.isActive) {
        return res.status(404).json({
            success: false,
            error: "Experience not found or is inactive.",
        });
    }

    // 1. Authorization Guard: Only users who booked this experience can review
    const userBooking = await Booking.findOne({
        user: req.user._id,
        experience: experience._id,
        status: "confirmed",
    });

    if (!userBooking) {
        return res.status(403).json({
            success: false,
            error: "Only verified guests who have a confirmed booking for this experience can submit a review.",
        });
    }

    // 2. Duplicate Prevention: User can only review an experience once
    const existingReview = await Review.findOne({
        _id: { $in: experience.reviews },
        author: req.user._id,
    });

    if (existingReview) {
        return res.status(400).json({
            success: false,
            error: "You have already submitted a review for this experience.",
        });
    }

    const reviewData = req.validatedReview || req.body.review || req.body;
    const newReview = new Review({
        comment: reviewData.comment,
        rating: reviewData.rating,
        author: req.user._id,
        targetType: "experience",
        experience: experience._id,
        booking: userBooking._id,
    });

    await newReview.save();
    experience.reviews.push(newReview._id);
    await experience.save();

    await newReview.populate("author", "username email");

    res.status(201).json({
        success: true,
        message: "Experience review submitted successfully.",
        review: newReview,
    });
};

module.exports.deleteExperienceReview = async (req, res) => {
    const { id, reviewId } = req.params;

    const experience = await Experience.findById(id);
    if (!experience) {
        return res.status(404).json({
            success: false,
            error: "Experience not found.",
        });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({
            success: false,
            error: "Review not found.",
        });
    }

    // Authorization: Review author or Admin
    const isAuthor = review.author && review.author.equals(req.user._id);
    const isAdmin = req.user && req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
        return res.status(403).json({
            success: false,
            error: "You do not have permission to delete this review.",
        });
    }

    await Experience.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId },
    });

    await Review.findByIdAndDelete(reviewId);

    res.json({
        success: true,
        message: "Experience review deleted successfully.",
    });
};

module.exports.addExperienceReviewReply = async (req, res) => {
    const { id, reviewId } = req.params;

    const experience = await Experience.findById(id);
    if (!experience) {
        return res.status(404).json({
            success: false,
            error: "Experience not found.",
        });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({
            success: false,
            error: "Review not found.",
        });
    }

    // Authorization: Admin or Experience Creator
    const isCreator = experience.createdBy && experience.createdBy.equals(req.user._id);
    const isAdmin = req.user && req.user.role === "admin";

    if (!isCreator && !isAdmin) {
        return res.status(403).json({
            success: false,
            error: "Only the experience host or an administrator can reply to reviews.",
        });
    }

    const { comment } = req.validatedReply || req.body;
    review.ownerReply = {
        comment,
        createdAt: new Date(),
    };

    await review.save();

    res.status(201).json({
        success: true,
        message: "Host reply posted successfully.",
        ownerReply: review.ownerReply,
    });
};

module.exports.deleteExperienceReviewReply = async (req, res) => {
    const { id, reviewId } = req.params;

    const experience = await Experience.findById(id);
    if (!experience) {
        return res.status(404).json({
            success: false,
            error: "Experience not found.",
        });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({
            success: false,
            error: "Review not found.",
        });
    }

    const isCreator = experience.createdBy && experience.createdBy.equals(req.user._id);
    const isAdmin = req.user && req.user.role === "admin";

    if (!isCreator && !isAdmin) {
        return res.status(403).json({
            success: false,
            error: "You do not have permission to delete this reply.",
        });
    }

    review.ownerReply = undefined;
    await review.save();

    res.json({
        success: true,
        message: "Host reply removed successfully.",
    });
};
