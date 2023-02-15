const User = require("../modeks/User");
const Club = require("../models/Club");
const Message = require("../models/Message");
const ChatRoom = require("../models/ChatRoom");
const mongoose = require("mongoose");
const async = require("async");
const { addUser, getUser } = require("../helper/ChatRoomHelper");
const { uniqueArray } = require("../helper/ArrayHelper");


function convertLastMessage(message) {
    let lastMessage = '';
    switch (message.type) {
        case "text":
            lastMessage = message.content;
            break;
        case "image":
            lastMessage = "[Hình ảnh]"
            break;
        case "file":
            lastMessage = "[Tệp]"
            break;
        default:
            break;
    }
    return lastMessage;
}

module.exports = function(socket, io) {
    socket.on('join', ({ user_id, room_id }) => {
        const { error, user } = addUser({
            socket_id: socket.id,
            user_id,
            room_id
        })
        socket.join(room_id);
        console.log("on join", io.sockets.adapter.rooms)
        if (error) {
            console.log('join error', error)
        } else {
            console.log('join user', user)
        }
    })

    socket.on('search-user', (searchValue, user_id) => {
        let roomsFinded = []
        User.find({
            $or: [
                { username: { $regex: searchValue } },
                { name: { $regex: searchValue } },
                { email: { $regex: searchValue } }
            ]
        }).limit(5).then(users => {
            users.forEach(user => {
                const room = {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    img_url: user.img_url,
                }
                roomsFinded.push(room)
            })
            Club.find({
                    $and: [{
                            $or: [
                                { treasurer: user_id },
                                { leader: user_id },
                                { members: user_id },
                            ]
                        },
                        { name: { $regex: searchValue } }
                    ]
                })
                .limit(5).then(clubs => {
                    clubs.forEach(club => {
                        const room = {
                            _id: club._id,
                            name: club.name,
                            email: '',
                            img_url: club.img_url,
                        }
                        roomsFinded.push(room)
                    })
                    socket.emit('user-searched', roomsFinded)
                })
        })
    })
}

async function getListRoomId(userId) {

}