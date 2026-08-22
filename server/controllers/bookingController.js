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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
        return res.status(400).json({
            success: false,
            error: "Check-in date cannot be in the past.",
        });
    }

    if (endDate <= startDate) {
        return res.status(400).json({
            success: false,
            error: "Checkout date must be after check-in date.",
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

    if (nights > 90) {
        return res.status(400).json({
            success: false,
            error: "Maximum stay duration is 90 nights.",
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
// Booking Normalizer Helper
// --------------------------------------------------
const normalizeSingleBooking = (b) => {
    const isStay = b.bookingType === "stay" || (b.listing && !b.tourPackage && !b.experience);
    const isPackage = b.bookingType === "package" || (!b.listing && b.tourPackage && !b.experience);
    const isExperience = b.bookingType === "experience" || (!b.listing && !b.tourPackage && b.experience);

    const calculatedType = isExperience ? "experience" : isPackage ? "package" : "stay";
    const now = new Date();

    // Compute status
    let calculatedStatus = "confirmed";
    if (b.status === "cancelled") {
        calculatedStatus = "cancelled";
    } else if (new Date(b.checkOut) >= now) {
        calculatedStatus = "upcoming";
    } else {
        calculatedStatus = "completed";
    }

    // Determine item metadata
    let itemData = {
        id: null,
        title: "Archived / Removed Item",
        type: calculatedType,
        typeLabel: calculatedType === "experience" ? "Host Experience" : calculatedType === "package" ? "Tour Package" : "Stay / Villa",
        slug: null,
        detailUrl: "#",
        coverImage: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80",
        location: "",
        destination: null,
        hostOrOwner: null,
        meetingPoint: null,
        whatsIncluded: [],
    };

    if (isStay && b.listing) {
        const l = b.listing;
        const img = l.images?.[0]?.url || l.image?.url || itemData.coverImage;
        itemData = {
            id: l._id,
            title: l.title,
            type: "stay",
            typeLabel: "Stay / Villa",
            slug: null,
            detailUrl: `/listings/${l._id}`,
            coverImage: img,
            location: `${l.location || ""}${l.country ? ", " + l.country : ""}`,
            destination: null,
            hostOrOwner: l.owner ? { id: l.owner._id, username: l.owner.username, email: l.owner.email } : null,
            meetingPoint: l.location || null,
            whatsIncluded: l.amenities || [],
        };
    } else if (isPackage && b.tourPackage) {
        const p = b.tourPackage;
        const img = p.coverImage?.url || p.image?.url || itemData.coverImage;
        itemData = {
            id: p._id,
            title: p.title,
            type: "package",
            typeLabel: "Tour Package",
            slug: p.slug || null,
            detailUrl: `/tours/${p.slug || p._id}`,
            coverImage: img,
            location: p.destination ? `${p.destination.name}, ${p.destination.state || p.destination.country}` : "Curated Expedition",
            destination: p.destination || null,
            hostOrOwner: p.createdBy ? { id: p.createdBy._id, username: p.createdBy.username } : null,
            meetingPoint: p.meetingPoint || null,
            whatsIncluded: p.whatsIncluded || [],
        };
    } else if (isExperience && b.experience) {
        const e = b.experience;
        const img = e.coverImage?.url || e.image?.url || itemData.coverImage;
        itemData = {
            id: e._id,
            title: e.title,
            type: "experience",
            typeLabel: "Host Experience",
            slug: e.slug || null,
            detailUrl: `/experiences/${e.slug || e._id}`,
            coverImage: img,
            location: e.destination ? `${e.destination.name}, ${e.destination.state || e.destination.country}` : "Host Experience",
            destination: e.destination || null,
            hostOrOwner: e.createdBy ? { id: e.createdBy._id, username: e.createdBy.username } : null,
            meetingPoint: e.meetingPoint || null,
            whatsIncluded: e.whatsIncluded || [],
        };
    }

    // Determine attendee / guest label
    const attendeeCount = b.guests || 1;
    let attendeeLabel = `${attendeeCount} ${attendeeCount === 1 ? "Guest" : "Guests"}`;
    if (calculatedType === "package") {
        attendeeLabel = `${attendeeCount} ${attendeeCount === 1 ? "Explorer" : "Explorers"}`;
    } else if (calculatedType === "experience") {
        attendeeLabel = `${attendeeCount} ${attendeeCount === 1 ? "Participant" : "Participants"}`;
    }

    // Determine duration summary
    let durationSummary = `${b.nights || 1} night(s)`;
    if (calculatedType === "package" && b.tourPackage?.duration) {
        const days = b.tourPackage.duration.days || 1;
        const nights = b.tourPackage.duration.nights ?? Math.max(0, days - 1);
        durationSummary = `${days} Days / ${nights} Nights`;
    } else if (calculatedType === "experience") {
        const hours = b.experience?.durationHours || 2;
        durationSummary = `${hours} Hour(s)`;
    }

    const subtotal = Math.round((b.totalPrice || 0) / 1.18);
    const gstPrice = (b.totalPrice || 0) - subtotal;

    return {
        _id: b._id,
        bookingType: calculatedType,
        status: calculatedStatus,
        rawStatus: b.status,
        isCancelled: b.status === "cancelled",
        item: itemData,
        dates: {
            checkIn: b.checkIn,
            checkOut: b.checkOut,
            nights: b.nights,
            durationSummary,
        },
        guests: {
            count: attendeeCount,
            label: attendeeLabel,
        },
        pricing: {
            basePrice: subtotal,
            gstPrice,
            totalPrice: b.totalPrice,
            currency: "INR",
            policySnapshot: b.policySnapshot || "flexible",
        },
        cancellation: b.status === "cancelled" ? (b.cancellation || null) : null,
        user: b.user ? { _id: b.user._id, username: b.user.username, email: b.user.email } : null,
        createdAt: b.createdAt,
    };
};

// --------------------------------------------------
// GET /api/bookings/:bookingId & /api/my-bookings/:bookingId — Single Booking Detail
// --------------------------------------------------
module.exports.getBookingById = async (req, res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
        .populate({
            path: "listing",
            select: "title location country image images cancellationPolicy price maxGuests owner amenities description",
            populate: { path: "owner", select: "username email" },
        })
        .populate({
            path: "tourPackage",
            select: "title slug coverImage image duration difficultyLevel price basePrice maxGroupSize whatsIncluded meetingPoint destination createdBy",
            populate: { path: "destination", select: "name slug state country" },
        })
        .populate({
            path: "experience",
            select: "title slug coverImage image durationHours category price basePrice maxGroupSize whatsIncluded meetingPoint destination createdBy",
            populate: {
                path: "destination",
                select: "name slug state country",
            },
        })
        .populate("user", "username email");

    if (!booking) {
        return res.status(404).json({
            success: false,
            error: "Booking not found.",
        });
    }

    const isGuest = booking.user && booking.user._id.equals(req.user._id);
    const isHost =
        (booking.listing && booking.listing.owner && booking.listing.owner.equals(req.user._id)) ||
        (booking.experience && booking.experience.createdBy && booking.experience.createdBy.equals(req.user._id));
    const isAdmin = req.user.role === "admin";

    if (!isGuest && !isHost && !isAdmin) {
        return res.status(404).json({
            success: false,
            error: "Booking not found.",
        });
    }

    res.json({
        success: true,
        booking: normalizeSingleBooking(booking),
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

    const now = new Date();
    if (new Date(booking.checkOut) < now) {
        return res.status(400).json({
            success: false,
            error: "Past or completed reservations cannot be cancelled.",
        });
    }

    // Tiered refund calculation across all 3 booking types
    const policy =
        booking.policySnapshot ||
        (booking.listing && booking.listing.cancellationPolicy) ||
        (booking.tourPackage && booking.tourPackage.cancellationPolicy) ||
        (booking.experience && booking.experience.cancellationPolicy) ||
        "flexible";

    const hoursUntilCheckIn = (new Date(booking.checkIn).getTime() - now.getTime()) / (1000 * 60 * 60);

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
        // Default: flexible
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
    const recipientUser = booking.user?.email ? booking.user : req.user;
    if (recipientUser && recipientUser.email) {
        const targetItem = booking.listing || booking.tourPackage || booking.experience;
        sendCancellationConfirmation({
            user: recipientUser,
            listing: targetItem,
            booking,
            refundAmount,
            refundPercentage,
            reason,
        }).catch((err) => console.error("[Booking] Async cancellation email error:", err));
    }

    res.json({
        success: true,
        message: `Reservation cancelled. ${refundPercentage > 0 ? `A refund of ₹${refundAmount.toLocaleString('en-IN')} (${refundPercentage}%) has been issued.` : 'No refund was eligible under the ' + policy + ' policy.'}`,
        booking: normalizeSingleBooking(booking),
        refundAmount,
        refundPercentage,
    });
};

// --------------------------------------------------
// GET /api/my-bookings (and /api/bookings/my-bookings) — Normalized User Bookings
// --------------------------------------------------
module.exports.getMyBookings = async (req, res) => {
    const userId = req.user._id;
    const { status, type } = req.query;

    const query = { user: userId };

    if (type && ["stay", "package", "experience"].includes(type.toLowerCase())) {
        query.bookingType = type.toLowerCase();
    }

    const rawBookings = await Booking.find(query)
        .populate({
            path: "listing",
            select: "title location country image images cancellationPolicy price maxGuests owner amenities description",
            populate: { path: "owner", select: "username email" },
        })
        .populate({
            path: "tourPackage",
            select: "title slug coverImage image duration difficultyLevel price basePrice destination createdBy whatsIncluded meetingPoint",
            populate: { path: "destination", select: "name slug state country" },
        })
        .populate({
            path: "experience",
            select: "title slug coverImage image durationHours category price basePrice maxGroupSize meetingPoint destination createdBy whatsIncluded",
            populate: {
                path: "destination",
                select: "name slug state country",
            },
        })
        .populate("user", "username email")
        .sort({ checkIn: -1 });

    // Normalization mapping
    const normalizedBookings = rawBookings.map((b) => normalizeSingleBooking(b));

    // Apply status filter if provided
    let filteredBookings = normalizedBookings;
    if (status && ["upcoming", "completed", "cancelled"].includes(status.toLowerCase())) {
        filteredBookings = normalizedBookings.filter(
            (b) => b.status === status.toLowerCase()
        );
    }

    // Counts summary by status and type for quick tabs
    const counts = {
        total: normalizedBookings.length,
        upcoming: normalizedBookings.filter((b) => b.status === "upcoming").length,
        completed: normalizedBookings.filter((b) => b.status === "completed").length,
        cancelled: normalizedBookings.filter((b) => b.status === "cancelled").length,
        stays: normalizedBookings.filter((b) => b.bookingType === "stay").length,
        packages: normalizedBookings.filter((b) => b.bookingType === "package").length,
        experiences: normalizedBookings.filter((b) => b.bookingType === "experience").length,
    };

    res.json({
        success: true,
        count: filteredBookings.length,
        counts,
        bookings: filteredBookings,
    });
};


