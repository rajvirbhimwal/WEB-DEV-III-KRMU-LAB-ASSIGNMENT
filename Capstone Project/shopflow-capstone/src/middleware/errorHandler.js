const ApiError = require("../utils/ApiError");

function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}
function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let details = err.details || undefined;

  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation failed";
    details = Object.values(err.errors).map(e => e.message);
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid resource ID";
  } else if (err.code === 11000) {
    status = 409;
    message = "A record with this unique value already exists";
    details = err.keyValue;
  }

  if (process.env.NODE_ENV !== "production") console.error(err);
  res.status(status).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {})
  });
}
module.exports = { notFound, errorHandler };
