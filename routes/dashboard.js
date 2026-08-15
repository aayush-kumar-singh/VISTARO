const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const dashboardController = require("../controller/dashboard.js");

router.get("/", isLoggedIn, wrapAsync(dashboardController.renderDashboard));

module.exports = router;
