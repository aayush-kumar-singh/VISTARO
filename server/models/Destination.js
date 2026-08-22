const mongoose = require("mongoose");
const { Schema } = mongoose;

const destinationSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Destination name is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, "Destination slug is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        state: {
            type: String,
            trim: true,
            default: "",
        },
        country: {
            type: String,
            required: true,
            trim: true,
            default: "India",
        },
        shortTagline: {
            type: String,
            required: [true, "Short tagline is required"],
            trim: true,
        },
        longDescription: {
            type: String,
            trim: true,
            default: "",
        },
        heroImage: {
            url: {
                type: String,
                required: [true, "Hero image URL is required"],
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
        bestFor: [
            {
                type: String,
                trim: true,
            },
        ],
        identityTags: [
            {
                type: String,
                trim: true,
            },
        ],
        coordinates: {
            lat: {
                type: Number,
                default: 0,
            },
            lng: {
                type: Number,
                default: 0,
            },
        },
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
    },
    { timestamps: true }
);

// Explicit unique index on slug for fast lookups
destinationSchema.index({ slug: 1 }, { unique: true });

// Schema virtuals for flexible property naming (tagline -> shortTagline, description -> longDescription)
destinationSchema.virtual("tagline").get(function () {
    return this.shortTagline;
}).set(function (val) {
    this.shortTagline = val;
});

destinationSchema.virtual("description").get(function () {
    return this.longDescription;
}).set(function (val) {
    this.longDescription = val;
});

destinationSchema.virtual("image").get(function () {
    return this.heroImage;
}).set(function (val) {
    if (typeof val === "string") {
        this.heroImage = { url: val, filename: "" };
    } else {
        this.heroImage = val;
    }
});

destinationSchema.set("toJSON", { virtuals: true });
destinationSchema.set("toObject", { virtuals: true });

const Destination =
    mongoose.models.Destination ||
    mongoose.model("Destination", destinationSchema);

module.exports = Destination;
