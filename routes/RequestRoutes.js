const { Router } = require("express");
const clubRequestController = require("../controller/clubRequestControllers");
const activityRequestController = require("../controller/activityRequestControllers");
const router = Router();

// activity
router.get('/activity', activityRequestController.getList)
router.post('/activity', activityRequestController.create)
module.exports = router;