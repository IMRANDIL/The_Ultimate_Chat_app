const jwt = require("jsonwebtoken");

exports.generateJWTToken = (payload, jwtSecret, jwtExpiry) => {
  // Generate the JWT token with the provided secret and expiry
  const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry });

  return token;
};
