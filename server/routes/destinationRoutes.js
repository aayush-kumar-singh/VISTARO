const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const destinationController = require("../controllers/destinationController.js");

// Public Read-Only Destination Routes
router.get("/", wrapAsync(destinationController.index));
router.get("/:slug", wrapAsync(destinationController.getDestinationBySlug));

module.exports = router;
