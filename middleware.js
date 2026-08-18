const mongoose = require("mongoose");
const listings = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema, reviewReplySchema, bookingSchema } = require("./schema.js");

module.exports.validateObjectId = (paramName = "id") => {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (id && !mongoose.Types.ObjectId.isValid(id)) {
            req.flash("error", "Invalid resource identifier.");
            return res.redirect("/listings");
        }
        next();
    };
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const errMsg = error.details
            .map((el) => el.message)
            .join(",");

        return next(new ExpressError(400, errMsg));
    }

    next();
};

module.exports.validateReviewReply = (req, res, next) => {
    const { error } = reviewReplySchema.validate(req.body);

    if (error) {
        const errMsg = error.details
            .map((el) => el.message)
            .join(",");

        return next(new ExpressError(400, errMsg));
    }

    next();
};

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        return res.redirect("/login");
    }

    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;

        // Remove it after saving it to locals so it isn't reused
        // accidentally on a later request.
        delete req.session.redirectUrl;
    }

    next();
};

module.exports.isOwner = async (req, res, next) => {
    try {
        const { id } = req.params;

        const listing = await listings.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        if (!listing.owner) {
            req.flash(
                "error",
                "This listing does not have a valid owner"
            );

            return res.redirect(`/listings/${id}`);
        }

        if (
            !res.locals.currUser ||
            !listing.owner.equals(res.locals.currUser._id)
        ) {
            req.flash(
                "error",
                "You are not the owner of this listing"
            );

            return res.redirect(`/listings/${id}`);
        }

        next();
    } catch (err) {
        next(err);
    }
};

module.exports.isReviewauthor = async (req, res, next) => {
    try {
        const { reviewId, id } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            req.flash("error", "Review not found");
            return res.redirect(`/listings/${id}`);
        }

        if (!review.author) {
            req.flash(
                "error",
                "This review does not have a valid author"
            );

            return res.redirect(`/listings/${id}`);
        }

        if (
            !res.locals.currUser ||
            !review.author.equals(res.locals.currUser._id)
        ) {
            req.flash(
                "error",
                "You are not the author of this review"
            );

            return res.redirect(`/listings/${id}`);
        }

        next();
    } catch (err) {
        next(err);
    }
};

module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);

    if (error) {
        const errMsg = error.details
            .map((el) => el.message)
            .join(",");

        return next(new ExpressError(400, errMsg));
    }

    next();
};

module.exports.validateBooking = (req, res, next) => {
    const { error } = bookingSchema.validate(req.body);

    if (error) {
        const errMsg = error.details
            .map((el) => el.message)
            .join(",");

        return next(new ExpressError(400, errMsg));
    }

    next();
};