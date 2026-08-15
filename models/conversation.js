const mongoose = require("mongoose");
const { Schema } = mongoose;

const conversationSchema = new Schema(
    {
        listing: {
            type: Schema.Types.ObjectId,
            ref: "listing",
            required: true,
        },
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
