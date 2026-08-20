const User = require("../models/User.js");
const Listing = require("../models/Listing.js");

module.exports.getWishlist = async (req, res) => {
    const user = await User.findById(req.user._id).populate({
        path: "wishlist",
        populate: { path: "reviews" },
    });

    res.json({
        success: true,
        wishlist: user.wishlist || [],
    });
};

module.exports.toggleWishlist = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const listing = await Listing.findById(id);

    if (!listing) {
        return res.status(404).json({
            success: false,
            error: "Listing not found.",
        });
    }

    const listingIdStr = id.toString();
    const index = user.wishlist.findIndex((item) => item.toString() === listingIdStr);

    let inWishlist = false;
    if (index === -1) {
        user.wishlist.push(id);
        inWishlist = true;
    } else {
        user.wishlist.splice(index, 1);
        inWishlist = false;
    }

    await user.save();

    res.json({
        success: true,
        message: inWishlist ? "Saved to your Wishlist!" : "Removed from your Wishlist.",
        inWishlist,
        wishlist: user.wishlist,
    });
};
