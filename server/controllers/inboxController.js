const Conversation = require("../models/Conversation.js");
const Message = require("../models/Message.js");
const Listing = require("../models/Listing.js");

module.exports.listConversations = async (req, res) => {
    const userId = req.user._id;

    const conversations = await Conversation.find({
        participants: userId,
    })
        .populate("listing", "title images image price location country")
        .populate("participants", "username email")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });

    res.json({
        success: true,
        conversations,
    });
};

module.exports.showConversation = async (req, res) => {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId)
        .populate("listing", "title images image price location country owner")
        .populate("participants", "username email");

    if (!conversation) {
        return res.status(404).json({
            success: false,
            error: "Conversation not found.",
        });
    }

    // Verify user is a participant
    const isParticipant = conversation.participants.some((p) =>
        p._id.equals(userId)
    );
    if (!isParticipant) {
        return res.status(403).json({
            success: false,
            error: "You do not have permission to view this conversation.",
        });
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
        .populate("sender", "username email")
        .sort({ createdAt: 1 });

    const recipient = conversation.participants.find(
        (p) => !p._id.equals(userId)
    );

    res.json({
        success: true,
        conversation,
        messages,
        recipient,
    });
};

module.exports.startConversation = async (req, res) => {
    const { listingId } = req.params;
    const userId = req.user._id;

    const listing = await Listing.findById(listingId);
    if (!listing) {
        return res.status(404).json({
            success: false,
            error: "Listing not found.",
        });
    }

    if (listing.owner && listing.owner.equals(userId)) {
        return res.status(400).json({
            success: false,
            error: "You cannot start a conversation with yourself!",
        });
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

    await conversation.populate("listing", "title images image price location country");
    await conversation.populate("participants", "username email");

    res.status(201).json({
        success: true,
        conversation,
    });
};

module.exports.sendMessage = async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const messageBody = (req.body.body || (req.body.message && req.body.message.body) || "").trim();

    if (!messageBody) {
        return res.status(400).json({
            success: false,
            error: "Message cannot be empty.",
        });
    }

    if (messageBody.length > 1000) {
        return res.status(400).json({
            success: false,
            error: "Message cannot exceed 1,000 characters.",
        });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        return res.status(404).json({
            success: false,
            error: "Conversation not found.",
        });
    }

    const isParticipant = conversation.participants.some((p) => p.equals(userId));
    if (!isParticipant) {
        return res.status(403).json({
            success: false,
            error: "You are not a participant in this conversation.",
        });
    }

    const recipientId = conversation.participants.find((p) => !p.equals(userId));

    const newMessage = new Message({
        conversation: conversationId,
        sender: userId,
        recipient: recipientId,
        body: messageBody,
    });

    await newMessage.save();
    await newMessage.populate("sender", "username email");

    conversation.lastMessage = newMessage._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Emit live WebSocket message if Socket.io is initialized on app
    const io = req.app.get("io");
    if (io) {
        io.to(conversationId.toString()).emit("new_message", {
            _id: newMessage._id,
            conversation: conversationId.toString(),
            conversationId: conversationId.toString(),
            body: newMessage.body,
            sender: {
                _id: req.user._id,
                username: req.user.username,
            },
            createdAt: newMessage.createdAt,
        });
    }

    res.status(201).json({
        success: true,
        message: newMessage,
        messageDoc: newMessage,
    });
};
