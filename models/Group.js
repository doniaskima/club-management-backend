const mongoose = require("mongoose");


const groupSchema = new mongoose.Schema({
    name: String,
    club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "club",
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    }, ],
}, { timestamps: true });


const Group = mongoose.model("group", groupSchema);
module.exports = Group;