const router = require("express").Router();
const c = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/auth");
router.use(protect, authorize("admin"));
router.get("/sales", c.salesSummary);
router.get("/best-sellers", c.bestSellers);
router.get("/inventory", c.inventory);
module.exports = router;
