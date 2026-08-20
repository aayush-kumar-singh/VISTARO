const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const searchController = require("../controllers/searchController.js");

// Search listings
router.get("/", wrapAsync(searchController.searchListings));

module.exports = router;
