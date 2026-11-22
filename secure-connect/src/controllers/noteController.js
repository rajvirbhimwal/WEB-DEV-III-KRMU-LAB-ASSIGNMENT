const Note = require('../models/Note');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const bus = require('../events/eventBus');

// POST /api/notes
exports.createNote = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const note = await Note.create({ title, content, owner: req.user.id });
  bus.emit('note:created', note);
  res.status(201).json(note);
});

// GET /api/notes   (only the logged-in user's notes)
exports.getNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ owner: req.user.id }).sort('createdAt');
  res.json(notes);
});

// GET /api/notes/:id
exports.getNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, owner: req.user.id });
  if (!note) throw new ApiError(404, 'Note not found');
  res.json(note);
});

// PUT /api/notes/:id
exports.updateNote = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    { $set: { title, content } },
    { new: true, runValidators: true }
  );
  if (!note) throw new ApiError(404, 'Note not found');
  res.json(note);
});

// DELETE /api/notes/:id
exports.deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!note) throw new ApiError(404, 'Note not found');
  bus.emit('note:deleted', note);
  res.json({ message: 'Note deleted', id: note.id });
});
