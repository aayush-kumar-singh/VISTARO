const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const { sendBookingConfirmation, sendCancellationConfirmation } = require("../utils/sendEmail.js");

module.exports.createBooking = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    // Guard: Owner cannot book their own property
    if (listing.owner && listing.owner.equals(req.user._id)) {
        req.flash("error", "You cannot book your own listing!");
        return res.redirect(`/listings/${id}`);
    }

    const { checkIn, checkOut, guests } = req.body.booking;
    const guestsCount = parseInt(guests, 10) || 1;

    // Validate maximum guest occupancy limit
    const maxAllowedGuests = listing.maxGuests || 4;
    if (guestsCount > maxAllowedGuests) {
        req.flash(
            "error",
            `Guest count (${guestsCount}) exceeds maximum capacity of ${maxAllowedGuests} guests for this property.`
        );
        return res.redirect(`/listings/${id}`);
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    if (endDate <= startDate) {
        req.flash("error", "Checkout date must be after check-in date.");
        return res.redirect(`/listings/${id}`);
    }

    // Check for existing confirmed booking conflicts
    const conflict = await Booking.findOne({
        listing: id,
        status: "confirmed",
        $or: [
            { checkIn: { $lt: endDate, $gte: startDate } },
            { checkOut: { $gt: startDate, $lte: endDate } },
            { checkIn: { $lte: startDate }, checkOut: { $gte: endDate } },
        ],
    });

    if (conflict) {
        req.flash(
            "error",
            "Selected dates are no longer available. Please choose different dates."
        );
        return res.redirect(`/listings/${id}`);
    }

    const diffTime = Math.abs(endDate - startDate);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
        req.flash("error", "Invalid date selection.");
        return res.redirect(`/listings/${id}`);
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

    // Asynchronously dispatch confirmation receipt email
    if (req.user && req.user.email) {
        sendBookingConfirmation({
            user: req.user,
            listing,
            booking: newBooking,
        }).catch((err) => console.error("Async email dispatch error:", err));
    }

    req.flash(
        "success",
        `Booking confirmed for ${nights} night(s)! A receipt has been sent to ${req.user.email}.`
    );
    res.redirect(`/listings/${id}`);
};

module.exports.cancelBooking = async (req, res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate("listing").populate("user");
    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/listings");
    }

    // Authorization: Either the guest or the listing owner can cancel
    const isGuest = booking.user._id.equals(req.user._id);
    const isHost = booking.listing.owner && booking.listing.owner.equals(req.user._id);

    if (!isGuest && !isHost) {
        req.flash("error", "You do not have permission to cancel this booking.");
        return res.redirect("/listings");
    }

    if (booking.status === "cancelled") {
        req.flash("error", "This reservation has already been cancelled.");
        return res.redirect("/profile");
    }

    // Tiered refund calculation
    const policy = booking.policySnapshot || (booking.listing && booking.listing.cancellationPolicy) || "flexible";
    const hoursUntilCheckIn = (new Date(booking.checkIn).getTime() - Date.now()) / (1000 * 60 * 60);

    let refundPercentage = 0;
    if (policy === "strict") {
        // 50% if >= 7 days (168 hours) before check-in, 0% otherwise
        if (hoursUntilCheckIn >= 168) {
            refundPercentage = 50;
        } else {
            refundPercentage = 0;
        }
    } else if (policy === "moderate") {
        // 100% if >= 5 days (120 hours), 50% if >= 48 hours, 0% within 48 hours
        if (hoursUntilCheckIn >= 120) {
            refundPercentage = 100;
        } else if (hoursUntilCheckIn >= 48) {
            refundPercentage = 50;
        } else {
            refundPercentage = 0;
        }
    } else {
        // flexible: 100% if >= 48 hours, 0% within 48 hours
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
        }).catch((err) => console.error("Async cancellation email error:", err));
    }

    const redirectPath = req.headers.referer && req.headers.referer.includes("/owner/dashboard")
        ? "/owner/dashboard"
        : "/profile";

    req.flash(
        "success",
        `Reservation cancelled. ${refundPercentage > 0 ? `A refund of ₹${refundAmount.toLocaleString('en-IN')} (${refundPercentage}%) has been issued.` : 'No refund was eligible under the ' + policy + ' policy.'}`
    );
    res.redirect(redirectPath);
};
