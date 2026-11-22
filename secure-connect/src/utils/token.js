const jwt = require('jsonwebtoken');

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

// Minimal cookie parser (no cookie-parser dependency)
const parseCookies = (header = '') =>
  header.split(';').reduce((acc, part) => {
    const idx = part.indexOf('=');
    if (idx > -1) {
      const key = part.slice(0, idx).trim();
      acc[key] = decodeURIComponent(part.slice(idx + 1).trim());
    }
    return acc;
  }, {});

// Token may come from "Authorization: Bearer <token>" or from the "token" cookie
const extractToken = (authHeader, cookieHeader) => {
  if (authHeader && authHeader.startsWith('Bearer ')) return authHeader.slice(7).trim();
  return parseCookies(cookieHeader).token || null;
};

module.exports = { signToken, verifyToken, parseCookies, extractToken };
