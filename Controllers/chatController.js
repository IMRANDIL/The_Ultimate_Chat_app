const Chat = require("../Models/chatModel");
const User = require("../Models/userModel");
const Message = require("../Models/messageModel");
// const chatSocket = require("../Socket/chatSocket");
// const { validationResult } = require("express-validator");

// Create a new chat

exports.createChat = async (req, res, next) => {
  const { participantId } = req.body;

  if (!participantId) {
    const err = new Error("ParticipantId required!");
    err.statusCode = 400;
    err.code = "MISSING_FIELDS"; // Set custom error code
    return next(err);
  }

  try {
    // Check if participantId exists in the User model
    const participantExists = await User.exists({ _id: participantId });
    if (!participantExists) {
      const err = new Error("User does not exist!");
      err.statusCode = 404;
      err.code = "NOT_FOUND"; // Set custom error code
      return next(err);
    }

    // Check if chat exists between the current user and the participant...one to one
    let chatExists = await Chat.find({
      isGroupChat: false,
      participants: {
        $all: [req.user._id, participantId],
      },
    })
      .populate("participants", "-password")
      .populate("latestMessage");

    chatExists = await User.populate(chatExists, {
      path: "latestMessage.sender",
      select: "email username ipAddress",
    });

    if (chatExists.length > 0) {
      return res.status(200).json(chatExists[0]);
    } else {
      // Create the chat
      const chatData = {
        participants: [req.user._id, participantId],
      };

      const newChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: newChat._id }).populate(
        "participants",
        "-password"
      );

      // const chatSocketInstance = chatSocket(req.app.get("io"));

      // Emit the new chat event to all participants
      // chatSocketInstance.emitNewChat(savedChat);

      res.status(201).json(fullChat);
    }
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ error: "Failed to create chat" });
  }
};

// Get chat by ID
exports.getChatById = async (req, res) => {
  try {
    const chatId = req.params.id;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    res.status(200).json(chat);
  } catch (error) {
    console.error("Error retrieving chat:", error);
    res.status(500).json({ error: "Failed to retrieve chat" });
  }
};

// Add a message to a chat
exports.addMessage = async (req, res) => {
  try {
    const { chatId, sender, content } = req.body;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const newMessage = {
      sender,
      content,
    };
    chat.messages.push(newMessage);
    await chat.save();

    // const chatSocketInstance = chatSocket(req.app.get("io"));
    // Emit the new message event to all participants in the chat room
    // chat.participants.forEach((participant) => {
    //   chatSocketInstance.emitNewMessage(participant, newMessage);
    // });

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ error: "Failed to add message" });
  }
};

// Get chat by logged in userID
exports.getChatByUserId = async (req, res) => {
  try {
    let chatByUserId = await Chat.find({
      participants: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("participants", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });
    chatByUserId = await User.populate(chatByUserId, {
      path: "latestMessage.sender",
      select: "email username ipAddress",
    });
    res.status(200).send(chatByUserId);
  } catch (error) {
    console.error("Error retrieving chat:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve chat by logged in User" });
  }
};
