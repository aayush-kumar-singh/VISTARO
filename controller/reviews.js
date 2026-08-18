const Review = require("../models/review.js");
const listings = require("../models/listing.js");

module.exports.createReview = async (req, res) => {
    const { id } = req.params;

    const listing = await listings.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    // 1. Owner cannot review own listing
    if (listing.owner && listing.owner.equals(req.user._id)) {
        req.flash("error", "Hosts cannot submit reviews for their own listings.");
        return res.redirect(`/listings/${listing._id}`);
    }

    // 2. Prevent duplicate reviews by the same user on the same listing
    const existingReview = await Review.findOne({
        _id: { $in: listing.reviews },
        author: req.user._id,
    });

    if (existingReview) {
        req.flash("error", "You have already submitted a review for this property.");
        return res.redirect(`/listings/${listing._id}`);
    }

    const newReview = new Review(req.body.review);

    newReview.author = req.user._id;

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "Review created successfully");

    res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;

    const listing = await listings.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    const review = await Review.findById(reviewId);

    if (!review) {
        req.flash("error", "Review not found");
        return res.redirect(`/listings/${id}`);
    }

    await listings.findByIdAndUpdate(id, {
        $pull: {
            reviews: reviewId,
        },
    });

    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted successfully");

    res.redirect(`/listings/${id}`);
};

module.exports.addReviewReply = async (req, res) => {
    const { id, reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not found");
        return res.redirect(`/listings/${id}`);
    }

    const { comment } = req.body.reply;
    review.ownerReply = {
        comment,
        createdAt: new Date(),
    };

    await review.save();

    req.flash("success", "Host response posted successfully.");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteReviewReply = async (req, res) => {
    const { id, reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not found");
        return res.redirect(`/listings/${id}`);
    }

    review.ownerReply = undefined;
    await review.save();

    req.flash("success", "Host response removed successfully.");
    res.redirect(`/listings/${id}`);
};