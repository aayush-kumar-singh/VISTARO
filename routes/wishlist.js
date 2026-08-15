const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const wishlistController = require("../controller/wishlist.js");

// View user's wishlist
router.get("/", isLoggedIn, wrapAsync(wishlistController.renderWishlist));

// Toggle wishlist for a listing
router.post("/:id/toggle", isLoggedIn, wrapAsync(wishlistController.toggleWishlist));

module.exports = router;
