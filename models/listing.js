
const mongoose = require("mongoose");
const { Schema } = mongoose;

const Review = require("./review.js");



const listingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        image: {
            url: String,
            filename: String,
        },
        images: [
            {
                url: String,
                filename: String,
            },
        ],
        price: {
            type: Number,
            required: true
        },
        maxGuests: {
            type: Number,
            default: 4,
            min: 1,
        },
        amenities: [
            {
                type: String,
            },
        ],
        cancellationPolicy: {
            type: String,
            enum: ["flexible", "moderate", "strict"],
            default: "flexible",
        },
        location: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        reviews: [
            {
                type: Schema.Types.ObjectId,
                ref: "Review",
            },
        ],
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        geometry: {
            type: {
                type: String, // Don't do `{ location: { type: String } }`
                enum: ['Point'], // 'location.type' must be 'Point'
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            }
        },
        category: {
            type: String,
            enum: [
                "Beach",
                "Farm",
                "OMG",
                "Arctic",
                "Trending",
                "Lake",
                "Bed & Breakfast",
            ],
            required: true,
        },

    }
);

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

// Ensure images array and single image property are always synchronized
listingSchema.post("init", function () {
    if ((!this.images || this.images.length === 0) && this.image && this.image.url) {
        this.images = [this.image];
    } else if (this.images && this.images.length > 0 && (!this.image || !this.image.url)) {
        this.image = this.images[0];
    }
});

listingSchema.pre("save", function (next) {
    if (this.images && this.images.length > 0) {
        this.image = this.images[0];
    } else if (this.image && this.image.url) {
        this.images = [this.image];
    }
    next();
});

const listing = mongoose.model("listing", listingSchema);

module.exports = listing;

