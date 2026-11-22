const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, maxlength: 60 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, maxlength: 300, default: "" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model("Category", categorySchema);
