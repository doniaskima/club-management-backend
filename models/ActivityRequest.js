const mongoose = require("mongoose");



const activityRequestSchema = new mongoose.Schema({
    club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "club",
        required: true,
    },
    activity: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
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
    },
    status: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const ActivityRequest = mongoose.model(
    "activityRequests",
    activityRequestSchema
);
module.exports = ActivityRequest;