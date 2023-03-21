const Group = require("../models/Group");
const Club = require("../models/Club");
const User = require("../models/user.model");
const { result } = require("lodash");

function userExists(arr , id){
    return arr.some(function(el){
        return el._id==id ;
    })
}

module.exports.create = (req, res) => {
    const { clubId, name, members } = req.body

    let group = new Group({ club: clubId, name, members })

    group.save().then(gr => {
        gr.populate('members')
            .execPopulate()
            .then(result => {
                res.status(201).send(result)
            }).catch(err => {
                res.status(400).send({ error: err.message })
            })
    }).catch(err => {
        res.status(400).send({ error: err.message })
    })
}

module.exports.addMembers = (req, res) => {
    const { groupId, users } = req.body;

    Group.findById(groupId, function (err, doc) {
        if (err) {
            res.status(400).send({ error: err.message })
            return;
        }

        users.forEach(user => {
            doc.members.push(user)
        });

        doc.save().then(gr => {
            //console.log(gr)
            gr.populate('members')
                .execPopulate()
                .then(result => {
                    res.status(201).send(result)
                }).catch(err => {
                    res.status(400).send({ error: err.message })
                })
        }).catch(err => {
            res.status(400).send({ error: err.message })
        })
    }).catch(err => {
        res.status(400).send({ error: err.message })
    })
}

module.exports.getList = (req , res)=>{
    const clubId = req.params.clubId ;
    Group.find({ club: clubId })
    .sort({ name: 1 })
    .populate('members')
    .then(result => {
        res.status(200).send(result)
    }).catch(err => {
        res.status(500).json({ error: err.message })
    })
}


module.exports.getOne = (req ,res)=>{
    const groupId = req.params.groupId;
    Group.findById(groupId)
    .populate("members")
    .then(result=>{
        res.status(200).send(result)
    }).catch(err=>{
        res.status(500).json({ error: err.message })
    })
}


module.exports.searchGroupInClub = (req , res)=>{
    const clubId = req.params.clubId ;
    const encodedSearchValue = req.params.searchValue;
    const buff = Buffer.from(encodedSearchValue, "base64");
    const searchValue = buff.toString("utf8");

    Group.find({
        $and: [
            { club: clubId },
            { name: { $regex: searchValue } }
        ]
    }).sort({ name: 1 })
        .populate('members')
        .then(grs => {
            res.status(200).send(grs)
        }).catch(err => {
            res.status(500).json({ error: err.message })
        })
}

module.exports.getAllMembers = (req, res) => {
    const clubId = req.params.clubId;

    Club.findById(clubId).then(club => {
        let arrId = club.members
        arrId.push(club.leader)
        arrId.push(club.treasurer)
        //console.log(arrId)
        User.find({
            _id: {
                $in: arrId
            }
        }).then(users => {
            res.status(200).send(users)
        }).catch(err => {
            res.status(500).json({ error: err.message })
        })
    }).catch(err => {
        res.status(500).json({ error: err.message })
    })
}
