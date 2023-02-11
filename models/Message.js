const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    original_filename: String,
    room_id: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Message = mongoose.model("message", messageSchema);
module.exports = Message;