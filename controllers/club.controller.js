const fs = require("fs");
const Buffer = require("buffer").Buffer;
const mongoose = require("mongoose");
const cloudinary = require("../helper/Cloudinary");
const Club = require("../models/Club");
const User = require("../models/user.model");
const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const FundHistory = require("../models/FundHistory");
const Group = require("../models/Group");
const { saveLog } = require("../helper/LogHelper");

const createClub = async(req, res) => {
    const files = req.files;
    const { name, description, leader, treasurer } = req.body;
    let img_url = "";
    let cloudinary_id = "";
    try {
        if (files.length > 0) {
            const { path } = files[0];

            const newPath = await cloudinary.uploader
                .upload(path, {
                    resource_type: "auto",
                    folder: "Club-Management/Club-Avatar",
                })
                .catch((err) => {
                    console.log(err);
                    res.status(400).json({
                        error: err.message,
                    });
                });
            fs.unlinkSync(path);
            img_url = newPath.url;
            cloudinary_id = newPath.public_id;
        }
        const club = new Club({
            name,
            img_url,
            cloudinary_id,
            description,
            leader,
            treasurer,
        });

        const saveClub = await club.save();
        await saveLog(saveClub._id, "club_created", "");
        let users = await User.find({ _id: { $in: [leader, treasurer] } });
        users.forEach(async(user) => {
            user.clubs.push(saveClub._id);
            if (user._id.toString() === leader) {
                await saveLog(saveClub._id, "promote_leader", user._id);
            } else {
                await saveLog(saveClub._id, "promote_treasurer", user._id);
            }
            await user.save();
        });
        await ChatRoom.create({ room_id: saveClub._id });
        const result = await saveClub
            .populate("leader")
            .populate("treasurer")
            .execPopulate();
        res.status(201).send(ConvertClub(result));
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};
module.exports = {
    createClub,
};