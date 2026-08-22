const mongoose = require("mongoose");
const { Schema } = mongoose;

const experienceSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Experience title is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, "Experience slug is required"],
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
        category: {
            type: String,
            enum: [
                "Adventure",
                "Cultural",
                "Food & Drink",
                "Nature",
                "Wellness",
                "Photography",
                "Workshop",
            ],
            default: "Adventure",
            required: [true, "Experience category is required"],
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
        durationHours: {
            type: Number,
            required: [true, "Duration in hours is required"],
            min: [0.5, "Duration must be at least 30 minutes (0.5 hours)"],
            default: 2,
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
            default: 10,
            min: [1, "Max group size must be at least 1"],
        },
        whatsIncluded: [
            {
                type: String,
                trim: true,
            },
        ],
        meetingPoint: {
            type: String,
            trim: true,
            default: "",
        },
        difficultyLevel: {
            type: String,
            enum: ["Easy", "Moderate", "Challenging"],
            default: "Easy",
        },
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
experienceSchema.index({ slug: 1 }, { unique: true });

// Schema virtuals for flexible property getters/setters
experienceSchema.virtual("image").get(function () {
    return this.coverImage;
}).set(function (val) {
    if (typeof val === "string") {
        this.coverImage = { url: val, filename: "" };
    } else {
        this.coverImage = val;
    }
});

experienceSchema.virtual("description").get(function () {
    return this.longDescription || this.shortDescription;
}).set(function (val) {
    this.longDescription = val;
});

experienceSchema.virtual("basePrice").get(function () {
    return this.price?.basePrice;
}).set(function (val) {
    if (!this.price) this.price = { basePrice: val, currency: "INR" };
    else this.price.basePrice = val;
});

experienceSchema.virtual("inclusions").get(function () {
    return this.whatsIncluded;
}).set(function (val) {
    this.whatsIncluded = val;
});

experienceSchema.set("toJSON", { virtuals: true });
experienceSchema.set("toObject", { virtuals: true });

const Experience =
    mongoose.models.Experience ||
    mongoose.model("Experience", experienceSchema);

module.exports = Experience;
