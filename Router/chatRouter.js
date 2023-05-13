const express = require("express");
const router = express.Router();
const chatController = require("../Controllers/chatController");
const { authMiddleware } = require("../Middlewares/authMiddleware");
const { check } = require("express-validator");

// Create a new chat
router.post(
  "/",
  [
    check("participants")
      .isArray({ min: 2 })
      .withMessage("Participants must be an array with at least 2 elements"),
  ],
  authMiddleware,
  chatController.createChat
);

// Get chat by ID
router.get("/:id", authMiddleware, chatController.getChatById);

// Add a message to a chat
router.post("/:id/message", authMiddleware, chatController.addMessage);

module.exports = router;
