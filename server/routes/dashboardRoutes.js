const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware/auth.js");
const dashboardController = require("../controllers/dashboardController.js");

// Host & Owner dashboard KPI metrics
router.get("/", isLoggedIn, wrapAsync(dashboardController.getDashboard));

module.exports = router;
