const express = require('express');
const ctrl = require('../controllers/productController');
const {
  validateObjectId,
  sanitizeBody,
  validateCreate,
  validateUpdate,
  validateStockChange,
} = require('../middleware/validate');

const router = express.Router();

// NOTE: static routes must be declared BEFORE '/:id', otherwise
// "low-stock" and "summary" would be treated as an id.
router.get('/low-stock', ctrl.getLowStock);
router.get('/summary', ctrl.getCategorySummary);

router.route('/')
  .get(ctrl.getProducts)
  .post(sanitizeBody, validateCreate, ctrl.createProduct);

router.patch('/:id/stock', validateObjectId, validateStockChange, ctrl.adjustStock);

router.route('/:id')
  .get(validateObjectId, ctrl.getProductById)
  .put(validateObjectId, sanitizeBody, validateUpdate, ctrl.updateProduct)
  .delete(validateObjectId, ctrl.deleteProduct);

module.exports = router;
