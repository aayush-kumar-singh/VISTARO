
const listings = require("../models/listing.js");

module.exports.renderCategory = async (req, res) => {
    const category = decodeURIComponent(req.params.category);

    const alisting = await listings.find({
        category: category,
    }).populate("reviews");

    res.render("listings/category.ejs", {
        category,
        alisting,
    });
};


