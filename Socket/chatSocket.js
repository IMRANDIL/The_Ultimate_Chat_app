module.exports = (io) => {
  // console.log(io);
  io.on("connection", (socket) => {
    console.log(`connected to socket.io`);

    socket.on("setup", (userData) => {
      socket.join(userData.id); //created a particular room for this userId
      socket.emit("connected");
    });

    socket.on("join chat", (room) => {
      socket.join(room);
      console.log(`user joined this room: ${room}`);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMsg) => {
      let chat = newMsg.chat;

      if (!chat.participants)
        return console.log("chat.participants not defined");

      chat.participants.forEach((participant) => {
        if (participant._id == newMsg.sender._id) return;

        socket.in(participant._id).emit("message received", newMsg);
      });
      // socket.to(chat._id).emit("message received", newMsg);
    });

    // Handle participant added event
    socket.on("participantAdded", (updatedChats) => {
      // Use the updatedChats array received from the client

      updatedChats.forEach((chat) => {
        chat.participants.forEach((participant) => {
          socket.in(participant._id).emit("participant Added", chat);
        });
      });
    });

    // Handle participant removed event
    socket.on("participantRemoved", (updatedChats) => {
      // Use the updatedChats array received from the client
      updatedChats.forEach((chat) => {
        chat.participants.forEach((participant) => {
          socket.in(participant._id).emit("participant Removed", chat);
        });
      });
    });

    // Handle group rename event
    socket.on("groupRenamed", (updatedChats) => {
      // Use the updatedChats array received from the client
      updatedChats.forEach((chat) => {
        chat.participants.forEach((participant) => {
          socket.in(participant._id).emit("group Rename", chat);
        });
      });
    });

    // Handle group chat creation event
    socket.on("groupChatCreation", (updatedChats) => {
      // Use the updatedChats array received from the client
      updatedChats.forEach((chat) => {
        chat.participants.forEach((participant) => {
          socket.in(participant._id).emit("group Creation", chat);
        });
      });
    });

    // Handle group chat leave event
    socket.on("groupChatLeft", (updatedChats) => {
      // Use the updatedChats array received from the client
      updatedChats.forEach((chat) => {
        chat.participants.forEach((participant) => {
          socket.in(participant._id).emit("group Left", chat);
        });
      });
    });

    socket.off("setup", () => {
      console.log("user disconnected");
      socket.leave(userData.id);
    });
  });
};
