const Category = require("../models/Category");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.list = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort("name");
  res.json({ success: true, count: categories.length, data: categories });
});
exports.create = asyncHandler(async (req, res) => {
  const { name, slug, description } = req.body;
  if (!name || !slug) throw new ApiError(400, "Name and slug are required");
  const category = await Category.create({ name, slug, description });
  res.status(201).json({ success: true, data: category });
});
exports.update = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) throw new ApiError(404, "Category not found");
  res.json({ success: true, data: category });
});
exports.remove = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!category) throw new ApiError(404, "Category not found");
  res.json({ success: true, message: "Category deactivated" });
});
