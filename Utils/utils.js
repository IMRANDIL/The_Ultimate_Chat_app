const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.generateJWTToken = async (userId, jwtSecret, jwtExpiry) => {
  // Generate the JWT token with the provided secret and expiry
  const accessToken = await jwt.sign({ id: userId }, jwtSecret, {
    expiresIn: `${jwtExpiry}`,
  });
  return accessToken;
};

exports.getIPAddress = (req) => {
  const forwardedIP = req.headers["x-forwarded-for"];
  const remoteIP = req.connection.remoteAddress;

  // Check if the forwarded IP exists and return it, otherwise return the remote IP
  const ipAddress = forwardedIP ? forwardedIP.split(",")[0] : remoteIP;

  return ipAddress;
};

exports.validateEmail = (email) => {
  // Regular expression for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.generateUniqueResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  return token;
};
