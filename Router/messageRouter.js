const router = require("express").Router();
const { sendMsg, getMsgByChatId } = require("../Controllers/messageController");
const { authMiddleware } = require("../Middlewares/authMiddleware");

router.post("/", authMiddleware, sendMsg);
router.post("/:chatId", authMiddleware, getMsgByChatId);

module.exports = router;
