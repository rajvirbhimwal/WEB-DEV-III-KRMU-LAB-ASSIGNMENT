const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { signAccess, signRefresh, hashToken } = require("../utils/tokens");
const jwt = require("jsonwebtoken");

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) throw new ApiError(400, "Name, email and password are required");
  if (password.length < 8) throw new ApiError(400, "Password must contain at least 8 characters");
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, "Email is already registered");
  const user = await User.create({ name, email, password, phone, role: "customer" });
  res.status(201).json({ success: true, message: "Customer account created", data: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required");
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !user.isActive || !(await user.comparePassword(password))) throw new ApiError(401, "Invalid email or password");
  const accessToken = signAccess(user);
  const refreshToken = signRefresh(user, require("crypto").randomUUID());
  const decoded = jwt.decode(refreshToken);
  user.refreshTokens.push({ tokenHash: hashToken(refreshToken), expiresAt: new Date(decoded.exp * 1000) });
  await user.save();
  res.json({ success: true, data: { accessToken, refreshToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
});

exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, "Refresh token is required");
  let payload;
  try { payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET); }
  catch { throw new ApiError(401, "Invalid or expired refresh token"); }
  const user = await User.findById(payload.sub);
  const tokenHash = hashToken(refreshToken);
  const stored = user?.refreshTokens.find(t => t.tokenHash === tokenHash && t.expiresAt > new Date());
  if (!user || !stored || !user.isActive) throw new ApiError(401, "Refresh token has been revoked");
  user.refreshTokens = user.refreshTokens.filter(t => t.tokenHash !== tokenHash);
  const accessToken = signAccess(user);
  const newRefreshToken = signRefresh(user, require("crypto").randomUUID());
  const decoded = jwt.decode(newRefreshToken);
  user.refreshTokens.push({ tokenHash: hashToken(newRefreshToken), expiresAt: new Date(decoded.exp * 1000) });
  await user.save();
  res.json({ success: true, data: { accessToken, refreshToken: newRefreshToken } });
});

exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    const hash = hashToken(refreshToken);
    await User.updateOne({ _id: req.user._id }, { $pull: { refreshTokens: { tokenHash: hash } } });
  }
  res.json({ success: true, message: "Logged out; supplied refresh token revoked" });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const allowed = ["name", "phone"];
  for (const key of Object.keys(req.body)) if (!allowed.includes(key)) throw new ApiError(400, `Field '${key}' cannot be updated here`);
  const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true }).select("-password -refreshTokens");
  res.json({ success: true, data: user });
});
