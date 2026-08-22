const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const supportController = require("../controllers/supportController.js");
const { contactLimiter } = require("../middleware/rateLimiter.js");

// POST /api/support/contact — Public contact form submission
router.post("/contact", contactLimiter, wrapAsync(supportController.submitContactForm));

module.exports = router;
