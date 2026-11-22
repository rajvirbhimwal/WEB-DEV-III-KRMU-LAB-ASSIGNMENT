const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) throw new ApiError(401, "Authentication token required");
  let payload;
  try {
    payload = jwt.verify(header.slice(7), process.env.JWT_ACCESS_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }
  const user = await User.findById(payload.sub).select("-password -refreshTokens");
  if (!user || !user.isActive) throw new ApiError(401, "User account is unavailable");
  req.user = user;
  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new ApiError(403, "You do not have permission to perform this action"));
  next();
};

module.exports = { protect, authorize };
