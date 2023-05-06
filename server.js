require("dotenv").config();

const express = require("express");
const connectDB = require("./Config/dbConfig");
const cors = require("cors");
const compression = require("compression");
const logger = require("./Utils/logger");
const { customErrorHandler } = require("./Middlewares/customErrorMiddleware");

const app = express();

const PORT = process.env.PORT || 9012;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cors());

//routing middleware comes here

//custom error middleware comes here

app.use(customErrorHandler);

// Connect to the database and start the server
connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`);
    });

    server.on("error", (err) => {
      logger.error(`Error starting the server: ${err.message}`);
      process.exit(1);
    });
  })
  .catch((err) => {
    logger.error(`Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  });
