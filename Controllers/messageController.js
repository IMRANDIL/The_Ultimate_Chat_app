const Chat = require("../Models/chatModel");
const Message = require("../Models/messageModel");
const User = require("../Models/userModel");

exports.sendMsg = async (req, res, next) => {
  const { chatId, content } = req.body;
  if (!chatId || !content) {
    const err = new Error("ChatId and content required!");
    err.statusCode = 400;
    err.code = "MISSING_FIELDS"; // Set custom error code
    return next(err);
  }

  try {
    const newMsg = {
      sender: req.user._id,
      content,
      chat: chatId,
    };
    const isChatExist = await Chat.findOne({ _id: chatId });
    if (!isChatExist) {
      const err = new Error("Chat does not exist!");
      err.statusCode = 400;
      err.code = "NOT_EXIST"; // Set custom error code
      return next(err);
    }

    let message = await Message.create(newMsg);

    message = await message.populate("sender", "username profilePic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.participants",
      select: "username, profilePic, email",
    });
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    res.status(201).send(message);
  } catch (error) {
    return next(error);
  }
};

exports.getMsgByChatId = async (req, res, next) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "username profilePic email")
      .populate("chat");
    res.status(200).send(messages);
  } catch (error) {
    return next(error);
  }
};
