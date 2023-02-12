const { Router } = require("express");
const clubController = require("../controllers/club.controller");
const upload = require("../helper/multer");
const router = Router();


router.post("/create", upload.array("file"), clubController.createClub);


module.exports = router;