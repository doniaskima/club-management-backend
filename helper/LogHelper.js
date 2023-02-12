 const CLubLog = require("../models/ClubLog");

 //Save Log to database

 async function saveLog(club, type, content) {
     try {
         const clubLog = new CLubLog({ club, type, content });
         await clubLog.save();
         return clubLog;
     } catch (err) {
         console.log("saveLog", err);
     }
 }

 //delete all logs of club
 async function deleteLogOfClub(club, type) {
     try {
         query = { club: club };
         if (type !== undefined) {
             query = {...query, type: type };
         }
         await ClubLog.deleteMany(query);
     } catch (err) {
         console.log("deleteLogByClub", err);
     }
 }

 async function deleteLogOfUser(user, type) {
     try {
         query = { user: user };
         if (type !== undefined) {
             query = {...query, type: type };
         }
         await ClubLog.deleteMany(query);
     } catch (err) {
         console.log("deleteLogByClub", err);
     }
 }

 module.exports = { saveLog, deleteLogOfClub, deleteLogOfUser };