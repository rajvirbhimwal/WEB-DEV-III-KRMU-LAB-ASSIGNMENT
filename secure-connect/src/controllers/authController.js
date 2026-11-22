const bcrypt = require('bcrypt');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const bus = require('../events/eventBus');
const { signToken } = require('../utils/token');

const SALT_ROUNDS = 10;

const adminEmails = () =>
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

// POST /api/auth/signup
exports.signup = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  // Role is never taken from the request body (prevents self-promotion to admin)
  const role = adminEmails().includes(email.trim().toLowerCase()) ? 'admin' : 'user';

  const user = await User.create({ username, email, password: hashed, role });

  bus.emit('user:registered', user);
  res.status(201).json({
    message: 'User registered',
    id: user.id,
    username: user.username,
    email: user.email,
  });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  const valid = user && (await bcrypt.compare(password, user.password));
  if (!valid) {
    bus.emit('user:loginFailed', email);
    // Same message for unknown email and wrong password
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken(user);

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  bus.emit('user:loggedIn', user);
  res.json({ message: 'Login successful', token });
});

// POST /api/auth/logout
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};

// GET /api/auth/me
exports.me = (req, res) => {
  res.json(req.user);
};
