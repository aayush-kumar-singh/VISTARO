const JoiBase = require("joi");
const sanitizeHtml = require("sanitize-html");
const ExpressError = require("../utils/ExpressError.js");

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

const listingSchema = Joi.object({
    title: Joi.string().escapeHTML().min(3).max(150).required(),
    description: Joi.string().escapeHTML().min(10).max(5000).required(),
    location: Joi.string().escapeHTML().min(2).max(100).required(),
    price: Joi.number().min(0).max(10000000).required(),
    country: Joi.string().escapeHTML().min(2).max(100).required(),
    maxGuests: Joi.number().integer().min(1).max(50).optional(),
    amenities: Joi.array().items(Joi.string().escapeHTML()).optional(),
    cancellationPolicy: Joi.string().valid("flexible", "moderate", "strict").optional(),
    destination: Joi.string().allow("", null).optional(),
    category: Joi.string().valid(
        "Beach",
        "Farm",
        "OMG",
        "Arctic",
        "Trending",
        "Lake",
        "Bed & Breakfast"
    ).required(),
}).unknown(true);

const reviewSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().trim().escapeHTML().min(5).max(2000).required(),
}).unknown(true);

const reviewReplySchema = Joi.object({
    comment: Joi.string().trim().escapeHTML().min(3).max(1000).required(),
}).unknown(true);

const bookingSchema = Joi.object({
    checkIn: Joi.date().iso().required(),
    checkOut: Joi.date().iso().greater(Joi.ref("checkIn")).required(),
    guests: Joi.number().integer().min(1).max(50).optional(),
}).unknown(true);

module.exports.validateListing = (req, res, next) => {
    // Support either req.body or req.body.listing
    const dataToValidate = req.body.listing || req.body;
    
    // Parse amenities if it's sent as a JSON string or comma-separated
    if (typeof dataToValidate.amenities === "string") {
        try {
            dataToValidate.amenities = JSON.parse(dataToValidate.amenities);
        } catch (e) {
            dataToValidate.amenities = dataToValidate.amenities.split(",").map(a => a.trim()).filter(Boolean);
        }
    }

    const { error, value } = listingSchema.validate(dataToValidate);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(", ");
        return res.status(400).json({ success: false, error: errMsg });
    }
    req.validatedListing = value;
    next();
};

module.exports.validateReview = (req, res, next) => {
    const dataToValidate = req.body.review || req.body;
    const { error, value } = reviewSchema.validate(dataToValidate);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(", ");
        return res.status(400).json({ success: false, error: errMsg });
    }
    req.validatedReview = value;
    next();
};

module.exports.validateReviewReply = (req, res, next) => {
    const dataToValidate = req.body.reply || req.body;
    const { error, value } = reviewReplySchema.validate(dataToValidate);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(", ");
        return res.status(400).json({ success: false, error: errMsg });
    }
    req.validatedReply = value;
    next();
};

module.exports.validateBooking = (req, res, next) => {
    const dataToValidate = req.body.booking || req.body;
    const { error, value } = bookingSchema.validate(dataToValidate);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(", ");
        return res.status(400).json({ success: false, error: errMsg });
    }
    req.validatedBooking = value;
    next();
};
