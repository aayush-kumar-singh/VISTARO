const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateObjectId } = require("../middleware/auth.js");
const { validateBooking } = require("../middleware/validate.js");
const { bookingLimiter } = require("../middleware/rateLimiter.js");
const bookingController = require("../controllers/bookingController.js");

// Create booking for a listing
router.post(
    "/",
    bookingLimiter,
    isLoggedIn,
    validateBooking,
    wrapAsync(bookingController.createBooking)
);

// Cancel booking by bookingId
router.delete(
    "/:bookingId",
    validateObjectId("bookingId"),
    isLoggedIn,
    wrapAsync(bookingController.cancelBooking)
);

module.exports = router;
