const mongoose = require("mongoose");
const { Schema } = mongoose;

// Ensure related models are registered
require("./User.js");
require("./Destination.js");
require("./Listing.js");
require("./TourPackage.js");
require("./Experience.js");
require("./Transfer.js");

// Ensure lowercase model name aliases exist for seamless dynamic refPath resolution
if (!mongoose.models.tourPackage && mongoose.models.TourPackage) {
    mongoose.model("tourPackage", mongoose.models.TourPackage.schema);
}
if (!mongoose.models.experience && mongoose.models.Experience) {
    mongoose.model("experience", mongoose.models.Experience.schema);
}
if (!mongoose.models.transfer && mongoose.models.Transfer) {
    mongoose.model("transfer", mongoose.models.Transfer.schema);
}
if (!mongoose.models.Listing && mongoose.models.listing) {
    mongoose.model("Listing", mongoose.models.listing.schema);
}

const planItemSchema = new Schema(
    {
        itemType: {
            type: String,
            required: [true, "Item type is required"],
            enum: ["listing", "tourPackage", "experience", "transfer"],
        },
        itemId: {
            type: Schema.Types.ObjectId,
            required: [true, "Item ID reference is required"],
            refPath: "items.itemType",
        },
        notes: {
            type: String,
            trim: true,
            default: "",
        },
        addedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: true }
);

const travelPlanSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Travel plan title is required"],
            trim: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Plan owner reference is required"],
            index: true,
        },
        destination: {
            type: Schema.Types.ObjectId,
            ref: "Destination",
            default: null,
            index: true,
        },
        startDate: {
            type: Date,
            default: null,
        },
        endDate: {
            type: Date,
            default: null,
        },
        items: {
            type: [planItemSchema],
            default: [],
        },
        isArchived: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true }
);

// Helpful index on owner and archived status
travelPlanSchema.index({ owner: 1, isArchived: 1, createdAt: -1 });

const TravelPlan =
    mongoose.models.TravelPlan ||
    mongoose.model("TravelPlan", travelPlanSchema);

module.exports = TravelPlan;
