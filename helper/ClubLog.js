const mongoose = require('mongoose')

const clubLogSchema = new mongoose.Schema({
    club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'club',
        required: true
    },
    type: {
        type: String,
        lowercase: true,
    },
    content: {
        type: String,
    }
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

clubLogSchema.virtual('mean').get(function() {
    let value = ''
    switch (this.type) {
        case "club_created":
            value = "Thành lập câu lạc bộ"
            break;
        case "promote_leader":
            value = `Bổ nhiệm làm trưởng câu lạc bộ`
            break;
        case "promote_treasurer":
            value = `Bổ nhiệm làm thủ quỹ`
            break;
        case "member_join":
            value = `Tham gia câu lạc bộ`
            break;
        case "member_out":
            value = `Rời khỏi câu lạc bộ`
            break;
        case "club_blocked":
            value = `Bị đình chỉ bởi quản trị viên`
            break;
        case "club_unblock":
            value = `Gỡ đình chỉ bởi quản trị viên`
            break;
        default:
            value = ""
            break;
    }
    return value
});

const ClubLog = mongoose.model('clubLogs', clubLogSchema)
module.exports = ClubLog;