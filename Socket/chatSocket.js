module.exports = (io) => {
  // console.log(io);
  io.on("connection", (socket) => {
    console.log(`connected to socket.io`);
  });
};
