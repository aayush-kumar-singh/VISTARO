const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: "listing",
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    checkIn: {
        type: Date,
        required: true,
    },
    checkOut: {
        type: Date,
        required: true,
    },
    nights: {
        type: Number,
        required: true,
        min: 1,
    },
    guests: {
        type: Number,
        default: 1,
        min: 1,
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ["confirmed", "cancelled"],
        default: "confirmed",
    },
    policySnapshot: {
        type: String,
        enum: ["flexible", "moderate", "strict"],
        default: "flexible",
    },
    cancellation: {
        reason: { type: String, default: "" },
        cancelledAt: { type: Date },
        cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
        refundAmount: { type: Number, default: 0 },
        refundPercentage: { type: Number, default: 0 },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Booking", bookingSchema);
