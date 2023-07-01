const router = require("express").Router();
const { sendMsg, getMsgByChatId } = require("../Controllers/messageController");
const { authMiddleware } = require("../Middlewares/authMiddleware");

router.post("/", authMiddleware, sendMsg);
router.get("/:chatId", authMiddleware, getMsgByChatId);

module.exports = router;
