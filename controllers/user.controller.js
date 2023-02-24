const { ConvertUser, ConvertUsers } = require("../helper/ConvertDataHelper");
const User = require("../models/User");
const Buffer = require("buffer").Buffer;

module.exports.getList = (req, res) => {
    User.find({ username: { $nin: ["admin", "admin0"] } })
        .then((result) => {
            res.status(200).send(ConvertUsers(result));
        })
        .catch((err) => {
            res.status(500).json({ error: err.message });
        });
};

module.exports.getOne = (req, res) => {
    const userId = req.params.userId;

    User.findById(userId)
        .then((result) => {
            res.status(200).send(ConvertUsers(result));
        })
        .catch((err) => {
            res.status(500).json({ error: err.message });
        });
};

module.exports.block = async(req, res) => {
    const userId = req.params.userId;
    User.findById(userId, function(err, doc) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        doc.isblocked = !doc.isblocked;
        doc.save().then((result) => {
            res.status(200).send(ConvertUser(result));
        });
    });
};

module.exports.search = async(req, res) => {
    const encodedSearchValue = req.params.searchValue;
    const buff = Buffer.from(encodedSearchValue, "base64");
    const searchValue = buff.toString("utf8");

    User.find({
        $and: [
            { username: { $nin: ["admin", "admin0"] } },
            {
                $or: [
                    { username: { $regex: searchValue } },
                    { name: { $regex: searchValue } },
                    { email: { $regex: searchValue } },
                ],
            },
        ],
    }).then(result => {
        res.status(200).send(ConvertUsers(result));
    }).catch(err => {
        res.status(500).json({ error: err.message })
    })
};