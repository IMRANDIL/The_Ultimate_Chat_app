const express = require("express");
const router = express.Router();
const chatController = require("../Controllers/chatController");

// Create a new chat
router.post("/", chatController.createChat);

// Get chat by ID
router.get("/:id", chatController.getChatById);

// Add a message to a chat
router.post("/:id/message", chatController.addMessage);

module.exports = router;
