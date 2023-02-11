const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
    title: String,
    club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "club",
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

const Point = mongoose.model("points", pointSchema);
module.exports = Point;