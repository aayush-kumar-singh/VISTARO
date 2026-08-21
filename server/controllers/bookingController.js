const Booking = require("../models/Booking.js");
const Listing = require("../models/Listing.js");
const TourPackage = require("../models/TourPackage.js");
const Experience = require("../models/Experience.js");
const { sendBookingConfirmation, sendCancellationConfirmation } = require("../utils/sendEmail.js");

// --------------------------------------------------
// POST /api/listings/:id/bookings — Stay Booking
// --------------------------------------------------
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
        bookingType: "stay",
        listing: id,
        tourPackage: null,
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

// --------------------------------------------------
// POST /api/tour-packages/:id/bookings — Package Booking
// --------------------------------------------------
module.exports.createPackageBooking = async (req, res) => {
    const { id } = req.params;
    const packageId = id || req.body.packageId || req.body.tourPackageId;

    const tourPackage = await TourPackage.findById(packageId);
    if (!tourPackage || !tourPackage.isActive) {
        return res.status(404).json({
            success: false,
            error: "Tour package not found or is currently inactive.",
        });
    }

    const bookingData = req.body.booking || req.body;
    const { startDate, checkIn, departureDate, travelers, guests } = bookingData;
    const rawDate = startDate || departureDate || checkIn;

    if (!rawDate) {
        return res.status(400).json({
            success: false,
            error: "Departure start date is required.",
        });
    }

    const parsedStartDate = new Date(rawDate);
    if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
            success: false,
            error: "Invalid departure start date provided.",
        });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedStartDate < today) {
        return res.status(400).json({
            success: false,
            error: "Departure date cannot be in the past.",
        });
    }

    const travelersCount = parseInt(travelers || guests, 10) || 1;
    if (travelersCount < 1) {
        return res.status(400).json({
            success: false,
            error: "At least 1 traveler is required.",
        });
    }

    // Validate maxGroupSize
    const maxCapacity = tourPackage.maxGroupSize || 12;
    if (travelersCount > maxCapacity) {
        return res.status(400).json({
            success: false,
            error: `Traveler count (${travelersCount}) exceeds maximum capacity of ${maxCapacity} explorers for this package.`,
        });
    }

    // Server-side price recalculation (never trust client prices)
    const days = tourPackage.duration?.days || 1;
    const nights = tourPackage.duration?.nights ?? Math.max(0, days - 1);
    const parsedEndDate = new Date(parsedStartDate.getTime() + days * 24 * 60 * 60 * 1000);

    const basePerPerson = tourPackage.price?.basePrice ?? tourPackage.basePrice ?? 0;
    const subtotal = travelersCount * basePerPerson;
    const gstPrice = Math.round(subtotal * 0.18);
    const totalPrice = subtotal + gstPrice;

    const newBooking = new Booking({
        bookingType: "package",
        tourPackage: tourPackage._id,
        listing: null,
        user: req.user._id,
        checkIn: parsedStartDate,
        checkOut: parsedEndDate,
        nights,
        guests: travelersCount,
        totalPrice,
        policySnapshot: "flexible",
        status: "confirmed",
    });

    await newBooking.save();
    await newBooking.populate("tourPackage");

    res.status(201).json({
        success: true,
        message: `Expedition booking confirmed for ${travelersCount} traveler(s)! A confirmation receipt has been issued to ${req.user.email}.`,
        booking: newBooking,
    });
};

// --------------------------------------------------
// POST /api/experiences/:id/bookings — Experience Booking
// --------------------------------------------------
module.exports.createExperienceBooking = async (req, res) => {
    const { id } = req.params;
    const experienceId = id || req.body.experienceId;

    const experience = await Experience.findById(experienceId);
    if (!experience || !experience.isActive) {
        return res.status(404).json({
            success: false,
            error: "Experience not found or is currently inactive.",
        });
    }

    const bookingData = req.body.booking || req.body;
    const { activityDate, startDate, checkIn, date, travelers, guests } = bookingData;
    const rawDate = activityDate || date || startDate || checkIn;

    if (!rawDate) {
        return res.status(400).json({
            success: false,
            error: "Activity date is required.",
        });
    }

    const parsedStartDate = new Date(rawDate);
    if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
            success: false,
            error: "Invalid activity date provided.",
        });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedStartDate < today) {
        return res.status(400).json({
            success: false,
            error: "Activity date cannot be in the past.",
        });
    }

    const travelersCount = parseInt(travelers || guests, 10) || 1;
    if (travelersCount < 1) {
        return res.status(400).json({
            success: false,
            error: "At least 1 participant is required.",
        });
    }

    // Validate maxGroupSize
    const maxCapacity = experience.maxGroupSize || 10;
    if (travelersCount > maxCapacity) {
        return res.status(400).json({
            success: false,
            error: `Participant count (${travelersCount}) exceeds maximum group size of ${maxCapacity} guests for this experience.`,
        });
    }

    // Server-side price recalculation (never trust client prices)
    const basePerPerson = experience.price?.basePrice ?? experience.basePrice ?? 0;
    const subtotal = travelersCount * basePerPerson;
    const gstPrice = Math.round(subtotal * 0.18);
    const totalPrice = subtotal + gstPrice;

    // End date is calculated from duration in hours (or same day)
    const durationHours = experience.durationHours || 2;
    const parsedEndDate = new Date(parsedStartDate.getTime() + durationHours * 60 * 60 * 1000);

    const newBooking = new Booking({
        bookingType: "experience",
        experience: experience._id,
        listing: null,
        tourPackage: null,
        user: req.user._id,
        checkIn: parsedStartDate,
        checkOut: parsedEndDate,
        nights: 1,
        guests: travelersCount,
        totalPrice,
        policySnapshot: "flexible",
        status: "confirmed",
    });

    await newBooking.save();
    await newBooking.populate("experience");

    res.status(201).json({
        success: true,
        message: `Experience booking confirmed for ${travelersCount} guest(s)! A confirmation receipt has been issued to ${req.user.email}.`,
        booking: newBooking,
    });
};

// --------------------------------------------------
// DELETE /api/bookings/:bookingId — Cancellation
// --------------------------------------------------
module.exports.cancelBooking = async (req, res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
        .populate("listing")
        .populate("tourPackage")
        .populate("experience")
        .populate("user");

    if (!booking) {
        return res.status(404).json({
            success: false,
            error: "Booking not found.",
        });
    }

    // Authorization: Either the guest, the listing/experience owner, or admin can cancel
    const isGuest = booking.user && booking.user._id.equals(req.user._id);
    const isHost =
        (booking.listing && booking.listing.owner && booking.listing.owner.equals(req.user._id)) ||
        (booking.experience && booking.experience.createdBy && booking.experience.createdBy.equals(req.user._id));
    const isAdmin = req.user.role === "admin";

    if (!isGuest && !isHost && !isAdmin) {
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
