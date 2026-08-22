const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateObjectId } = require("../middleware/auth.js");
const travelPlanController = require("../controllers/travelPlanController.js");

// 1. Create a new travel plan (Authenticated user only)
router.post(
    "/",
    isLoggedIn,
    wrapAsync(travelPlanController.createPlan)
);

// 2. List the requesting user's plans only
router.get(
    "/",
    isLoggedIn,
    wrapAsync(travelPlanController.getUserPlans)
);

// 3. Get a single plan by ID (Owner only, 404 otherwise)
router.get(
    "/:id",
    validateObjectId("id"),
    isLoggedIn,
    wrapAsync(travelPlanController.getPlanById)
);

// 4. Update a travel plan (Owner only)
router.patch(
    "/:id",
    validateObjectId("id"),
    isLoggedIn,
    wrapAsync(travelPlanController.updatePlan)
);

// 5. Delete / Archive a travel plan (Owner only)
router.delete(
    "/:id",
    validateObjectId("id"),
    isLoggedIn,
    wrapAsync(travelPlanController.deletePlan)
);

// 6. Add Item (Listing, TourPackage, Experience) to a travel plan (Owner only)
router.post(
    "/:id/items",
    validateObjectId("id"),
    isLoggedIn,
    wrapAsync(travelPlanController.addItemToPlan)
);

// 7. Remove an Item from a travel plan (Owner only)
router.delete(
    "/:id/items/:itemSubDocId",
    validateObjectId("id"),
    validateObjectId("itemSubDocId"),
    isLoggedIn,
    wrapAsync(travelPlanController.removeItemFromPlan)
);

module.exports = router;
