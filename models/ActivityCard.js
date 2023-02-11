const mongoose = require("mongoose");
const Activity = require("./Activity");
const async = require("async");
const cloudinary = require("../helper/Cloudinary");
const { isElementInArray } = require("../helper/ArrayHelper");

const activityCardSchema = new mongoose.Schema({
    activity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "activities",
    },
    title: {
        type: String,
        required: true,
    },
    description: String,
    files: [{
        original_filename: String,
        url: String,
        public_id: String,
    }, ],
    userJoin: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    }, ],
    groupJoin: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "group",
    }, ],
    comments: [{
        content: String,
        createdAt: Date,
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
    }, ],
    pointValue: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

activityCardSchema.pre("remove", function(next) {
    var card = this;

    async.forEach(
        card.files,
        async function(item, callback) {
            await cloudinary.uploader.destroy(item.public_id).catch((err) => {
                console.log("destroy image err ", err.message);
            });
            if (typeof callback === "function") {
                return callback();
            }
        },
        function(err) {
            if (err) {
                throw Error("Card delete err - " + err.message);
            }
        }
    );

    next();
});

const ActivityCard = mongoose.model("activityCards", activityCardSchema);
module.exports = ActivityCard;