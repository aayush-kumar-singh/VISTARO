const User = require("../models/user");
const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");

module.exports.rendersignUpForm = (req, res) => {
    res.render("user/signup.ejs");
};

module.exports.signUpUser = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;

        // Check if username or email already exists
        let existingUser = await User.findOne({
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
            req.flash(
                "error",
                "Username or email is already registered. Please login."
            );
            return res.redirect("/signup");
        }

        // Create new user
        let newUser = new User({
            username: username,
            email: email,
        });

        // Register user using passport-local-mongoose
        let registeredUser = await User.register(newUser, password);

        // Automatically login after signup
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }

            req.flash("success", "Welcome to Vistaro! Start exploring unique stays.");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderloginForm = (req, res) => {
    res.render("user/login.ejs");
};

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back to Vistaro!");

    let redirectUrl = res.locals.redirectUrl || "/listings";

    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.flash("success", "Logout successful");
        res.redirect("/listings");
    });
};

module.exports.renderProfile = async (req, res) => {
    const userId = req.user._id;

    // 1. Fetch user's bookings (with listing details)
    const allBookings = await Booking.find({ user: userId })
        .populate({
            path: "listing",
            populate: { path: "owner" },
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
    const hostedListings = await Listing.find({ owner: userId });

    // 3. Fetch incoming reservations on user's hosted listings
    const hostedListingIds = hostedListings.map((l) => l._id);
    const incomingBookings = await Booking.find({
        listing: { $in: hostedListingIds },
    })
        .populate("listing")
        .populate("user")
        .sort({ checkIn: -1 });

    res.render("user/profile.ejs", {
        user: req.user,
        upcomingTrips,
        pastTrips,
        hostedListings,
        incomingBookings,
    });
};

// 1.4: Update bio from Settings tab
module.exports.updateProfile = async (req, res) => {
    const bio = (req.body.bio || "").trim().slice(0, 300);
    await User.findByIdAndUpdate(req.user._id, { bio });
    req.flash("success", "Profile updated successfully.");
    res.redirect("/profile#settings");
};

// 1.4: Change password from Settings tab
module.exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        req.flash("error", "New password must be at least 6 characters.");
        return res.redirect("/profile#settings");
    }

    if (newPassword !== confirmPassword) {
        req.flash("error", "New passwords do not match.");
        return res.redirect("/profile#settings");
    }

    // Google-linked accounts have no local password
    if (req.user.googleId && !req.user.hash) {
        req.flash("error", "Google-linked accounts cannot change their password here.");
        return res.redirect("/profile#settings");
    }

    try {
        await req.user.changePassword(currentPassword, newPassword);
        req.flash("success", "Password changed successfully. Please log in again.");
        req.logout((err) => {
            if (err) console.error("Logout error after password change:", err);
            res.redirect("/login");
        });
    } catch (err) {
        req.flash("error", "Current password is incorrect.");
        res.redirect("/profile#settings");
    }
};