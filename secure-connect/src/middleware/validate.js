const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ApiError(400, 'Invalid ID'));
  }
  next();
};

const validateSignup = (req, res, next) => {
  const { username, email, password } = req.body || {};
  if (!isNonEmptyString(username) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
    return next(new ApiError(400, 'username, email and password are required'));
  }
  if (password.length < 6) {
    return next(new ApiError(400, 'Password must be at least 6 characters'));
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    return next(new ApiError(400, 'email and password are required'));
  }
  next();
};

const validateNote = (req, res, next) => {
  const { title, content } = req.body || {};
  if (!isNonEmptyString(title) || !isNonEmptyString(content)) {
    return next(new ApiError(400, 'title and content are required'));
  }
  next();
};

module.exports = { validateObjectId, validateSignup, validateLogin, validateNote };
