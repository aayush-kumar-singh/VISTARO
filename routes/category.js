const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const categoryController = require("../controller/category.js");

router.get(
    "/category/:category",
    wrapAsync(categoryController.renderCategory)
);

module.exports = router;