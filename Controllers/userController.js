const {
  handleValidationError,
} = require("../Middlewares/customErrorMiddleware");
const User = require("../Models/userModel");
const UserUtility = require("../Utils/userUtility");
const { getIPAddress } = require("../Utils/utils");

class UserController {
  static userSignUp = async (req, res, next) => {
    try {
      const { email, username, password } = req.body;
      if (!email || !username || !password) {
        const err = new Error("All the fields required!");
        err.statusCode = 400;
        err.code = "MISSING_FIELDS"; // Set custom error code
        return next(err);
      }
      // Check if the username is already taken
      const isUsernameTaken = await UserUtility.isUsernameUnique(username);
      if (isUsernameTaken) {
        const err = new Error(isUsernameTaken);
        err.statusCode = 409; // Conflict - Username already exists
        err.code = "USERNAME_EXISTS"; // Set custom error code
        return next(err);
      }

      // Check if the email is already registered
      const isEmailRegistered = await UserUtility.isEmailUnique(email);
      if (isEmailRegistered) {
        const err = new Error(isEmailRegistered);
        err.statusCode = 409; // Conflict - Email already registered
        err.code = "EMAIL_EXISTS"; // Set custom error code
        return next(err);
      }
      const ipAddress = getIPAddress(req);
      //now save the user in the db
      const user = new User({
        username,
        password,
        email,
        ipAddress,
      });
      try {
        await user.save();
        // Send a success response
        res.status(201).json({ message: "User signed up successfully" });
      } catch (error) {
        handleValidationError(error, "password", next);
        handleValidationError(error, "username", next);
        handleValidationError(error, "email", next);
      }
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = UserController;
