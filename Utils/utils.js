const jwt = require("jsonwebtoken");

exports.generateJWTToken = async (payload, jwtSecret, jwtExpiry) => {
  // Generate the JWT token with the provided secret and expiry
  const token = await jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry });

  return token;
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
