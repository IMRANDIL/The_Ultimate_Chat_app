const router = require("express").Router();
const UserController = require("../Controllers/userController");

router.post("/user/signup", UserController.userSignUp);

module.exports = router;
