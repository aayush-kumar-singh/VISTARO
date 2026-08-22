const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    bookingType: {
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

bookingSchema.index({ user: 1, checkIn: -1 });
bookingSchema.index({ user: 1, bookingType: 1, checkIn: -1 });
bookingSchema.index({ listing: 1, checkIn: 1, checkOut: 1, status: 1 });

module.exports = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
