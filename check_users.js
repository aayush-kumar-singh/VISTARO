require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user.js");

async function checkUsers() {
    const dbUrl = process.env.ATLAS_DB_URL || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wanderlust";
    await mongoose.connect(dbUrl);
    const users = await User.find({}, "username email");
    console.log("USERS_IN_DB:", users);
    await mongoose.disconnect();
}

checkUsers().catch(err => console.error(err));
