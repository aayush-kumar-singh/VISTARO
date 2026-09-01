const mongoose = require("mongoose");
const { Schema } = mongoose;

require("./Destination.js");
require("./User.js");

const transferSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Transfer title is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, "Transfer slug is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        destination: {
            type: Schema.Types.ObjectId,
            ref: "Destination",
            required: [true, "Destination reference is required"],
            index: true,
        },
        transferType: {
            type: String,
            enum: [
                "airport-pickup",
                "airport-drop",
                "intercity",
                "local-day-hire",
                "scenic-drive",
            ],
            default: "airport-pickup",
            required: [true, "Transfer type is required"],
            index: true,
        },
        vehicleType: {
            type: String,
            enum: [
                "Sedan",
                "SUV",
                "Luxury SUV",
                "Tempo Traveller",
                "Bike / Cruiser",
            ],
            default: "SUV",
            required: [true, "Vehicle type is required"],
        },
        capacity: {
            type: Number,
            required: [true, "Passenger capacity is required"],
            min: [1, "Capacity must be at least 1 passenger"],
            default: 4,
        },
        price: {
            basePrice: {
                type: Number,
                required: [true, "Base price is required"],
                min: [0, "Price cannot be negative"],
            },
            currency: {
                type: String,
                default: "INR",
                trim: true,
            },
        },
        priceUnit: {
            type: String,
            enum: ["per-trip", "per-day", "per-hour"],
            default: "per-trip",
            required: [true, "Price unit is required"],
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        pickupLocation: {
            type: String,
            trim: true,
            default: "",
        },
        dropLocation: {
            type: String,
            trim: true,
            default: "",
        },
        estimatedDuration: {
            type: String,
            trim: true,
            default: "",
        },
        includedFeatures: [
            {
                type: String,
                trim: true,
            },
        ],
        coverImage: {
            url: {
                type: String,
                required: [true, "Cover image URL is required"],
                default: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80",
            },
            filename: {
                type: String,
                default: "",
            },
        },
        cancellationPolicy: {
            type: String,
            enum: ["flexible", "moderate", "strict"],
            default: "flexible",
        },
        driverIncluded: {
            type: Boolean,
            default: false,
            index: true,
        },
        driver: {
            name: {
                type: String,
                trim: true,
                default: "",
            },
            photo: {
                url: {
                    type: String,
                    default: "",
                },
                filename: {
                    type: String,
                    default: "",
                },
            },
            experienceYears: {
                type: Number,
                min: 0,
                default: 0,
            },
            languages: [
                {
                    type: String,
                    trim: true,
                },
            ],
            rating: {
                type: Number,
                min: 0,
                max: 5,
                default: null,
            },
            isVerified: {
                type: Boolean,
                default: false,
            },
        },
        vehicleDetails: {
            registrationNumber: {
                type: String,
                trim: true,
                default: "",
            },
            luggageCapacity: {
                type: Number,
                min: 0,
                default: 2,
            },
            hasAC: {
                type: Boolean,
                default: true,
            },
            features: [
                {
                    type: String,
                    trim: true,
                },
            ],
            image: {
                url: {
                    type: String,
                    default: "",
                },
                filename: {
                    type: String,
                    default: "",
                },
            },
            isVerified: {
                type: Boolean,
                default: false,
            },
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

transferSchema.index({ driverIncluded: 1, isActive: 1 });

// Indexes
transferSchema.index({ slug: 1 }, { unique: true });
transferSchema.index({ destination: 1, transferType: 1, isActive: 1 });

// Schema virtuals for flexible property access
transferSchema.virtual("image").get(function () {
    return this.coverImage;
}).set(function (val) {
    if (typeof val === "string") {
        this.coverImage = { url: val, filename: "" };
    } else {
        this.coverImage = val;
    }
});

transferSchema.virtual("basePrice").get(function () {
    return this.price?.basePrice;
}).set(function (val) {
    if (!this.price) this.price = { basePrice: val, currency: "INR" };
    else this.price.basePrice = val;
});

transferSchema.virtual("inclusions").get(function () {
    return this.includedFeatures;
}).set(function (val) {
    this.includedFeatures = val;
});

transferSchema.set("toJSON", { virtuals: true });
transferSchema.set("toObject", { virtuals: true });

const Transfer =
    mongoose.models.Transfer ||
    mongoose.model("Transfer", transferSchema);

// Register alias 'transfer' for dynamic refPath compatibility
if (!mongoose.models.transfer) {
    mongoose.model("transfer", transferSchema);
}

module.exports = Transfer;
