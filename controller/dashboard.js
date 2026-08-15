const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");

module.exports.renderDashboard = async (req, res) => {
    const userId = req.user._id;

    // 1. Fetch all listings owned by current user
    const myListings = await Listing.find({ owner: userId }).populate("reviews");
    const listingIds = myListings.map((l) => l._id);

    // 2. Fetch all bookings for these listings
    const incomingBookings = await Booking.find({
        listing: { $in: listingIds },
    })
        .populate("listing")
        .populate("user")
        .sort({ checkIn: 1 });

    const now = new Date();
    const confirmedBookings = incomingBookings.filter((b) => b.status === "confirmed");
    const upcomingBookings = confirmedBookings.filter((b) => new Date(b.checkOut) >= now);

    // 3. Compute KPI Metrics
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalGuests = upcomingBookings.reduce((sum, b) => sum + (b.guests || 1), 0);

    // 4. Compute 30-day occupancy rate across host listings
    let bookedNightsNext30 = 0;
    const next30DaysEnd = new Date(now.getTime() + 30 * 86400000);

    for (const b of upcomingBookings) {
        const start = new Date(Math.max(new Date(b.checkIn), now));
        const end = new Date(Math.min(new Date(b.checkOut), next30DaysEnd));
        if (end > start) {
            const diffDays = Math.ceil((end - start) / 86400000);
            bookedNightsNext30 += diffDays;
        }
    }

    const totalPossibleNights = Math.max(1, myListings.length * 30);
    const occupancyRate = myListings.length > 0 ? Math.min(100, Math.round((bookedNightsNext30 / totalPossibleNights) * 100)) : 0;

    // 5. Per-listing analytics
    const listingStats = myListings.map((listing) => {
        const listingBookings = incomingBookings.filter(
            (b) => b.listing && b.listing._id.equals(listing._id)
        );
        const lConfirmed = listingBookings.filter((b) => b.status === "confirmed");
        const revenue = lConfirmed.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        const upcomingCount = lConfirmed.filter((b) => new Date(b.checkOut) >= now).length;

        return {
            listing,
            totalBookings: listingBookings.length,
            confirmedBookings: lConfirmed.length,
            upcomingBookings: upcomingCount,
            revenue,
        };
    });

    res.render("owner/dashboard.ejs", {
        myListings,
        listingStats,
        incomingBookings,
        upcomingBookings,
        totalRevenue,
        totalGuests,
        occupancyRate,
    });
};
