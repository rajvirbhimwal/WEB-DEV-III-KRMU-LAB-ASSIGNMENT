const Cart = require("../models/Cart");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

async function getPopulated(userId) {
  let cart = await Cart.findOne({ user: userId }).populate("items.product", "name price stock images isActive");
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}
exports.get = asyncHandler(async (req, res) => {
  const cart = await getPopulated(req.user._id);
  const items = cart.items.filter(i => i.product && i.product.isActive).map(i => ({
    product: i.product, quantity: i.quantity, lineTotal: Number((i.product.price * i.quantity).toFixed(2))
  }));
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
  res.json({ success: true, data: { items, total: Number(total.toFixed(2)) } });
});
exports.add = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId || !Number.isInteger(Number(quantity)) || Number(quantity) < 1) throw new ApiError(400, "Valid productId and positive integer quantity are required");
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) throw new ApiError(404, "Product not found");
  if (product.stock < Number(quantity)) throw new ApiError(409, "Insufficient stock");
  const cart = await Cart.findOneAndUpdate({ user: req.user._id }, { $setOnInsert: { user: req.user._id }, $set: { updatedAt: new Date() } }, { upsert: true, new: true });
  const existing = cart.items.find(i => i.product.toString() === productId);
  if (existing) existing.quantity += Number(quantity);
  else cart.items.push({ product: productId, quantity: Number(quantity) });
  await cart.save();
  res.status(200).json({ success: true, message: "Cart updated", data: cart });
});
exports.update = asyncHandler(async (req, res) => {
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) throw new ApiError(400, "Quantity must be a positive integer");
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");
  const item = cart.items.find(i => i.product.toString() === req.params.productId);
  if (!item) throw new ApiError(404, "Cart item not found");
  const product = await Product.findById(item.product);
  if (!product || product.stock < quantity) throw new ApiError(409, "Requested quantity is not currently available");
  item.quantity = quantity;
  await cart.save();
  res.json({ success: true, data: cart });
});
exports.remove = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");
  cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
  await cart.save();
  res.json({ success: true, message: "Item removed", data: cart });
});
exports.clear = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } }, { upsert: true });
  res.json({ success: true, message: "Cart cleared" });
});
