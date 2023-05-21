const express = require("express");
const router = express.Router();
const chatController = require("../Controllers/chatController");
const { authMiddleware } = require("../Middlewares/authMiddleware");
// const { check } = require("express-validator");

// Create a new chat
router.post("/", authMiddleware, chatController.createChat);

//get chats by logged in user Id
router.get("/", authMiddleware, chatController.getChatByUserId);

//creat chat group
router.post("/group", authMiddleware, chatController.createGroupChat);

//rename group name
router.put("/rename-group", authMiddleware, chatController.renameGroupChat);

//add someone to group
router.put("/add-to-group", authMiddleware, chatController.addToGroupChat);

// Get chat by  chat ID
router.get("/:id", authMiddleware, chatController.getChatById);

// Add a message to a chat
router.post("/:id/message", authMiddleware, chatController.addMessage);

module.exports = router;
