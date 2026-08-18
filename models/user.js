const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
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

    bio: {
        type: String,
        default: "",
        maxlength: 300,
        trim: true,
    },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);