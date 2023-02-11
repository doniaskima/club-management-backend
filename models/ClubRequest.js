const mongoose = require("mongoose");

const clubRequestSchema = new mongoose.Schema({
    club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "club",
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    type: {
        type: String,
        lowercase: true,
        // invite/ask
    },
    status: {
        type: Number,
        default: 0,
        // 0: wait, 1: accept, 2: cancel
    },
}, { timestamps: true });

const ClubRequest = mongoose.model("clubRequests", clubRequestSchema);
module.exports = ClubRequest;