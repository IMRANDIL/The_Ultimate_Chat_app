const Chat = require("../Models/chatModel");

exports.sendMsg = async (req, res, next) => {
  const { chatId, content } = req.body;
  if (!chatId || !content) {
    const err = new Error("ChatId and content required!");
    err.statusCode = 400;
    err.code = "MISSING_FIELDS"; // Set custom error code
    return next(err);
  }

  const newMsg = {
    sender: req.user._id,
    content,
    chat: chatId,
  };

  try {
    const isChatExist = await Chat.findOne({ _id: chatId });
    if (!isChatExist) {
      const err = new Error("Chat does not exist!");
      err.statusCode = 400;
      err.code = "NOT_EXIST"; // Set custom error code
      return next(err);
    }
  } catch (error) {}
};

exports.getMsgByChatId = async (req, res, next) => {};
