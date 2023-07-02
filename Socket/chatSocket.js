module.exports = (io) => {
  // console.log(io);
  io.on("connection", (socket) => {
    console.log(`connected to socket.io`);

    socket.on("setup", (userData) => {
      socket.join(userData._id); //created a particular room for this userId
      socket.emit("connected");
    });

    socket.on("join chat", (room) => {
      socket.join(room);
      console.log(`user joined this room: ${room}`);
    });
  });
};
