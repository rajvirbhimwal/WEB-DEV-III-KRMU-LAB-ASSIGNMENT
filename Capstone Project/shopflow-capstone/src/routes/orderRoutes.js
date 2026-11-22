const router = require("express").Router();
const c = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");
router.post("/checkout", protect, authorize("customer"), c.checkout);
router.get("/mine", protect, authorize("customer"), c.myOrders);
router.get("/:id", protect, c.getOne);
router.patch("/:id/status", protect, authorize("customer", "seller", "admin"), c.updateStatus);
module.exports = router;
