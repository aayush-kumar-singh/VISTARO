const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware/auth.js");
const { loginLimiter, signupLimiter } = require("../middleware/rateLimiter.js");
const authController = require("../controllers/authController.js");

// Registration
router.post("/signup", signupLimiter, wrapAsync(authController.signUpUser));

// Login
router.post(
    "/login",
    loginLimiter,
    passport.authenticate("local"),
    authController.login
);

// Logout
router.post("/logout", authController.logout);
router.get("/logout", authController.logout);

// Current User session check
router.get("/current-user", wrapAsync(authController.getCurrentUser));

// User Profile & Host Access
router.get("/profile", isLoggedIn, wrapAsync(authController.getProfile));
router.put("/profile", isLoggedIn, wrapAsync(authController.updateProfile));
router.put("/change-password", isLoggedIn, wrapAsync(authController.changePassword));
router.post("/request-host", isLoggedIn, wrapAsync(authController.requestHostAccess));

// Google OAuth routes
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    router.get(
        "/google",
        passport.authenticate("google", { scope: ["profile", "email"] })
    );

    router.get(
        "/google/callback",
        passport.authenticate("google", { failureRedirect: "/login" }),
        (req, res) => {
            const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
            res.redirect(clientUrl);
        }
    );
}

module.exports = router;
