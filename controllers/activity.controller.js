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
        .destroy(public_id, function (result) {
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

  let boards = [
    {
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
      Activity.findById(activityId, function (err, doc) {
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
              function (item, callback) {
                ActivityCard.populate(
                  item,
                  { path: "cards" },
                  function (err, output) {
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
              function (err) {
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

module.exports.getList = async (req, res) => {
  const clubId = req.params.clubId;
  const { inMonth, userId, option } = req.query;
  const currentDate = moment();
  const nextMonthDate = moment().add(30, "days");
  // const nextMonthDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
  let query = { club: clubId };
  if (inMonth !== undefined) {
    query = {
      ...query,
      $or: [
        {
          startDate: {
            $gte: currentDate.toISOString(),
            $lte: nextMonthDate.toISOString(),
          },
        },
        {
          endDate: {
            $gte: nextMonthDate.toISOString(),
          },
        },
      ],
    };
  }
  if (option !== undefined) {
    // console.log(typeof(option))
    if (option === "0") {
      // future
      query = {
        ...query,
        startDate: { $gte: currentDate.toISOString() },
      };
    } else if (option === "1") {
      // current
      query = {
        ...query,
        startDate: { $lte: currentDate.toISOString() },
        endDate: { $gte: currentDate.toISOString() },
      };
    } else if (option === "2") {
      // end not sumary
      query = {
        ...query,
        endDate: { $lt: currentDate.toISOString() },
        sumary: "",
      };
    } else if (option === "3") {
      // end sumary
      query = {
        ...query,
        endDate: { $lt: currentDate.toISOString() },
        sumary: { $ne: "" },
      };
    }
  }

  const activities = await Activity.find(query);
  if (userId !== undefined) {
    const cloneActivities = JSON.parse(JSON.stringify(activities));
    const promises = cloneActivities.map(async (activity) => {
      const requests = await ActivityRequest.find({
        activity: activity._id,
        user: userId,
      });
      // console.log(request, activity._id)
      if (!Array.isArray(requests) || !requests.length) {
        activity.requested = false;
      } else {
        // status === 0 => requested = true
        // status === 1 => remove elm
        // status === 2 => requested = false
        requests.map(async (rq) => {
          if (rq.status === 0) {
            activity.requested = true;
          } else if (rq.status === 1) {
            activity = null;
          } else if (rq.status === 2) {
            activity.requested = false;
          }
        });
      }
      return activity;
    });
    const result = notContainsNullArray(await Promise.all(promises));
    // console.log(userId, result)

    res.status(200).send(result);
  } else {
    res.status(200).send(activities);
  }
};

module.exports.getOne = (req, res) => {
  const activityId = req.params.activityId;

  Activity.findById(activityId)
    .populate("club")
    .then((result) => {
      async.forEach(
        result.boards,
        function (item, callback) {
          ActivityCard.populate(
            item,
            { path: "cards" },
            function (err, output) {
              if (err) {
                res.status(500).send({ error: err.message });
                return;
              }
              callback();
            }
          );
        },
        function (err) {
          if (err) {
            res.status(500).send({ error: err.message });
            return;
          }
          res.status(200).send(result);
        }
      );
    })
    .catch((err) => {
      res.status(500).send({ error: err.message });
    });
};

module.exports.getCollaborators = (req, res) => {
  const activityId = req.params.activityId;

  Activity.findById(activityId)
    .populate("collaborators")
    .then((result) => {
      res.status(200).send(result.collaborators);
    })
    .catch((err) => {
      res.status(500).send({ error: err.message });
    });
};

module.exports.getUsersNotCollaborators = (req, res) => {
  const activityId = req.params.activityId;
  Activity.findById(activityId)
    .populate("club")
    .then((result) => {
      User.find({
        $and: [
          { _id: { $nin: result.club.members } },
          { _id: { $nin: result.collaborators } },
          { _id: { $nin: [result.club.leader, result.club.treasurer] } },
          { username: { $nin: ["admin", "admin0"] } },
        ],
      });
    })
    .limit(20)
    .then((users) => {
      res.status(200).send(users);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ error: err.message });
    })
    .catch((err) => {
      res.status(500).send({ error: err.message });
    });
};

module.exports.search = (req, res) => {
  const clubId = req.params.clubId;
  const encodedSearchValue = req.params.searchValue;
  const buff = Buffer.from(encodedSearchValue, "base64");
  const searchValue = buff.toString("utf8");

  Activity.find({
    $and: [{ club: clubId }, { title: { $regex: searchValue } }],
  })
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send({ error: err.message });
    });
};
