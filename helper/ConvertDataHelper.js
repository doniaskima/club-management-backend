function ConvertClub(data) {
    let club = {};
    club._id = data._id;
    club.name = data.name;
    club.img_url = data.img_url;
    club.cloudinary_id = data.cloudinary_id;
    club.description = data.description;
    club.isblocked = data.isblocked;
    club.fund = data.fund;
    club.leader = data.leader;
    club.treasurer = data.treasurer;
    club.monthlyFund = data.monthlyFund;
    club.monthlyFundPoint = data.monthlyFundPoint;

    club.members_num = 2 + data.members.length;

    return club;
}

function ConvertClubs(data) {
    let clubs = [];

    data.forEach((elm) => {
        let club = {};

        club._id = elm._id;
        club.name = elm.name;
        club.img_url = elm.img_url;
        club.cloudinary_id = elm.cloudinary_id;
        club.description = elm.description;
        club.isblocked = elm.isblocked;
        club.fund = elm.fund;
        club.leader = elm.leader;
        club.treasurer = elm.treasurer;
        club.monthlyFund = elm.monthlyFund;
        club.monthlyFundPoint = elm.monthlyFundPoint;
        club.members_num = 2 + elm.members.length;
        clubs.push(club);
    });
    return clubs;
}

function ConvertUser(data) {
    let user = {};

    user._id = data._id;
    user.name = data.name;
    user.username = data.username;
    user.img_url = data.img_url;
    user.cloudinary_id = data.cloudinary_id;
    user.email = data.email;
    user.isblocked = data.isblocked;
    user.groups_num = data.clubs.length;

    return user;
}

function ConvertUsers(data) {
    let users = [];

    data.forEach((elm) => {
        let user = {};

        user._id = elm._id;
        user.name = elm.name;
        user.username = elm.username;
        user.img_url = elm.img_url;
        user.cloudinary_id = elm.cloudinary_id;
        user.email = elm.email;
        user.isblocked = elm.isblocked;
        user.groups_num = elm.clubs.length;

        users.push(user);
    });

    return users;
}

module.exports = { ConvertClub, ConvertClubs, ConvertUser, ConvertUsers };