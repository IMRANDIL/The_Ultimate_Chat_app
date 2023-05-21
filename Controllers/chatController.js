const Chat = require("../Models/chatModel");
const User = require("../Models/userModel");
const chatSocket = require("../Socket/chatSocket");
// const { validationResult } = require("express-validator");

// Create a new chat
exports.createChat = async (req, res) => {
  const { participantId } = req.body;

  if (!participantId) {
    const err = new Error("ParticipantId required!");
    err.statusCode = 400;
    err.code = "MISSING_FIELDS"; // Set custom error code
    return next(err);
  }

  try {
    // Check if participantId exist in the User model
    const participantsExist = await User.findOne({ _id: participantId });
    if (!participantsExist) {
      const err = new Error("User does not exist!");
      err.statusCode = 404;
      err.code = "NOT_FOUND"; // Set custom error code
      return next(err);
    }

    //check if chat exists...
    let isChatExists = await Chat.find({
      isGroupChat: false,
      $and: [
        {
          participants: {
            $elemMatch: {
              $eq: req.user._id,
            },
          },
        },
        {
          participants: {
            $elemMatch: {
              $eq: participantId,
            },
          },
        },
      ],
    }).populate("participants", "-password");

    // const newChat = new Chat({ participants });
    // const savedChat = await newChat.save();

    const chatSocketInstance = chatSocket(req.app.get("io"));

    // Emit the new chat event to all participants
    chatSocketInstance.emitNewChat(savedChat);

    res.status(201).json(savedChat);
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

    const chatSocketInstance = chatSocket(req.app.get("io"));
    // Emit the new message event to all participants in the chat room
    chat.participants.forEach((participant) => {
      chatSocketInstance.emitNewMessage(participant, newMessage);
    });

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ error: "Failed to add message" });
  }
};
