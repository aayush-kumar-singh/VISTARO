const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema({
    comment: {
        type: String,
        required: true,
        trim: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    targetType: {
        type: String,
        enum: ["stay", "package", "experience"],
        default: "stay",
        index: true,
    },
    listing: {
        type: Schema.Types.ObjectId,
        ref: "listing",
        default: null,
    },
    tourPackage: {
        type: Schema.Types.ObjectId,
        ref: "TourPackage",
        default: null,
    },
    experience: {
        type: Schema.Types.ObjectId,
        ref: "Experience",
        default: null,
    },
    booking: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
        default: null,
    },
    ownerReply: {
        comment: {
            type: String,
            trim: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
});

module.exports = mongoose.models.Review || mongoose.model("Review", reviewSchema);
