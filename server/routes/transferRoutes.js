const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const transferController = require("../controllers/transferController.js");

// Public Read-Only Transfer Routes
router.get("/", wrapAsync(transferController.index));
router.get("/:id", wrapAsync(transferController.getTransferById));

module.exports = router;
