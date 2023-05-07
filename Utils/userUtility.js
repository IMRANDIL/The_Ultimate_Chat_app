const User = require("../Models/userModel");

class UserUtility {
  static async isUsernameUnique(username) {
    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return `Username '${username}' is already taken`;
      }
      return null; // Username is unique
    } catch (error) {
      throw new Error(`Error checking username uniqueness: ${error.message}`);
    }
  }

  static async isEmailUnique(email) {
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return `Email '${email}' is already registered`;
      }
      return null; // Email is unique
    } catch (error) {
      throw new Error(`Error checking email uniqueness: ${error.message}`);
    }
  }
}

module.exports = UserUtility;
