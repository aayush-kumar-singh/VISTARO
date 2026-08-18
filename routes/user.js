const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const rateLimit = require("express-rate-limit");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const usercontroller = require("../controller/user.js");

// Rate limiters for brute-force protection
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        req.flash("error", "Too many login attempts. Please wait 15 minutes before trying again.");
        res.redirect("/login");
    },
});

const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 signup attempts per hour per IP
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        req.flash("error", "Too many accounts created from this IP. Please try again later.");
        res.redirect("/signup");
    },
});


router.route("/signup")
    .get(usercontroller.rendersignUpForm)
    .post(signupLimiter, wrapAsync(usercontroller.signUpUser));



router.route("/login")
    .get(usercontroller.renderloginForm)
    .post(
        loginLimiter,
        saveRedirectUrl,
        passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
        usercontroller.login
    );

router.get("/logout", usercontroller.logout);

// User Profile & Trips Dashboard
router.get("/profile", isLoggedIn, wrapAsync(usercontroller.renderProfile));

// Update bio (Settings tab)
router.post("/profile/update", isLoggedIn, wrapAsync(usercontroller.updateProfile));

// Change password (Settings tab)
router.post("/profile/change-password", isLoggedIn, wrapAsync(usercontroller.changePassword));

// Google OAuth routes
if (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CALLBACK_URL
) {
    router.get(
        "/auth/google",
        passport.authenticate("google", { scope: ["profile", "email"] })
    );

    router.get(
        "/auth/google/callback",
        passport.authenticate("google", { failureRedirect: "/login" }),
        (req, res) => {
            req.flash("success", "Welcome to Vistaro! You're signed in via Google.");
            res.redirect("/listings");
        }
    );
} else {
    router.get("/auth/google", (req, res) => {
        req.flash("error", "Google authentication is not configured.");
        res.redirect("/login");
    });
}


module.exports = router;
