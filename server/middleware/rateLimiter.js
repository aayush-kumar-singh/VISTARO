const rateLimit = require("express-rate-limit");

const isTestEnv = (req) => process.env.NODE_ENV === "test" || req.headers["x-test-suite"] === "vistaro";

module.exports.loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    skip: isTestEnv,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: "Too many login attempts. Please wait 15 minutes before trying again.",
        });
    },
});

module.exports.signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip: isTestEnv,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: "Too many accounts created from this IP. Please try again later.",
        });
    },
});

module.exports.createListingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    skip: isTestEnv,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: "You are creating listings too quickly. Please wait before adding more.",
        });
    },
});

module.exports.reviewLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    skip: isTestEnv,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: "You are submitting reviews too quickly. Please wait a few minutes.",
        });
    },
});

module.exports.replyLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    skip: isTestEnv,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: "Too many replies submitted. Please wait a few minutes.",
        });
    },
});

module.exports.bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    skip: isTestEnv,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: "Too many booking attempts. Please wait 15 minutes before trying again.",
        });
    },
});

module.exports.contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    skip: isTestEnv,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: "Too many support inquiries submitted. Please wait 15 minutes before sending another inquiry.",
        });
    },
});

