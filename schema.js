const JoiBase = require("joi");
const sanitizeHtml = require("sanitize-html");

// Custom Joi extension for HTML sanitization to prevent XSS attacks
const extension = (joi) => ({
    type: "string",
    base: joi.string(),
    messages: {
        "string.escapeHTML": "{{#label}} must not include HTML or script tags!",
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) {
                    return helpers.error("string.escapeHTML", { value });
                }
                return clean;
            },
        },
    },
});

const Joi = JoiBase.extend(extension);

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().escapeHTML().required(),

        description: Joi.string().escapeHTML().required(),

        location: Joi.string().escapeHTML().required(),

        price: Joi.number().min(0).required(),

        country: Joi.string().escapeHTML().required(),

        maxGuests: Joi.number().integer().min(1).optional(),

        amenities: Joi.array().items(Joi.string().escapeHTML()).optional(),

        cancellationPolicy: Joi.string().valid("flexible", "moderate", "strict").optional(),

        category: Joi.string().valid(
            "Beach",
            "Farm",
            "OMG",
            "Arctic",
            "Trending",
            "Lake",
            "Bed & Breakfast"
        ).required(),
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().integer().min(1).max(5).required(),

        comment: Joi.string().trim().escapeHTML().required(),
    }).required(),
});

module.exports.reviewReplySchema = Joi.object({
    reply: Joi.object({
        comment: Joi.string().trim().escapeHTML().required(),
    }).required(),
});

module.exports.bookingSchema = Joi.object({
    booking: Joi.object({
        checkIn: Joi.date().iso().required(),
        checkOut: Joi.date().iso().greater(Joi.ref("checkIn")).required(),
        guests: Joi.number().integer().min(1).optional(),
    }).required(),
});