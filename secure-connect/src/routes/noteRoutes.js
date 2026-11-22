const express = require('express');
const ctrl = require('../controllers/noteController');
const { authenticate } = require('../middleware/auth');
const { validateObjectId, validateNote } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate); // every notes route is protected

router.route('/')
  .get(ctrl.getNotes)
  .post(validateNote, ctrl.createNote);

router.route('/:id')
  .get(validateObjectId, ctrl.getNote)
  .put(validateObjectId, validateNote, ctrl.updateNote)
  .delete(validateObjectId, ctrl.deleteNote);

module.exports = router;
