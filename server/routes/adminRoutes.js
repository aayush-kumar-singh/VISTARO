const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isAdmin, validateObjectId } = require("../middleware/auth.js");
const { handleImageUpload } = require("../middleware/upload.js");
const adminController = require("../controllers/adminController.js");

// Require authentication & admin role on all admin routes
router.use(isLoggedIn, isAdmin);

// GET /api/admin/stats — Platform overview metrics
router.get("/stats", wrapAsync(adminController.getStats));

// GET /api/admin/users — List all users with stats
router.get("/users", wrapAsync(adminController.getAllUsers));

// PATCH /api/admin/users/:id/role — Change user role
router.patch(
    "/users/:id/role",
    validateObjectId("id"),
    wrapAsync(adminController.updateUserRole)
);

// DELETE /api/admin/users/:id — Admin delete user
router.delete(
    "/users/:id",
    validateObjectId("id"),
    wrapAsync(adminController.deleteUserAdmin)
);

// DELETE /api/admin/listings/:id — Admin delete listing
router.delete(
    "/listings/:id",
    validateObjectId("id"),
    wrapAsync(adminController.deleteListingAdmin)
);

// --------------------------------------------------
// Destination Management Endpoints (Admin Only)
// --------------------------------------------------
// POST /api/admin/destinations — Create Destination
router.post("/destinations", wrapAsync(adminController.createDestinationAdmin));

// PATCH /api/admin/destinations/:id — Update Destination
router.patch(
    "/destinations/:id",
    validateObjectId("id"),
    wrapAsync(adminController.updateDestinationAdmin)
);

// DELETE /api/admin/destinations/:id — Soft-delete (Deactivate) Destination
router.delete(
    "/destinations/:id",
    validateObjectId("id"),
    wrapAsync(adminController.deactivateDestinationAdmin)
);

// --------------------------------------------------
// Tour Package Management Endpoints (Admin Only)
// --------------------------------------------------
// GET /api/admin/tour-packages — List all packages
router.get("/tour-packages", wrapAsync(adminController.getAllTourPackagesAdmin));

// POST /api/admin/tour-packages — Create Package
router.post(
    "/tour-packages",
    handleImageUpload("images"),
    wrapAsync(adminController.createTourPackageAdmin)
);

// PATCH /api/admin/tour-packages/:id — Update Package
router.patch(
    "/tour-packages/:id",
    validateObjectId("id"),
    handleImageUpload("images"),
    wrapAsync(adminController.updateTourPackageAdmin)
);

// DELETE /api/admin/tour-packages/:id — Soft-delete (Deactivate) Package
router.delete(
    "/tour-packages/:id",
    validateObjectId("id"),
    wrapAsync(adminController.deactivateTourPackageAdmin)
);

// --------------------------------------------------
// Experience Management Endpoints (Admin Only)
// --------------------------------------------------
// GET /api/admin/experiences — List all experiences
router.get("/experiences", wrapAsync(adminController.getAllExperiencesAdmin));

// POST /api/admin/experiences — Create Experience
router.post(
    "/experiences",
    handleImageUpload("images"),
    wrapAsync(adminController.createExperienceAdmin)
);

// PATCH /api/admin/experiences/:id — Update Experience
router.patch(
    "/experiences/:id",
    validateObjectId("id"),
    handleImageUpload("images"),
    wrapAsync(adminController.updateExperienceAdmin)
);

// DELETE /api/admin/experiences/:id — Soft-delete (Deactivate) Experience
router.delete(
    "/experiences/:id",
    validateObjectId("id"),
    wrapAsync(adminController.deactivateExperienceAdmin)
);

module.exports = router;

