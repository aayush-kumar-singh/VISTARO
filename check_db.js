require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

async function checkListings() {
    const dbUrl = process.env.ATLAS_DB_URL || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wanderlust";
    await mongoose.connect(dbUrl);
    const count = await Listing.countDocuments();
    const sample = await Listing.find({}).limit(3);
    console.log("LISTINGS_COUNT:", count);
    console.log("SAMPLE_LISTINGS:", sample.map(l => ({ id: l._id, title: l.title, price: l.price })));
    await mongoose.disconnect();
}

checkListings().catch(err => console.error(err));
