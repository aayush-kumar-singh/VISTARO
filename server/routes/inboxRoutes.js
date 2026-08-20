const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateObjectId } = require("../middleware/auth.js");
const inboxController = require("../controllers/inboxController.js");

// List all conversations
router.get("/", isLoggedIn, wrapAsync(inboxController.listConversations));

// Start or get conversation with host for listing
router.post("/start/:listingId", validateObjectId("listingId"), isLoggedIn, wrapAsync(inboxController.startConversation));

// Show specific conversation history
router.get("/:conversationId", validateObjectId("conversationId"), isLoggedIn, wrapAsync(inboxController.showConversation));

// Send a message
router.post("/:conversationId/messages", validateObjectId("conversationId"), isLoggedIn, wrapAsync(inboxController.sendMessage));

module.exports = router;
