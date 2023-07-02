require("dotenv").config();

const express = require("express");
const connectDB = require("./Config/dbConfig");
const cors = require("cors");
const socketIO = require("socket.io");
const compression = require("compression");
const cookies = require("cookie-parser");
const logger = require("./Utils/logger");
const chatSocket = require("./Socket/chatSocket");
const { customErrorHandler } = require("./Middlewares/customErrorMiddleware");

const app = express();

const PORT = process.env.PORT || 9012;

app.use(cookies());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
// Enable CORS with credentials
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));

//routing middleware comes here

app.use("/api/v1", require("./Router/userRouter"));
app.use("/api/v1/chats", require("./Router/chatRouter"));
app.use("/api/v1/messages", require("./Router/messageRouter"));

app.get("/test-cookies", (req, res) => {
  res.send(req.cookies);
});

//custom error middleware comes here

app.use(customErrorHandler);

// Connect to the database and start the server
connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`);
    });

    //initilaize the socket

    const io = socketIO(server, {
      pingTimeout: 60000,
      cors: {
        origin: "http://localhost:5173",
      },
    });
    app.set("io", io);

    chatSocket(io);

    server.on("error", (err) => {
      logger.error(`Error starting the server: ${err.message}`);
      process.exit(1);
    });
  })
  .catch((err) => {
    logger.error(`Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  });
