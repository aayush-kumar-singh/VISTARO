const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateObjectId } = require("../middleware/auth.js");
const { validateListing } = require("../middleware/validate.js");
const { handleImageUpload } = require("../middleware/upload.js");
const { createListingLimiter } = require("../middleware/rateLimiter.js");
const listingController = require("../controllers/listingController.js");

// Get all listings & create listing
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        createListingLimiter,
        isLoggedIn,
        handleImageUpload("images"),
        validateListing,
        wrapAsync(listingController.createListing)
    );

// Individual listing operations
router
    .route("/:id")
    .get(validateObjectId("id"), wrapAsync(listingController.getListingById))
    .put(
        validateObjectId("id"),
        isLoggedIn,
        isOwner,
        handleImageUpload("images"),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        validateObjectId("id"),
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListing)
    );

module.exports = router;
