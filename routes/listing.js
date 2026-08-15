const express = require("express");
const router = express.Router();

const {
    isLoggedIn,
    isOwner,
    validateListing,
    validateObjectId,
} = require("../middleware.js");

const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controller/listing.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: (req, file, cb) => {
        const allowedMimes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only JPEG, PNG, and WebP images are allowed."));
        }
    },
});

// Middleware to gracefully handle multiple image upload errors
const handleImageUpload = (req, res, next) => {
    upload.array("listing[images]", 5)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                req.flash("error", "One or more images exceed the 5MB limit. Please upload smaller photos.");
            } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
                req.flash("error", "You can upload a maximum of 5 images per listing.");
            } else {
                req.flash("error", `Upload error: ${err.message}`);
            }
            const redirectPath = req.params.id ? `/listings/${req.params.id}/edit` : "/listings/new";
            return res.redirect(redirectPath);
        } else if (err) {
            req.flash("error", err.message || "Failed to upload images. Please try again.");
            const redirectPath = req.params.id ? `/listings/${req.params.id}/edit` : "/listings/new";
            return res.redirect(redirectPath);
        }
        next();
    });
};


// All listings + Create listing
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        handleImageUpload,
        validateListing,
        wrapAsync(listingController.createListing)
    );


// New listing form
router.get(
    "/new",
    isLoggedIn,
    wrapAsync(listingController.rendernewForm)
);


// Individual listing
router
    .route("/:id")
    .get(validateObjectId("id"), wrapAsync(listingController.showsallListings))
    .put(
        validateObjectId("id"),
        isLoggedIn,
        isOwner,
        handleImageUpload,
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        validateObjectId("id"),
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListing)
    );


// Edit listing form
router.get(
    "/:id/edit",
    validateObjectId("id"),
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.rendereditForm)
);


module.exports = router;