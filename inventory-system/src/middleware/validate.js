const mongoose = require('mongoose');

const fail = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// Ensures :id is a valid MongoDB ObjectId
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(fail('Invalid product ID'));
  }
  next();
};

const ALLOWED_FIELDS = ['name', 'sku', 'category', 'price', 'quantity', 'reorderLevel', 'supplier'];
const REQUIRED_FIELDS = ['name', 'sku', 'category', 'price', 'quantity'];
const NUMERIC_FIELDS = ['price', 'quantity', 'reorderLevel'];

// Keeps only allowed fields and checks basic types
const sanitizeBody = (req, res, next) => {
  const source = req.body || {};
  const body = {};
  for (const key of ALLOWED_FIELDS) {
    if (source[key] !== undefined) body[key] = source[key];
  }

  for (const key of NUMERIC_FIELDS) {
    if (body[key] !== undefined && (typeof body[key] !== 'number' || Number.isNaN(body[key]))) {
      return next(fail(`${key} must be a number`));
    }
  }

  req.body = body;
  next();
};

const validateCreate = (req, res, next) => {
  const missing = REQUIRED_FIELDS.filter((f) => req.body[f] === undefined || req.body[f] === '');
  if (missing.length) return next(fail(`Missing required field(s): ${missing.join(', ')}`));
  next();
};

const validateUpdate = (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(fail('Provide at least one valid field to update'));
  }
  next();
};

const validateStockChange = (req, res, next) => {
  const { change } = req.body || {};
  if (typeof change !== 'number' || !Number.isInteger(change) || change === 0) {
    return next(fail("'change' must be a non-zero integer (positive = restock, negative = sale)"));
  }
  next();
};

module.exports = { validateObjectId, sanitizeBody, validateCreate, validateUpdate, validateStockChange };
