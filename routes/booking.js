const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const rateLimit = require("express-rate-limit");
const { isLoggedIn, validateBooking, validateObjectId } = require("../middleware.js");
const bookingController = require("../controller/booking.js");

// S5: Rate limit booking creation — max 10 per 15 min per IP
const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        req.flash("error", "Too many booking attempts. Please wait 15 minutes before trying again.");
        res.redirect("back");
    },
});

// Create booking for a listing
router.post(
    "/",
    bookingLimiter,
    isLoggedIn,
    validateBooking,
    wrapAsync(bookingController.createBooking)
);

// Cancel booking
router.delete(
    "/:bookingId",
    validateObjectId("bookingId"),
    isLoggedIn,
    wrapAsync(bookingController.cancelBooking)
);

module.exports = router;
