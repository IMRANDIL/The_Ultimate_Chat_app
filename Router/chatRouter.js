const express = require("express");
const router = express.Router();
const chatController = require("../Controllers/chatController");
const { authMiddleware } = require("../Middlewares/authMiddleware");

// Create a new chat
router.post("/", authMiddleware, chatController.createChat);

// Get chat by ID
router.get("/:id", authMiddleware, chatController.getChatById);

// Add a message to a chat
router.post("/:id/message", authMiddleware, chatController.addMessage);

module.exports = router;
