const router = require("express").Router();
const c = require("../controllers/productController");
const { protect, authorize } = require("../middleware/auth");
router.get("/", c.list);
router.get("/:id", c.getOne);
router.post("/", protect, authorize("seller", "admin"), c.create);
router.patch("/:id", protect, authorize("seller", "admin"), c.update);
router.delete("/:id", protect, authorize("seller", "admin"), c.remove);
module.exports = router;
