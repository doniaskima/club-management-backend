const { Router } = require("express");
const clubController = require("../controllers/club.controller");
const upload = require("../helper/multer");
const router = Router();


router.post("/create", upload.array("file"), clubController.createClub);
router.get("/list/:userId", clubController.getList);
router.get("/listnotjoin/:userId", clubController.getListNotJoin);
router.get("/one/:clubId", clubController.getOne);
router.get("/search/:searchValue", clubController.search);
router.get("/usersearch/:userId/:searchValue", clubController.userSearch);
router.get("/searchMember/:clubId", clubController.searchMembers);

module.exports = router;