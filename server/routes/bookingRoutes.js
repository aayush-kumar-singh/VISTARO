const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateObjectId } = require("../middleware/auth.js");
const { validateBooking } = require("../middleware/validate.js");
const { bookingLimiter } = require("../middleware/rateLimiter.js");
const bookingController = require("../controllers/bookingController.js");

// 1. Normalized User Bookings List
router.get(
    "/my-bookings",
    isLoggedIn,
    wrapAsync(bookingController.getMyBookings)
);

// Fallback GET / on this router (useful when mounted directly at /api/my-bookings)
router.get(
    "/",
    isLoggedIn,
    wrapAsync(bookingController.getMyBookings)
);

// 2. Get single booking detail by bookingId
router.get(
    "/:bookingId",
    validateObjectId("bookingId"),
    isLoggedIn,
    wrapAsync(bookingController.getBookingById)
);

// 3. Create booking for a listing (POST /)
router.post(
    "/",
    bookingLimiter,
    isLoggedIn,
    validateBooking,
    wrapAsync(bookingController.createBooking)
);

// 4. Cancel booking by bookingId (DELETE & POST aliases)
router.delete(
    "/:bookingId",
    validateObjectId("bookingId"),
    isLoggedIn,
    wrapAsync(bookingController.cancelBooking)
);

router.post(
    "/:bookingId/cancel",
    validateObjectId("bookingId"),
    isLoggedIn,
    wrapAsync(bookingController.cancelBooking)
);

module.exports = router;
