const mongoose = require("mongoose");

const clubLogSchema = new mongoose.Schema({
    club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "club",
        required: true,
    },
    type: {
        type: String,
        lowercase: true,
    },
    content: {
        type: String,
    },
}, { timestamps: true });

const ClubLog = mongoose.model("clubLogs", clubLogSchema);
module.exports = ClubLog;