const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email) {
          // Regular expression for email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        },
        message: "Invalid email address",
        code: "INVALID_EMAIL", // Set the error code for invalid email
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 10,
      validate: {
        validator: function (username) {
          // Regular expression for alphanumeric username
          const usernameRegex = /^[a-zA-Z0-9]+$/;
          return usernameRegex.test(username);
        },
        message: "Username can only contain letters and numbers",
        code: "INVALID_USERNAME", // Set the error code for invalid username
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate: {
        validator: function (password) {
          // Regular expression for password with alphanumeric and special characters
          const passwordRegex =
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
          return passwordRegex.test(password);
        },
        message:
          "Password must be alphanumeric and have a minimum length of 8 characters, including at least one special character",
        code: "INVALID_PASSWORD", // Set the error code for invalid password
      },
    },
    profilePic: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiration: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Encrypt password before saving to the database
userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    return next();
  } catch (error) {
    return next(error);
  }
});

// Method to compare passwords for login
userSchema.methods.comparePassword = async function (password) {
  const match = await bcrypt.compare(password, this.password);
  return match;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
