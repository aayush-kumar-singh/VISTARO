const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateObjectId } = require("../middleware/auth.js");
const wishlistController = require("../controllers/wishlistController.js");

// View user's wishlist
router.get("/", isLoggedIn, wrapAsync(wishlistController.getWishlist));

// Toggle wishlist item
router.post("/:id/toggle", validateObjectId("id"), isLoggedIn, wrapAsync(wishlistController.toggleWishlist));

module.exports = router;
