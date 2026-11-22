const User = require('../models/User');
const Note = require('../models/Note');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/admin/users
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort('createdAt');
  res.json({ count: users.length, users });
});

// GET /api/admin/notes   (all notes from all users)
exports.getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find().populate('owner', 'username email').sort('createdAt');
  res.json({ count: notes.length, notes });
});

// DELETE /api/admin/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    throw new ApiError(400, 'Admins cannot delete their own account');
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  await Note.deleteMany({ owner: user.id });
  res.json({ message: 'User and their notes deleted', id: user.id });
});
