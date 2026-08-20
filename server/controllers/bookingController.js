const Booking = require("../models/Booking.js");
const Listing = require("../models/Listing.js");
const { sendBookingConfirmation, sendCancellationConfirmation } = require("../utils/sendEmail.js");

module.exports.createBooking = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        return res.status(404).json({
            success: false,
            error: "Listing not found.",
        });
    }

    // Guard: Owner cannot book their own property
    if (listing.owner && listing.owner.equals(req.user._id)) {
        return res.status(400).json({
            success: false,
            error: "You cannot book your own listing!",
        });
    }

    const bookingData = req.validatedBooking || req.body.booking || req.body;
    const { checkIn, checkOut, guests } = bookingData;
    const guestsCount = parseInt(guests, 10) || 1;

    // Validate maximum guest capacity
    const maxAllowedGuests = listing.maxGuests || 4;
    if (guestsCount > maxAllowedGuests) {
        return res.status(400).json({
            success: false,
            error: `Guest count (${guestsCount}) exceeds maximum capacity of ${maxAllowedGuests} guests for this property.`,
        });
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    if (endDate <= startDate) {
        return res.status(400).json({
            success: false,
            error: "Checkout date must be after check-in date.",
        });
    }

    // Check for existing confirmed booking conflicts
    const conflict = await Booking.findOne({
        listing: id,
        status: "confirmed",
        checkIn: { $lt: endDate },
        checkOut: { $gt: startDate },
    });

    if (conflict) {
        return res.status(400).json({
            success: false,
            error: "Selected dates are no longer available. Please choose different dates.",
        });
    }

    const diffTime = Math.abs(endDate - startDate);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
        return res.status(400).json({
            success: false,
            error: "Invalid date selection.",
        });
    }

    const basePrice = nights * listing.price;
    const gstPrice = Math.round(basePrice * 0.18);
    const totalPrice = basePrice + gstPrice;

    const newBooking = new Booking({
        listing: id,
        user: req.user._id,
        checkIn: startDate,
        checkOut: endDate,
        nights,
        guests: guestsCount,
        totalPrice,
        policySnapshot: listing.cancellationPolicy || "flexible",
        status: "confirmed",
    });

    await newBooking.save();

    // Send confirmation email asynchronously
    if (req.user && req.user.email) {
        sendBookingConfirmation({
            user: req.user,
            listing,
            booking: newBooking,
        }).catch((err) => console.error("[Booking] Async email dispatch error:", err));
    }

    res.status(201).json({
        success: true,
        message: `Booking confirmed for ${nights} night(s)! A receipt has been sent to ${req.user.email}.`,
        booking: newBooking,
    });
};

module.exports.cancelBooking = async (req, res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate("listing").populate("user");
    if (!booking) {
        return res.status(404).json({
            success: false,
            error: "Booking not found.",
        });
    }

    // Authorization: Either the guest or the listing owner can cancel
    const isGuest = booking.user._id.equals(req.user._id);
    const isHost = booking.listing && booking.listing.owner && booking.listing.owner.equals(req.user._id);

    if (!isGuest && !isHost) {
        return res.status(403).json({
            success: false,
            error: "You do not have permission to cancel this booking.",
        });
    }

    if (booking.status === "cancelled") {
        return res.status(400).json({
            success: false,
            error: "This reservation has already been cancelled.",
        });
    }

    // Tiered refund calculation
    const policy = booking.policySnapshot || (booking.listing && booking.listing.cancellationPolicy) || "flexible";
    const hoursUntilCheckIn = (new Date(booking.checkIn).getTime() - Date.now()) / (1000 * 60 * 60);

    let refundPercentage = 0;
    if (policy === "strict") {
        if (hoursUntilCheckIn >= 168) {
            refundPercentage = 50;
        } else {
            refundPercentage = 0;
        }
    } else if (policy === "moderate") {
        if (hoursUntilCheckIn >= 120) {
            refundPercentage = 100;
        } else if (hoursUntilCheckIn >= 48) {
            refundPercentage = 50;
        } else {
            refundPercentage = 0;
        }
    } else {
        if (hoursUntilCheckIn >= 48) {
            refundPercentage = 100;
        } else {
            refundPercentage = 0;
        }
    }

    const refundAmount = Math.round(((booking.totalPrice || 0) * refundPercentage) / 100);
    const reason = (req.body && req.body.reason) ? req.body.reason.trim() : "";

    booking.status = "cancelled";
    booking.cancellation = {
        reason,
        cancelledAt: new Date(),
        cancelledBy: req.user._id,
        refundAmount,
        refundPercentage,
    };

    await booking.save();

    // Send cancellation receipt email
    const recipientUser = booking.user.email ? booking.user : req.user;
    if (recipientUser && recipientUser.email) {
        sendCancellationConfirmation({
            user: recipientUser,
            listing: booking.listing,
            booking,
            refundAmount,
            refundPercentage,
            reason,
        }).catch((err) => console.error("[Booking] Async cancellation email error:", err));
    }

    res.json({
        success: true,
        message: `Reservation cancelled. ${refundPercentage > 0 ? `A refund of ₹${refundAmount.toLocaleString('en-IN')} (${refundPercentage}%) has been issued.` : 'No refund was eligible under the ' + policy + ' policy.'}`,
        booking,
        refundAmount,
        refundPercentage,
    });
};
