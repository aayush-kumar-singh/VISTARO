const Listing = require("../models/Listing.js");
const Booking = require("../models/Booking.js");

const RESULTS_PER_PAGE = 12;

module.exports.searchListings = async (req, res, next) => {
    try {
        const queryStr = (req.query.q || req.query.query || "").trim();
        const { minPrice, maxPrice, sort, guests, checkIn, checkOut, dateRange } = req.query;
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);

        let selectedAmenities = req.query.amenities;
        if (selectedAmenities) {
            if (typeof selectedAmenities === "string") {
                try {
                    selectedAmenities = JSON.parse(selectedAmenities);
                } catch (e) {
                    selectedAmenities = selectedAmenities.split(",").map((a) => a.trim()).filter(Boolean);
                }
            }
            if (!Array.isArray(selectedAmenities)) {
                selectedAmenities = [selectedAmenities];
            }
        } else {
            selectedAmenities = [];
        }

        // Parse dateRange string if passed (e.g. "2026-09-01 to 2026-09-05")
        let parsedCheckIn = checkIn;
        let parsedCheckOut = checkOut;
        if (dateRange && dateRange.includes(" to ")) {
            const parts = dateRange.split(" to ");
            parsedCheckIn = parts[0].trim();
            parsedCheckOut = parts[1].trim();
        }

        const filter = {};

        // 1. Text Search across Title, Location, Country, Category, Description
        if (queryStr) {
            const escapedQuery = queryStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(escapedQuery, "i");
            filter.$or = [
                { title: regex },
                { location: regex },
                { country: regex },
                { category: regex },
                { description: regex },
            ];
        }

        // 2. Guest Count filter
        if (guests && !isNaN(Number(guests)) && Number(guests) > 0) {
            filter.maxGuests = { $gte: Number(guests) };
        }

        // 3. Price Range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice && !isNaN(Number(minPrice))) {
                filter.price.$gte = Number(minPrice);
            }
            if (maxPrice && !isNaN(Number(maxPrice))) {
                filter.price.$lte = Number(maxPrice);
            }
        }

        // 4. Amenities filter
        if (selectedAmenities.length > 0) {
            filter.amenities = { $all: selectedAmenities };
        }

        // 5. Date Availability filter
        if (parsedCheckIn && parsedCheckOut) {
            const start = new Date(parsedCheckIn);
            const end = new Date(parsedCheckOut);

            if (end > start) {
                const conflictBookings = await Booking.find({
                    status: "confirmed",
                    checkIn: { $lt: end },
                    checkOut: { $gt: start },
                }).select("listing");

                const bookedListingIds = conflictBookings
                    .map((b) => b.listing)
                    .filter(Boolean);

                if (bookedListingIds.length > 0) {
                    filter._id = { $nin: bookedListingIds };
                }
            }
        }

        // 6. Sorting logic
        let sortQuery = { _id: -1 };
        if (sort === "price_asc") {
            sortQuery = { price: 1 };
        } else if (sort === "price_desc") {
            sortQuery = { price: -1 };
        } else if (sort === "newest") {
            sortQuery = { _id: -1 };
        }

        // 7. Pagination
        const totalResults = await Listing.countDocuments(filter);
        const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE) || 1;
        const currentPage = Math.min(page, totalPages);
        const skip = (currentPage - 1) * RESULTS_PER_PAGE;

        const results = await Listing.find(filter)
            .populate("reviews")
            .sort(sortQuery)
            .skip(skip)
            .limit(RESULTS_PER_PAGE);

        res.json({
            success: true,
            results,
            query: queryStr,
            filters: {
                minPrice: minPrice || "",
                maxPrice: maxPrice || "",
                guests: guests || "",
                checkIn: parsedCheckIn || "",
                checkOut: parsedCheckOut || "",
                selectedAmenities,
                sortOption: sort || "",
            },
            pagination: {
                currentPage,
                totalPages,
                totalResults,
                limit: RESULTS_PER_PAGE,
            },
        });
    } catch (err) {
        next(err);
    }
};
