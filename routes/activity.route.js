const { Router } = require("express");
const activityController = require("../controllers/activity.controller");
const upload = require("../helper/multer");
const router = Router();

router.post("/create", activityController.create);
router.post("/createcard", activityController.createCard);
router.get("/list/:clubId", activityController.getList);
router.get("/one/:activityId", activityController.getOne);
router.get("/collaborators/:activityId", activityController.getCollaborators);
router.get('/usersnotcollaborators/:activityId', activityController.getUsersNotCollaborators)
router.get('/search/:clubId/:searchValue', activityController.search)
router.get('/searchcollaborators/:activityId/:searchValue', activityController.searchCollaborators)
router.get('/searchusersnotcollaborators/:activityId/:searchValue', activityController.searchUsersNotCollaborators)

module.exports = router;