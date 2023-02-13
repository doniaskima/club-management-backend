const {
    ConvertClub,
    ConvertClubs,
    ConvertUser,
    ConvertUsers,
} = require("../helper/ConvertDataHelper");
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

module.exports.createClub = async(req, res) => {
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

module.exports.verifyclub = async(req, res, next) => {
    const club_id = req.params.club_id;

    const club = await Club.findById(club_id)
        .populate("leader")
        .populate("treasurer");

    if (club) {
        console.log(club);
        if (club.isblocked) {
            res.status(400).json({ club: "blocked" });
        } else {
            res.status(200).json(club);
        }
    } else {
        res.status(400).json({ club: "none" });
    }
};

module.exports.getList = async(req, res) => {
    const userId = req.params.userId;
    let query = {
        $or: [{ members: userId }, { leader: userId }, { treasurer: userId }],
    };
    const clubs = await Club.find(query).populate("leader").populate("treasurer");

    if (clubs.length) {
        res.status(200).send(ConvertClubs(clubs));
    } else {
        res.status(500).json({ clubs: "none" });
    }
};

module.exports.getListNotJoin = async(req, res) => {
    const userId = req.params.userId;
    const { isblocked } = req.query;

    let query = {
        $nor: [{ members: userId }, { leader: userId }, { treasurer: userId }],
    };

    if (isblocked !== undefined) {
        if (Array.isArray(isblocked)) {
            query = {...query, isblocked: { $in: isblocked } };
        } else {
            query = {...query, isblocked: isblocked };
        }
    }

    const clubs = await Club.find(query).populate("leader").populate("treasurer");

    if (clubs.length) {
        res.status(200).send(ConvertClubs(clubs));
    } else {
        res.status(500).json({ clubs: "none" });
    }
};

module.exports.getOne = async(req, res) => {
    const clubId = req.params.clubId;

    Club.findById(clubId)
        .populate("leader")
        .populate("treasurer")
        .then((result) => {
            res.status(200).send(ConvertClub(result));
        })
        .catch((err) => {
            res.status(500).json({ error: err.message });
        });
};

module.exports.getMembers = async(req, res) => {
    const clubId = req.params.clubId;

    Club.findById(clubId)
        .then((club) => {
            User.find({ _id: { $in: club.members } })
                .then((users) => {
                    res.status(200).send(ConvertUsers(users));
                })
                .catch((err) => {
                    res.status(500).json({ error: err.message });
                });
        })
        .catch((err) => {
            res.status(500).json({ error: err.message });
        });
};

module.exports.getUsersNotMembers = async(req, res) => {
    const clubId = req.params.clubId;
    try {
        const club = await Club.findById(clubId);
        const users = await User.find({
            $and: [
                { _id: { $nin: club.members } },
                { _id: { $nin: [club.leader, club.treasurer] } },
                { username: { $nin: ["admin", "admin0"] } },
            ],
        }).limit(20);
        res.status(200).send(ConvertUsers(users));
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

module.exports.search = async(req, res) => {
    const encodedSearchValue = req.params.searchValue;
    const buff = Buffer.from(encodedSearchValue, "base64");
    const searchValue = buff.toString("utf8");

    await Club.find({
            name: { $regex: searchValue },
        })
        .then((clubs) => {
            res.status(200).send(ConvertClubs(clubs));
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err.message });
        });
};

module.exports.userSearch = async(req, res) => {
    const userId = req.params.userId;
    const encodedSearchValue = req.params.searchValue;
    const buff = Buffer.from(encodedSearchValue, "base64");
    const searchValue = buff.toString("utf8");

    User.findById(userId).then((user) => {
        Club.find({
                $and: [{ name: { $regex: searchValue } }, { _id: { $in: user.clubs } }],
            })
            .populate("leader")
            .populate("treasurer")
            .then((clubs) => {
                res.status(200).send(ConvertClubs(clubs));
            })
            .catch((err) => {
                res.status(500).send({ error: err.message });
            });
    });
};

module.exports.searchMembers = async(req, res) => {
    const clubId = req.params.clubId;
    const encodedSearchValue = req.params.searchValue;
    const buff = Buffer.from(encodedSearchValue, "base64");
    const searchValue = buff.toString("utf8");

    Club.findById(clubId)
        .then((club) => {
            User.find({
                $and: [
                    { _id: { $in: club.members } },
                    {
                        $or: [
                            { username: { $regex: searchValue } },
                            { name: { $regex: searchValue } },
                            { email: { $regex: searchValue } },
                        ],
                    },
                ],
            }).then((users) => {
                res.status(200).send(ConvertUsers(users));
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ error: err.message });
        });
};

module.exports.searchUsersNotMembers = async(req, res) => {
    const clubId = req.params.clubId;
    const encodedSearchValue = req.params.searchValue;
    const buff = Buffer.from(encodedSearchValue, "base64");
    const searchValue = buff.toString("utf8");

    Club.findById(clubId).then((club) => {
        User.find({
                $and: [
                    { _id: { nin: club.members } },
                    { _id: { $nin: [club.leader, club.treasurer] } },
                    { username: { $nin: ["admin", "admin0"] } },
                    {
                        $or: [
                            { username: { $regex: searchValue } },
                            { name: { $regex: searchValue } },
                            { email: { $regex: searchValue } },
                        ],
                    },
                ],
            })
            .limit(20)
            .then((users) => {
                res.status(200).send(ConvertUsers(users));
            })

        .catch((err) => {
            console.log(err);
            res.status(400).send({ error: err.message });
        });
    });
};

module.exports.addMembers = async(req, res) => {
    const { clubId, users } = req.body;
    try {
        let club = await Club.findById(clubId);
        users.forEach(async(uid) => {
            club.members.push(uid);
            let user = await User.findById(uid);
            user.clubs.push(clubId);
            await user.save();
            await saveLog(clubId, "member_join", uid);
            await ClubRequest.deleteMany({ status: 0, user: uid, club: clubId });
        });
        const saveClub = awaitClub.save();
        const result = await saveClub
            .populate("leader")
            .populate("treasurer")
            .execPopulate();
        res.status(200).send(ConvertClub(result));
    } catch (err) {
        console.log(err);
        res.status(400).send({ error: err.message });
    }
};

module.exports.block = async(req, res) => {
    const clubId = req.params.clubId;
    try {
        let club = await Club.findById(clubId);
        if (club === undefined || club === null) {
            res.status(404).send({ error: "Không tìm thấy câu lạc bộ nào." });
            return;
        }
        club.isblocked = !club.isblocked;
        const saveClub = await club.save();
        const result = await saveClub
            .populate("leader")
            .populate("treasurer")
            .execPopulate();
        if (result.isblocked === true) {
            // club_blocked
            await saveLog(result._id, "club_blocked", "");
        } else {
            // club_unblock
            await saveLog(result._id, "club_unblock", "");
        }
        res.status(200).send(ConvertClub(result));
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};