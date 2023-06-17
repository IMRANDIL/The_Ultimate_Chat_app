const router = require("express").Router();
const UserController = require("../Controllers/userController");
const {
  accessTokenMiddleware,
  authMiddleware,
} = require("../Middlewares/authMiddleware");

router.post("/user/signup", UserController.userSignUp);
router.post("/user/login", UserController.userLogin);
router.post("/user/forgot-password", UserController.forgotPassword);
router.post("/user/reset-password", UserController.resetPassword);
router.post(
  "/user/access-token",
  accessTokenMiddleware,
  UserController.getNewAccessToken
);
router.get("/user/allUser", authMiddleware, UserController.allUsers);
router.get("/user/logout", authMiddleware, UserController.logOutUser);

module.exports = router;
