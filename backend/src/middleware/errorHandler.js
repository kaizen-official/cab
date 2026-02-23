const ApiError = require("../utils/ApiError");
const { config } = require("../config");

function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors.length > 0 ? err.errors : undefined,
    });
  }

  console.error("[unhandled]", err);

  return res.status(500).json({
    success: false,
    message: config.isDev ? err.message : "Internal server error",
  });
}

module.exports = errorHandler;
