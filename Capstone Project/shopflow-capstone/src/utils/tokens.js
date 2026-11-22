const jwt = require("jsonwebtoken");
const crypto = require("crypto");

function signAccess(user) {
  return jwt.sign({ role: user.role }, process.env.JWT_ACCESS_SECRET, {
    subject: user._id.toString(),
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m"
  });
}
function signRefresh(user, tokenId) {
  return jwt.sign({ role: user.role, tokenId }, process.env.JWT_REFRESH_SECRET, {
    subject: user._id.toString(),
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d"
  });
}
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
module.exports = { signAccess, signRefresh, hashToken };
