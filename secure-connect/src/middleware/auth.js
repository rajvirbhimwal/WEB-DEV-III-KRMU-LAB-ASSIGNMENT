const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken, extractToken } = require('../utils/token');

// Protects a route: requires a valid JWT (Bearer header or "token" cookie)
const authenticate = asyncHandler(async (req, res, next) => {
  const token = extractToken(req.headers.authorization, req.headers.cookie);
  if (!token) throw new ApiError(403, 'No token provided');

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, 'User no longer exists');

  req.user = user;
  next();
});

// Role-based access control: authorize('admin'), authorize('admin', 'user') ...
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Access denied: insufficient permissions'));
  }
  next();
};

module.exports = { authenticate, authorize };
