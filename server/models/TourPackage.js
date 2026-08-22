const mongoose = require("mongoose");
const { Schema } = mongoose;

const tourPackageSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Tour package title is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, "Tour package slug is required"],
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
        shortDescription: {
            type: String,
            trim: true,
            default: "",
        },
        longDescription: {
            type: String,
            trim: true,
            default: "",
        },
        coverImage: {
            url: {
                type: String,
                required: [true, "Cover image URL is required"],
            },
            filename: {
                type: String,
                default: "",
            },
        },
        galleryImages: [
            {
                url: { type: String, required: true },
                filename: { type: String, default: "" },
            },
        ],
        duration: {
            days: {
                type: Number,
                required: [true, "Duration in days is required"],
                min: [1, "Duration must be at least 1 day"],
                default: 1,
            },
            nights: {
                type: Number,
                required: [true, "Duration in nights is required"],
                min: [0, "Duration nights cannot be negative"],
                default: 0,
            },
        },
        price: {
            basePrice: {
                type: Number,
                required: [true, "Base price per person is required"],
                min: [0, "Price cannot be negative"],
            },
            currency: {
                type: String,
                default: "INR",
                trim: true,
            },
        },
        maxGroupSize: {
            type: Number,
            default: 12,
            min: [1, "Max group size must be at least 1"],
        },
        inclusions: [
            {
                type: String,
                trim: true,
            },
        ],
        exclusions: [
            {
                type: String,
                trim: true,
            },
        ],
        difficultyLevel: {
            type: String,
            enum: ["Easy", "Moderate", "Challenging"],
            default: "Moderate",
        },
        itinerary: [
            {
                dayNumber: {
                    type: Number,
                    required: [true, "Day number is required"],
                    min: [1, "Day number must be at least 1"],
                },
                title: {
                    type: String,
                    required: [true, "Day title is required"],
                    trim: true,
                },
                description: {
                    type: String,
                    trim: true,
                    default: "",
                },
                activities: [
                    {
                        type: String,
                        trim: true,
                    },
                ],
            },
        ],
        reviews: [
            {
                type: Schema.Types.ObjectId,
                ref: "Review",
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
            index: true,
        },
        isTrending: {
            type: Boolean,
            default: false,
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

// Unique index on slug
tourPackageSchema.index({ slug: 1 }, { unique: true });
tourPackageSchema.index({ destination: 1, isActive: 1 });
tourPackageSchema.index({ isActive: 1, isFeatured: 1 });
tourPackageSchema.index({ isActive: 1, isTrending: 1 });
tourPackageSchema.index({ category: 1, isActive: 1 });

// Schema virtuals for flexible property getters/setters
tourPackageSchema.virtual("image").get(function () {
    return this.coverImage;
}).set(function (val) {
    if (typeof val === "string") {
        this.coverImage = { url: val, filename: "" };
    } else {
        this.coverImage = val;
    }
});

tourPackageSchema.virtual("description").get(function () {
    return this.longDescription || this.shortDescription;
}).set(function (val) {
    this.longDescription = val;
});

tourPackageSchema.virtual("basePrice").get(function () {
    return this.price?.basePrice;
}).set(function (val) {
    if (!this.price) this.price = { basePrice: val, currency: "INR" };
    else this.price.basePrice = val;
});

tourPackageSchema.set("toJSON", { virtuals: true });
tourPackageSchema.set("toObject", { virtuals: true });

const TourPackage =
    mongoose.models.TourPackage ||
    mongoose.model("TourPackage", tourPackageSchema);

module.exports = TourPackage;
