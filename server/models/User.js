const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
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
            type: Schema.Types.ObjectId,
            ref: "listing",
        },
    ],
    recentlyViewed: [
        {
            type: Schema.Types.ObjectId,
            ref: "listing",
        },
    ],
    bio: {
        type: String,
        default: "",
        maxlength: 300,
        trim: true,
    },
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
