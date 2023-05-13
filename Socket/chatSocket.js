module.exports = (io) => {
  io.on("connection", (socket) => {
    // Handle chat-related events
    socket.on("join", (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });

    socket.on("chatMessage", (data) => {
      io.to(data.room).emit("message", data.message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};
