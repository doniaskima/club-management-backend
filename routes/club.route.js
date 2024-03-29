const { Router } = require("express");
const clubController = require("../controllers/club.controller");
const upload = require("../helper/multer");
const router = Router();

router.post("/create", upload.array("file"), clubController.createClub);
router.get("/list/:userId", clubController.getList);
router.get("/members/:clubId", clubController.getMembersJoinLogs);
router.get("/listnotjoin/:userId", clubController.getListNotJoin);
router.get("/one/:clubId", clubController.getOne);
router.get("/search/:searchValue", clubController.search);
router.get("/usersearch/:userId/:searchValue", clubController.userSearch);
router.get("/searchmembers/:clubId/:searchValue", clubController.searchMembers);
router.get(
    "/searchUsersNotMembers/:clubId/:searchValue",
    clubController.searchUsersNotMembers
);
router.patch("/block/:clubId", clubController.block);
router.patch("/update/:clubId", clubController.update);
router.patch("/removemembers/:clubId", clubController.removeMembers);
router.delete("/delete/:clubId/:cloudId", clubController.delete);

module.exports = router;