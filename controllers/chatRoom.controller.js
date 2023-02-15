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

    socket.on('sendMessage', async(
        user_id, type, iginalfilename, content, room_id, callback
    ) => {
        try {
            let roomId = room_id;
            let spliRoomId = room_id.split('_');
            if (splitRoomId.length > 1) {
                const roomIdArr = [
                    splitRoomId[0] + "_" + splitRoomId[1],
                    splitRoomId[1] + "_" + splitRoomId[0]
                ]
                const rooms = await ChatRoom.find({ room_id: { $in: roomIdArr } })
                if (rooms.length > 0) {
                    roomId = rooms[0].room_id;
                } else {
                    console.log("not found");
                    const newRoom = await ChatRoom.create({ room_id })
                    roomId = newRoom.room_id;
                    io.emit("chat-room-created", roomId)
                    socket.join(roomId);
                }
            }
            const msgToStore = {
                author: user_id,
                type,
                original_filename,
                content,
                room_id: roomId,
            }

            const msg = new Message(msgToStore);
            msg.save().then(m =>
                m.populate('author')
                .execPopulate()
                .then(async(result) => {
                    //console.log('send mess', result)
                    io.to(roomId).emit('message', result);
                    io.emit('reload-list-room', result)
                    callback();
                })
            )
        } catch (err) {
            console.log(err);
        }
    })
}