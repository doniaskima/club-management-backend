const ClubLog = require("../models/ClubLog");
const User = require("../models/User");

module.exports.getListOfClub = async(req, res) => {
    const clubId = req.params.clubId;
    try {
        const logs = await ClubLog.find({ club: clubId }).sort({ createdAt: 1 });
        const cloneLogs = JSON.parse(JSON.stringify(logs));
        const promises = cloneLogs.map(async(log) => {
            if (
                [
                    "member_join",
                    "promote_leader",
                    "promote_treasurer",
                    "member_out",
                ].includes(log.type)
            ) {
                const user = await User.findById(log.content);
                log.content = user;
                return log;
            }
            return log;
        });
        const result = await Promise.all(promises);

        res.send(result);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
};