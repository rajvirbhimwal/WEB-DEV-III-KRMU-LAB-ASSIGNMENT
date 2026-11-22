const Product = require("../models/Product");
const Category = require("../models/Category");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.list = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const filter = { isActive: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }
  if (req.query.search) filter.$text = { $search: req.query.search };
  const sortMap = { price_asc: { price: 1 }, price_desc: { price: -1 }, newest: { createdAt: -1 }, name: { name: 1 } };
  const sort = sortMap[req.query.sort] || { createdAt: -1 };
  const [products, total] = await Promise.all([
    Product.find(filter).populate("category", "name slug").populate("seller", "name").sort(sort).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter)
  ]);
  res.json({ success: true, data: products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
exports.getOne = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isActive: true }).populate("category", "name slug").populate("seller", "name");
  if (!product) throw new ApiError(404, "Product not found");
  res.json({ success: true, data: product });
});
exports.create = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock, images } = req.body;
  if (!name || !description || !price || !category || stock === undefined) throw new ApiError(400, "name, description, price, category and stock are required");
  if (!await Category.exists({ _id: category, isActive: true })) throw new ApiError(400, "Valid active category required");
  const product = await Product.create({ name, description, price, category, stock, images, seller: req.user._id });
  res.status(201).json({ success: true, data: product });
});
exports.update = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || (!["admin"].includes(req.user.role) && product.seller.toString() !== req.user._id.toString())) throw new ApiError(404, "Product not found or not owned by you");
  const allowed = ["name", "description", "price", "category", "stock", "images", "isActive"];
  for (const key of Object.keys(req.body)) if (!allowed.includes(key)) throw new ApiError(400, `Field '${key}' cannot be updated`);
  Object.assign(product, req.body);
  await product.save();
  res.json({ success: true, data: product });
});
exports.remove = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || (req.user.role !== "admin" && product.seller.toString() !== req.user._id.toString())) throw new ApiError(404, "Product not found or not owned by you");
  product.isActive = false;
  await product.save();
  res.json({ success: true, message: "Product deactivated" });
});
