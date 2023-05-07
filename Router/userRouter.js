const router = require("express").Router();
const UserController = require("../Controllers/userController");

router.post("/user/signup", UserController.userSignUp);
router.post("/user/login", UserController.userLogin);

module.exports = router;
