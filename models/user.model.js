const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        trim: true,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    bio: {
        type: String,
    },
    profileUrl: {
        type: String,
    },
    img_url: String,
    cloudinary_id: String,
    isblocked: {
        type: Boolean,
        default: false,
    },
    facebook: String,
    clubs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "club",
    }, ],
}, { timestamps: true });

const User = mongoose.model("user", userSchema);

module.exports = User;