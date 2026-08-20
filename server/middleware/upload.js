const multer = require("multer");
const { storage } = require("../config/cloudinary.js");

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

const handleImageUpload = (fieldName = "images") => {
    return (req, res, next) => {
        // Handle either "images" or "listing[images]"
        upload.any()(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({
                        success: false,
                        error: "One or more images exceed the 5MB limit. Please upload smaller photos.",
                    });
                } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
                    return res.status(400).json({
                        success: false,
                        error: "You can upload a maximum of 5 images per listing.",
                    });
                } else {
                    return res.status(400).json({
                        success: false,
                        error: `Upload error: ${err.message}`,
                    });
                }
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    error: err.message || "Failed to upload images. Please try again.",
                });
            }

            // If files were uploaded, ensure req.files has up to 5 images
            if (req.files && req.files.length > 5) {
                return res.status(400).json({
                    success: false,
                    error: "You can upload a maximum of 5 images per listing.",
                });
            }

            next();
        });
    };
};

module.exports = {
    upload,
    handleImageUpload,
};
