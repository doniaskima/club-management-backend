const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema({
    room_id: {
        type: String,
        required: true,
    },
}, { timestamps: true });


const ChatRoom = mongoose.model("chtaRoom", chatRoomSchema);
module.exports = ChatRoom;