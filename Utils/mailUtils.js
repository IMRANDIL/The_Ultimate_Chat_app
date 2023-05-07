const nodemailer = require("nodemailer");

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
      text: `You have requested a password reset. Please click the following link to reset your password: ${process.env.RESET_PASSWORD_URL}/${resetToken}`, // Plain text body
      html: `<p>You have requested a password reset. Please click the following link to reset your password:</p><p><a href="${process.env.RESET_PASSWORD_URL}/${resetToken}">Reset Password</a></p>`, // HTML body
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
