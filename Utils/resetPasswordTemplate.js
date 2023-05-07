// resetPasswordTemplate.js

const resetPasswordTemplate = (resetToken, resetUrl) => `
  <html>
    <head>
      <style>
        /* Add your custom CSS styles here */
        body {
          font-family: Arial, sans-serif;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .logo {
          text-align: center;
          margin-bottom: 20px;
        }
        .reset-button {
          display: block;
          width: 200px;
          margin: 0 auto;
          padding: 10px;
          text-align: center;
          background-color: #007bff;
          color: #ffffff;
          text-decoration: none;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" alt="Logo" width="200">
        </div>
        <h2>Password Reset</h2>
        <p>You have requested a password reset.</p>
        <p>Please click the following button to reset your password:</p>
        <a class="reset-button" href="${resetUrl}/${resetToken}">Reset Password</a>
      </div>
    </body>
  </html>
`;

module.exports = resetPasswordTemplate;
