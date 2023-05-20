const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");

exports.authMiddleware = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Token is present in the authorization header
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.accessToken) {
    // Token is present in the accessToken cookie
    token = req.cookies.accessToken;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      const err = new Error("Authorization Failed, Invalid Token");
      err.statusCode = 401;
      err.code = "AUTHORIZATION_ERROR";
      return next(err);
    }
  } else {
    const err = new Error("Authorization Failed, No Token");
    err.statusCode = 401;
    err.code = "AUTHORIZATION_ERROR";
    return next(err);
  }
};

exports.accessTokenMiddleware = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    const err = new Error("Refresh token is required");
    err.statusCode = 401;
    err.code = "AUTHORIZATION_ERROR";
    return next(err);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      const err = new Error("Invalid refresh token, Authentication Failed!");
      err.statusCode = 401;
      err.code = "AUTHORIZATION_ERROR";
      return next(err);
    }

    req.user = user;
    next();
  } catch (error) {
    const err = new Error("Invalid refresh token");
    err.statusCode = 401;
    err.code = "AUTHORIZATION_ERROR";
    return next(err);
  }
};
