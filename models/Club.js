mongoose = require("mongoose");

const clubSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    img_url: String,
    cloudinary_id: String,
    description: String,
    fund: {
        type: String,
        default: 0,
    },
    leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    }, ],

    monthlyFund: {
        type: Number,
        default: 0,
    },
    monthlyFundPoint: {
        type: Number,
        default: 0,
    },
    treasurer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    isblocked: {
        type: Boolean,
        default: false,
    },
});

const Club = mongoose.model("club", clubSchema);
module.exports = Club;