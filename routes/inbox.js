const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateObjectId } = require("../middleware.js");
const inboxController = require("../controller/inbox.js");

// List all conversations
router.get("/", isLoggedIn, wrapAsync(inboxController.listConversations));

// Start a conversation with host for a listing
router.post("/start/:listingId", validateObjectId("listingId"), isLoggedIn, wrapAsync(inboxController.startConversation));

// Show a specific conversation
router.get("/:conversationId", validateObjectId("conversationId"), isLoggedIn, wrapAsync(inboxController.showConversation));

// Send a message
router.post("/:conversationId/messages", validateObjectId("conversationId"), isLoggedIn, wrapAsync(inboxController.sendMessage));

module.exports = router;
