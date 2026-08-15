const Conversation = require("../models/conversation.js");
const Message = require("../models/message.js");
const Listing = require("../models/listing.js");

module.exports.listConversations = async (req, res) => {
    const userId = req.user._id;

    const conversations = await Conversation.find({
        participants: userId,
    })
        .populate("listing")
        .populate("participants")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });

    res.render("inbox/index.ejs", {
        conversations,
        activeConversation: null,
        messages: [],
        recipient: null,
    });
};

module.exports.showConversation = async (req, res) => {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId)
        .populate("listing")
        .populate("participants");

    if (!conversation) {
        req.flash("error", "Conversation not found.");
        return res.redirect("/inbox");
    }

    // Verify user is a participant
    const isParticipant = conversation.participants.some((p) =>
        p._id.equals(userId)
    );
    if (!isParticipant) {
        req.flash("error", "You do not have permission to view this conversation.");
        return res.redirect("/inbox");
    }

    // Mark unread messages sent to current user as read
    await Message.updateMany(
        {
            conversation: conversationId,
            recipient: userId,
            read: false,
        },
        { read: true }
    );

    const messages = await Message.find({
        conversation: conversationId,
    })
        .populate("sender")
        .sort({ createdAt: 1 });

    const recipient = conversation.participants.find(
        (p) => !p._id.equals(userId)
    );

    const conversations = await Conversation.find({
        participants: userId,
    })
        .populate("listing")
        .populate("participants")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });

    res.render("inbox/index.ejs", {
        conversations,
        activeConversation: conversation,
        messages,
        recipient,
    });
};

module.exports.startConversation = async (req, res) => {
    const { listingId } = req.params;
    const userId = req.user._id;

    const listing = await Listing.findById(listingId);
    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    if (listing.owner && listing.owner.equals(userId)) {
        req.flash("error", "You cannot start a conversation with yourself!");
        return res.redirect(`/listings/${listingId}`);
    }

    let conversation = await Conversation.findOne({
        listing: listingId,
        participants: { $all: [userId, listing.owner] },
    });

    if (!conversation) {
        conversation = new Conversation({
            listing: listingId,
            participants: [userId, listing.owner],
        });
        await conversation.save();
    }

    res.redirect(`/inbox/${conversation._id}`);
};

module.exports.sendMessage = async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const messageBody = (req.body.body || (req.body.message && req.body.message.body) || "").trim();

    if (!messageBody) {
        if (req.xhr || req.headers.accept?.includes("json")) {
            return res.status(400).json({ error: "Message cannot be empty." });
        }
        return res.redirect(`/inbox/${conversationId}`);
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        if (req.xhr || req.headers.accept?.includes("json")) {
            return res.status(404).json({ error: "Conversation not found." });
        }
        req.flash("error", "Conversation not found.");
        return res.redirect("/inbox");
    }

    const recipientId = conversation.participants.find((p) => !p.equals(userId));

    const newMessage = new Message({
        conversation: conversationId,
        sender: userId,
        recipient: recipientId,
        body: messageBody,
    });

    await newMessage.save();

    conversation.lastMessage = newMessage._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    if (req.xhr || req.headers.accept?.includes("json")) {
        return res.json({
            success: true,
            message: {
                _id: newMessage._id,
                body: newMessage.body,
                sender: { _id: req.user._id, username: req.user.username },
                createdAt: newMessage.createdAt,
            },
        });
    }

    res.redirect(`/inbox/${conversationId}`);
};
