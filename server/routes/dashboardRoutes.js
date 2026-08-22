const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isHostOrAdmin } = require("../middleware/auth.js");
const dashboardController = require("../controllers/dashboardController.js");

// Host & Owner dashboard KPI metrics (Host or Admin role required)
router.get("/", isLoggedIn, isHostOrAdmin, wrapAsync(dashboardController.getDashboard));

module.exports = router;
