const {
  handleValidationError,
} = require("../Middlewares/customErrorMiddleware");
const User = require("../Models/userModel");
const sendResetPasswordEmail = require("../Utils/mailUtils");
const UserUtility = require("../Utils/userUtility");

const {
  getIPAddress,
  generateJWTToken,
  validateEmail,
  generateUniqueResetToken,
} = require("../Utils/utils");

class UserController {
  static userSignUp = async (req, res, next) => {
    try {
      const { email, username, password, file } = req.body;
      if (!email || !username || !password || !file) {
        const err = new Error("All the fields required!");
        err.statusCode = 400;
        err.code = "MISSING_FIELDS"; // Set custom error code
        return next(err);
      }
      //check if email is in valid format....at first..
      const isValidEmail = validateEmail(email);

      if (!isValidEmail) {
        const err = new Error("Invalid Email!");
        err.statusCode = 400;
        err.code = "INVALID_EMAIL_FORMAT"; // Set custom error code
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

      // Check if the username is already taken
      const isUsernameTaken = await UserUtility.isUsernameUnique(username);
      if (isUsernameTaken) {
        const err = new Error(isUsernameTaken);
        err.statusCode = 409; // Conflict - Username already exists
        err.code = "USERNAME_EXISTS"; // Set custom error code
        return next(err);
      }

      const ipAddress = getIPAddress(req);
      //now save the user in the db
      const user = new User({
        username,
        password,
        email,
        ipAddress,
        profilePic: file,
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

  static userLogin = async (req, res, next) => {
    try {
      let user;
      const { email, password } = req.body;
      if (!email || !password) {
        const err = new Error("All the fields required!");
        err.statusCode = 400;
        err.code = "MISSING_FIELDS"; // Set custom error code
        return next(err);
      }
      const isValidEmail = validateEmail(email);

      if (!isValidEmail) {
        const err = new Error("Invalid Email!");
        err.statusCode = 400;
        err.code = "INVALID_EMAIL_FORMAT"; // Set custom error code
        return next(err);
      }

      const isUserExist = await UserUtility.isEmailUnique(email);

      if (!isUserExist) {
        const err = new Error("User does not exist!");
        err.statusCode = 404;
        err.code = "NOT_FOUND"; // Set custom error code
        return next(err);
      }
      try {
        user = await User.findOne({ email });
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
          const err = new Error("Invalid Credentials!");
          err.statusCode = 401;
          err.code = "INVALID_CREDENTIALS"; // Set custom error code
          return next(err);
        }

        const ipAddress = getIPAddress(req);
        user.ipAddress = ipAddress;
        await user.save();
      } catch (error) {
        const err = new Error(error.message);
        err.statusCode = 400;
        err.code = "VALIDATION_ERROR";
      }

      const accessToken = await generateJWTToken(
        user._id,
        process.env.JWT_SECRET,
        process.env.JWT_SECRET_EXPIRATION
      );

      const refreshToken = await generateJWTToken(
        user._id,
        process.env.JWT_REFRESH_SECRET,
        process.env.JWT_REFRESH_SECRET_EXPIRATION
      );

      // Set cookies in the response

      // Set cookies in the response
      res.cookie("accessToken", accessToken, {
        expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // Expires in hour
        secure: false,
        httpOnly: true,
        sameSite: "lax",
      });

      res.cookie("refreshToken", refreshToken, {
        expires: new Date(Date.now() + 3 * 60 * 60 * 1000), // Expires in 3 hours
        secure: false,
        httpOnly: true,
        sameSite: "lax",
      });
      //now send the response
      res.status(200).json({
        email: user.email,
        username: user.username,
        id: user._id,
        profilePic: user.profilePic,
        loggedInAt: new Date(),
      });

      //
    } catch (error) {
      console.log(error);
      return next(error);
    }
  };

  static getNewAccessToken = async (req, res, next) => {
    try {
      const accessToken = await generateJWTToken(
        req.user._id,
        process.env.JWT_SECRET,
        process.env.JWT_SECRET_EXPIRATION
      );

      const refreshToken = await generateJWTToken(
        req.user._id,
        process.env.JWT_REFRESH_SECRET,
        process.env.JWT_REFRESH_SECRET_EXPIRATION
      );

      // Set cookies in the response
      res.cookie("accessToken", accessToken, {
        expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // Expires in hour
        secure: false,
        httpOnly: true,
        sameSite: "lax",
      });

      res.cookie("refreshToken", refreshToken, {
        expires: new Date(Date.now() + 3 * 60 * 60 * 1000), // Expires in 3 hours
        secure: false,
        httpOnly: true,
        sameSite: "lax",
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      return next(error);
    }
  };

  //all users but not the logged in user...

  static allUsers = async (req, res, next) => {
    const keyword = req.query.search
      ? {
          $or: [
            { username: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    try {
      const allUser = await User.find(
        keyword,
        "_id email username profilePic"
      ).find({
        _id: { $ne: req.user._id },
      });
      res.status(200).json({
        data: allUser,
      });
    } catch (error) {
      return next(error.message);
    }
  };

  static forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;
      let user, resetToken;

      if (!email) {
        const err = new Error("Email is required!");
        err.statusCode = 400;
        err.code = "MISSING_FIELD"; // Set custom error code
        return next(err);
      }

      // Validate the email format
      const isValidEmail = validateEmail(email);
      if (!isValidEmail) {
        const err = new Error("Invalid Email!");
        err.statusCode = 400;
        err.code = "INVALID_EMAIL_FORMAT";
        return next(err);
      }

      try {
        // Check if the user exists
        user = await User.findOne({ email });
        if (!user) {
          const err = new Error("User not found!");
          err.statusCode = 404;
          err.code = "USER_NOT_FOUND";
          return next(err);
        }

        // Generate a unique reset token and save it to the user object
        resetToken = generateUniqueResetToken();
        const resetTokenExpiration = Date.now() + 3600000; // Token expiration time (1 hour)
        await User.updateOne(
          { _id: user._id },
          { $set: { resetToken, resetTokenExpiration } }
        ); //without the model validation..direct
      } catch (error) {
        const err = new Error(error.message);
        err.statusCode = 400;
        err.code = "VALIDATION_ERROR";
      }

      // Send an email to the user with the reset token
      await sendResetPasswordEmail(user.email, resetToken, next);
      // Send a success response
      res
        .status(200)
        .json({ message: "Reset token sent to the email address" });
    } catch (error) {
      return next(error);
    }
  };

  static resetPassword = async (req, res, next) => {
    try {
      let user;
      const { resetToken, newPassword } = req.body;
      if (!resetToken || !newPassword) {
        const err = new Error("Reset token and new password are required!");
        err.statusCode = 400;
        err.code = "MISSING_FIELD";
        return next(err);
      }

      try {
        // Check if the reset token is valid and has not expired
        user = await User.findOne({
          resetToken,
          resetTokenExpiration: { $gt: Date.now() },
        });

        if (!user) {
          const err = new Error("Invalid or expired reset token!");
          err.statusCode = 400;
          err.code = "INVALID_RESET_TOKEN";
          return next(err);
        }

        // Set the new password
        user.password = newPassword;
        // Clear the reset token and expiration
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        // Save the updated user object
        await user.save();
      } catch (error) {
        const err = new Error(err.message);
        err.statusCode = 400;
        err.code = "VALIDATION_ERROR";
      }

      // Send a success response
      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      return next(error);
    }
  };

  static logOutUser = (req, res, next) => {
    // Clear cookies on the server-side
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    // Redirect or send a response indicating successful logout
    res.json({ message: "Logged out successfully" });
  };
}

module.exports = UserController;
