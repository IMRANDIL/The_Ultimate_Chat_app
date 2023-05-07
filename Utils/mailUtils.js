const nodemailer = require("nodemailer");
const resetPasswordTemplate = require("./resetPasswordTemplate");

// Function to send the reset password email
const sendResetPasswordEmail = async (email, resetToken, next) => {
  try {
    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // Set to true if using SSL/TLS
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Compose the email message
    const message = {
      from: process.env.EMAIL_FROM, // Sender email address
      to: email, // Recipient email address
      subject: "Password Reset", // Email subject
      html: resetPasswordTemplate(resetToken, process.env.RESET_PASSWORD_URL),
    };
    // Send the email
    await transporter.sendMail(message);
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    err.code = "NODE_MAILER_ERROR";
    return next(err);
  }
};

module.exports = sendResetPasswordEmail;
