const {Router} = require('express');
const groupController = require('../controller/groupControllers')
const router = Router();

router.post('/create', groupController.create)
router.post('/addmembers', groupController.addMembers)
router.get('/list/:clubId', groupController.getList)
router.get('/one/:groupId', groupController.getOne)
router.get('/search/:clubId/:searchValue', groupController.searchGroupInClub)
router.get('/allmembers/:clubId', groupController.getAllMembers)
router.get('/allmembersnotingroup/:groupId', groupController.getAllNotInGroup)
router.get('/searchallmembers/:clubId/:searchValue', groupController.searchAll)
router.get('/searchallmembersnotingroup/:groupId/:searchValue', groupController.searchAllNotInGroup)
router.patch('/update/:groupId', groupController.update)
router.delete('/delete/:groupId', groupController.delete)

module.exports = router;