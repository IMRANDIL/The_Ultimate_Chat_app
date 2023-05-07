const router = require("express").Router();
const UserController = require("../Controllers/userController");
const { accessTokenMiddleware } = require("../Middlewares/authMiddleware");

router.post("/user/signup", UserController.userSignUp);
router.post("/user/login", UserController.userLogin);
router.post(
  "/user/access-token",
  accessTokenMiddleware,
  UserController.getNewAccessToken
);

module.exports = router;
