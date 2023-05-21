const Chat = require("../Models/chatModel");
const User = require("../Models/userModel");
const Message = require("../Models/messageModel");

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
        chatName: "sender",
        participants: [req.user._id, participantId],
      };

      const newChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: newChat._id }).populate(
        "participants",
        "-password"
      );
      res.status(201).json(fullChat);
    }
  } catch (error) {
    return next(error);
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
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });
    chatByUserId = await User.populate(chatByUserId, {
      path: "latestMessage.sender",
      select: "email username ipAddress",
    });
    res.status(200).send(chatByUserId);
  } catch (error) {
    return next(error);
  }
};

//create group chat...

exports.createGroupChat = async (req, res, next) => {
  if (!req.body.name || !req.body.participants) {
    const err = new Error("All the fields required!");
    err.statusCode = 400;
    err.code = "MISSING_FIELDS"; // Set custom error code
    return next(err);
  }

  let participants = JSON.parse(req.body.participants);

  //push currenct logged in user as well in the chat
  participants.push(req.user);

  if (participants.length < 2) {
    const err = new Error(
      "Two or More than two participants required to form a group chat!"
    );
    err.statusCode = 400;
    err.code = "MINIMUM_CRITERIA"; // Set custom error code
    return next(err);
  }

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      participants: participants,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("participants", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).send(fullGroupChat);
  } catch (error) {
    return next(error);
  }
};

//rename group chat...

exports.renameGroupChat = async (req, res, next) => {
  const { chatId, chatName } = req.body;

  if (!chatId || !chatName) {
    const err = new Error("ChatId and chatName required!");
    err.statusCode = 400;
    err.code = "MISSING_FIELDS"; // Set custom error code
    return next(err);
  }

  try {
    const updateChatGroupName = await Chat.findByIdAndUpdate(
      chatId,
      { chatName: chatName },
      { new: true }
    )
      .populate("participants", "-password")
      .populate("groupAdmin", "-password");

    if (!updateChatGroupName) {
      const err = new Error("Error updating chat group name");
      err.statusCode = 400;
      err.code = "UPDATION_ERROR"; // Set custom error code
      return next(err);
    }

    res.status(200).send(updateChatGroupName);
  } catch (error) {
    return next(error);
  }
};

//add to some one to group chat...

exports.addToGroupChat = async (req, res, next) => {
  const { chatId, participantId } = req.body;

  if (!chatId || !participantId) {
    const err = new Error("ChatId and participantId required!");
    err.statusCode = 400;
    err.code = "MISSING_FIELDS"; // Set custom error code
    return next(err);
  }

  try {
    const updatedGroup = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { participants: participantId },
      },
      { new: true }
    )
      .populate("participants", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedGroup) {
      const err = new Error("Error adding participant to the group");
      err.statusCode = 400;
      err.code = "UPDATION_ERROR"; // Set custom error code
      return next(err);
    }

    res.status(200).send(updatedGroup);
  } catch (error) {
    return next(error);
  }
};

//remove someone from the group chat...

exports.removeFromGroupChat = async (req, res, next) => {
  const { chatId, participantId } = req.body;

  if (!chatId || !participantId) {
    const err = new Error("ChatId and participantId required!");
    err.statusCode = 400;
    err.code = "MISSING_FIELDS"; // Set custom error code
    return next(err);
  }

  try {
    const updatedGroup = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { participants: participantId },
      },
      { new: true }
    )
      .populate("participants", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedGroup) {
      const err = new Error("Error removing participant to the group");
      err.statusCode = 400;
      err.code = "UPDATION_ERROR"; // Set custom error code
      return next(err);
    }

    res.status(200).send(updatedGroup);
  } catch (error) {
    return next(error);
  }
};
