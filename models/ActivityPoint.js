const mongoose = require("mongoose");

const activityPointSchema = new mongoose.Schema({
    title: String,
    activity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "activities",
        required: true,
    },
    value: {
        type: Number,
        default: 0,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
}, { timestamps: true });

const ActivityPoint = mongoose.model("activityPoints", activityPointSchema);
module.exports = ActivityPoint;