const Activity = require("../models/Activity");
const ActivityCard = require("../models/ActivityCard");
const ActivityRequest = require("../models/ActivityRequest");
const Point = require("../models/Point");
const ActivityPoint = require("../models/ActivityPoint");
const User = require("../models/User");
const Group = require("../models/Group");
const cloudinary = require("../helper/Cloudinary");
const fs = resquire("fs");
const async = require("async");
const Buffer = require("buffer");
const moment = require("moment");
const mongoose = require("mongoose");
const {
    isElementInArray,
    isElementInArrayObject,
    notContainsNullArray,
    uniqueArray,
    elementInArrayObject,
    uniqueIdObjArray,
} = require("../helper/ArrayHelper");

function isUserJoined(userId, card) {
    let isJoined = false;
    if (isElementInArray(userId, card.userJoin)) {
        isJoined = true;
    }
    card.groupJoin.forEach((group) => {
        if (isElementInArray(userId, group.members)) {
            // console.log(group)
            isJoined = true;
        }
    });
    return isJoined;
}

function isGroupJoined(groupId, card) {
    if (isElementInArrayObject(groupId, card.groupJoin)) {
        return true;
    }
    return false;
}

function getAllMembersInCard(card, members) {
    let membersInCard = [];
    card.userJoin.forEach((user) => {
        if (isElementInArray(user, members)) {
            membersInCard.push(user);
        }
    });

    card.groupJoin.forEach((group) => {
        membersInCard.push(...group.members);
    });
    return uniqueArray(membersInCard);
}

function getAllMembersInCards(cards, members) {
    let membersInCard = [];
    cards.map((card) => {
        card.userJoin.forEach((user) => {
            if (isElementInArray(user, members)) {
                const { element, index } = elementInArrayObject(user, membersInCard);
                if (index >= 0) {
                    membersInCard[index].count += 1;
                } else {
                    membersInCard.push({
                        _id: user,
                        count: 1,
                    });
                }
            }
        });
        card.groupJoin.forEach((group) => {
            group.members.forEach((member) => {
                if (isElementInArray(member, members)) {
                    const { element, index } = elementInArrayObject(
                        member,
                        membersInCard
                    );
                    if (index >= 0) {
                        membersInCard[index].count += 1;
                    } else {
                        membersInCard.push({
                            _id: member,
                            count: 1,
                        });
                    }
                }
            });
            // membersInCard.push(...group.members)
        });
    });
    return membersInCard;
}

function getAllCollaboratorsInCard(card, collaborators) {
    let collaboratorsInCard = [];
    card.userJoin.forEach((user) => {
        if (isElementInArray(user, collaborators)) {
            collaboratorsInCard.push(user);
        }
    });
    return uniqueArray(collaboratorsInCard);
}

function getAllCollaboratorsInCards(cards, collaborators) {
    let collaboratorsInCard = [];
    cards.map((card) => {
        card.userJoin.forEach((user) => {
            if (isElementInArray(user, collaborators)) {
                const { element, index } = elementInArrayObject(
                    user,
                    collaboratorsInCard
                );
                if (index >= 0) {
                    collaboratorsInCard[index].count += 1;
                } else {
                    collaboratorsInCard.push({
                        _id: user,
                        count: 1,
                    });
                }
            }
        });
    });
    return collaboratorsInCard;
}

async function uploadFile(files, public_id) {
    if (files.length > 0) {
        const { path } = files[0];

        const newPath = await cloudinary.uploader
            .upload(path, {
                resource_type: "auto",
                folder: "Club-Management/Activity",
            })
            .catch((error) => {
                console.log(error);
                return {
                    original_filename: "",
                    url: "",
                    public_id: "",
                };
            });
        fs.unlinkSync(path);
        if (public_id !== "") {
            await cloudinary.uploader
                .destroy(public_id, function(result) {
                    console.log("destroy image", result);
                })
                .catch((err) => {
                    console.log("destroy image err ", err.message);
                });
        }
        //console.log("upload function", newPath)
        return {
            original_filename: newPath.original_filename,
            url: newPath.url,
            public_id: newPath.public_id,
        };
    }
    return {
        original_filename: "",
        url: "",
        public_id: "",
    };
}

module.exports.create = (req, res) => {
    const {
        club,
        title,
        startDate,
        endDate,
        joinPoint,
        configType,
        configMilestone,
    } = req.body;

    let boards = [{
            title: "need to do",
            cards: [],
        },
        {
            title: "Doing",
            cards: [],
        },
        {
            title: "Done",
            cards: [],
        },
        {
            title: "Note",
            cards: [],
        },
    ];
    const sortedConfigMilestone = configMilestone.sort(
        (a, b) => a.percentOrQuantity - b.percentOrQuantity
    );
    const activity = new Activity({
        club,
        title,
        startDate,
        endDate,
        boards,
        joinPoint,
        configType,
        configMilestone: sortedConfigMilestone,
    });
    activity
        .save()
        .then((result) => {
            res.status(201).send(result);
        })
        .catch((err) => {
            res.status(400).json({ error: err.message });
        });
};

module.exports.createCard = (req, res) => {
    const { activityId, columnId, title } = req.body;

    const card = new ActivityCard({
        activity: activityId,
        title,
    });

    card
        .save()
        .then((newCard) => {
            Activity.findById(activityId, function(err, doc) {
                if (err) {
                    res.status(500).send({ error: "Activity load err - " + err.message });
                    return;
                }

                doc.boards.forEach((col) => {
                    if (col._id.toString() === columnId) {
                        col.cards.push(newCard._id);
                    }
                });

                doc
                    .save()
                    .then((result) => {
                        async.forEach(
                            result.boards,
                            function(item, callback) {
                                ActivityCard.populate(
                                    item, { path: "cards" },
                                    function(err, output) {
                                        if (err) {
                                            res
                                                .status(500)
                                                .send({ error: "Populate err - " + err.message });
                                            return;
                                        }
                                        callback();
                                    }
                                );
                            },
                            function(err) {
                                if (err) {
                                    res
                                        .status(500)
                                        .send({ error: "Populate complete err - " + err.message });
                                    return;
                                }
                                res.status(200).send(result);
                            }
                        );
                    })
                    .catch((err) => {
                        res.status(500).send({ error: "Save err - " + err.message });
                    });
            });
        })
        .catch((err) => {
            res.status(400).json({ error: "Save err - " + err.message });
        });
};