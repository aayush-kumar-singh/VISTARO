const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },

    googleId: {
        type: String,
        default: null,
    },

    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "listing",
        },
    ],

    recentlyViewed: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "listing",
        },
    ],
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);