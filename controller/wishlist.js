const User = require("../models/user.js");
const Listing = require("../models/listing.js");

module.exports.toggleWishlist = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const listing = await Listing.findById(id);

    if (!listing) {
        if (req.xhr || req.headers.accept?.includes("json")) {
            return res.status(404).json({ error: "Listing not found" });
        }
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
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

    if (req.xhr || req.headers.accept?.includes("json")) {
        return res.json({ success: true, inWishlist });
    }

    req.flash(
        "success",
        inWishlist ? "Saved to your Wishlist!" : "Removed from your Wishlist."
    );
    res.redirect(req.get("referer") || `/listings/${id}`);
};

module.exports.renderWishlist = async (req, res) => {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.render("listings/wishlist.ejs", {
        wishlist: user.wishlist || [],
    });
};
