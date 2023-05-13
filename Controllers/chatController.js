const Chat = require("../Models/chatModel");
const chatSocket = require("../Socket/chatSocket");

// Create a new chat
exports.createChat = async (req, res) => {
  try {
    const { participants } = req.body;
    const newChat = new Chat({ participants });
    const savedChat = await newChat.save();

    // Emit the new chat event to all participants
    chatSocket.emitNewChat(savedChat);

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

    // Emit the new message event to all participants in the chat room
    chat.participants.forEach((participant) => {
      chatSocket.emitNewMessage(participant, newMessage);
    });

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ error: "Failed to add message" });
  }
};
