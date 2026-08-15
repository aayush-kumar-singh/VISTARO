const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateBooking, validateObjectId } = require("../middleware.js");
const bookingController = require("../controller/booking.js");

// Create booking for a listing
router.post(
    "/",
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
