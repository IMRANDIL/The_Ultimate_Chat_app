exports.customErrorHandler = (err, req, res, next) => {
  // Set a default status code and error message
  let status = 500;
  let message = "Internal server error";
  let errorCode = null;

  // Handle different types of errors
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    status = 400;
    message = "Invalid JSON payload";
    errorCode = "INVALID_PAYLOAD";
  } else {
    status = err.statusCode || status;
    message = err.message || message;
    errorCode = err.code || errorCode;
  }

  // Send the appropriate status code and error message to the client
  res.status(status).json({ error: { message, code: errorCode } });
};

exports.handleValidationError = (error, field, next) => {
  if (error.name === "ValidationError" && error.errors && error.errors[field]) {
    const validationError = error.errors[field];
    const err = new Error(`${validationError.message}`);
    err.statusCode = 400;
    err.code = "VALIDATION_ERROR";
    return next(err);
  }
};
