const User = require("../models/User.js");
const Booking = require("../models/Booking.js");
const Listing = require("../models/Listing.js");
const Message = require("../models/Message.js");

module.exports.signUpUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: "Username, email, and password are required.",
            });
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({
            $or: [
                {
                    username: new RegExp(
                        "^" + username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
                        "i"
                    ),
                },
                {
                    email: new RegExp(
                        "^" + email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
                        "i"
                    ),
                },
            ],
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: "Username or email is already registered. Please log in.",
            });
        }

        // Create new user
        const newUser = new User({
            username: username.trim(),
            email: email.trim().toLowerCase(),
        });

        const registeredUser = await User.register(newUser, password);

        // Automatically log in after signup
        req.login(registeredUser, (err) => {
            if (err) return next(err);

            const userJson = {
                _id: registeredUser._id,
                username: registeredUser.username,
                email: registeredUser.email,
                bio: registeredUser.bio || "",
                wishlist: registeredUser.wishlist || [],
            };

            return res.status(201).json({
                success: true,
                message: "Welcome to Vistaro! Account successfully created.",
                user: userJson,
            });
        });
    } catch (e) {
        return res.status(400).json({
            success: false,
            error: e.message || "Failed to create account.",
        });
    }
};

module.exports.login = (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: "Authentication failed.",
        });
    }

    const userJson = {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        bio: req.user.bio || "",
        wishlist: req.user.wishlist || [],
    };

    res.json({
        success: true,
        message: "Login successful.",
        user: userJson,
    });
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.json({
            success: true,
            message: "Logout successful.",
        });
    });
};

module.exports.getCurrentUser = async (req, res) => {
    if (!req.user) {
        return res.json({
            success: true,
            user: null,
            unreadCount: 0,
        });
    }

    try {
        const unreadCount = await Message.countDocuments({
            recipient: req.user._id,
            read: false,
        });

        const userJson = {
            _id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            bio: req.user.bio || "",
            wishlist: req.user.wishlist || [],
            googleId: req.user.googleId || null,
        };

        res.json({
            success: true,
            user: userJson,
            unreadCount,
        });
    } catch (e) {
        res.json({
            success: true,
            user: req.user,
            unreadCount: 0,
        });
    }
};

module.exports.getProfile = async (req, res) => {
    const userId = req.user._id;

    // 1. Fetch user's bookings (with listing details)
    const allBookings = await Booking.find({ user: userId })
        .populate({
            path: "listing",
            populate: { path: "owner", select: "username email" },
        })
        .sort({ checkIn: -1 });

    const now = new Date();
    const upcomingTrips = allBookings
        .filter((b) => b.status === "confirmed" && new Date(b.checkOut) >= now)
        .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));

    const pastTrips = allBookings.filter(
        (b) => b.status === "cancelled" || new Date(b.checkOut) < now
    );

    // 2. Fetch hosted listings owned by user
    const hostedListings = await Listing.find({ owner: userId }).populate("reviews");

    // 3. Fetch incoming reservations on user's hosted listings
    const hostedListingIds = hostedListings.map((l) => l._id);
    const incomingBookings = await Booking.find({
        listing: { $in: hostedListingIds },
    })
        .populate("listing")
        .populate("user", "username email")
        .sort({ checkIn: -1 });

    res.json({
        success: true,
        user: {
            _id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            bio: req.user.bio || "",
            googleId: req.user.googleId || null,
        },
        upcomingTrips,
        pastTrips,
        hostedListings,
        incomingBookings,
    });
};

module.exports.updateProfile = async (req, res) => {
    const bio = (req.body.bio || "").trim().slice(0, 300);
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { bio },
        { new: true }
    );

    res.json({
        success: true,
        message: "Profile updated successfully.",
        user: {
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            bio: updatedUser.bio,
        },
    });
};

module.exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            error: "New password must be at least 6 characters.",
        });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            success: false,
            error: "New passwords do not match.",
        });
    }

    // Google-linked accounts without a local password hash
    if (req.user.googleId && !req.user.hash) {
        return res.status(400).json({
            success: false,
            error: "Google-linked accounts cannot change password directly.",
        });
    }

    try {
        await req.user.changePassword(currentPassword, newPassword);
        req.logout((err) => {
            if (err) console.error("Logout error after password change:", err);
            return res.json({
                success: true,
                message: "Password changed successfully. Please log in again.",
            });
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            error: "Current password is incorrect.",
        });
    }
};
