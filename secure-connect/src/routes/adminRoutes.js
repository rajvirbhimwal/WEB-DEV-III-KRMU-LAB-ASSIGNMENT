const express = require('express');
const ctrl = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validate');

const router = express.Router();

// RBAC: only admins can use these routes
router.use(authenticate, authorize('admin'));

router.get('/users', ctrl.getUsers);
router.get('/notes', ctrl.getAllNotes);
router.delete('/users/:id', validateObjectId, ctrl.deleteUser);

module.exports = router;
