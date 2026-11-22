const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, maxlength: 2000 },
  price: { type: Number, required: true, min: 0.01 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  images: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, price: 1, isActive: 1 });
productSchema.index({ seller: 1, createdAt: -1 });
module.exports = mongoose.model("Product", productSchema);
