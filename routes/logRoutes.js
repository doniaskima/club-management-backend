const { Router } = require("express");
const clubLogController = require("../controller/logControllers");
const router = Router();

router.get("/:clubId", clubLogController.getListOfClub);

module.exports = router;
