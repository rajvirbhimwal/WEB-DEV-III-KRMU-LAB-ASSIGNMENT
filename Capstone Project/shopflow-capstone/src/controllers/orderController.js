const crypto = require("crypto");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const events = require("../events/appEvents");
const { getIO } = require("../config/socket");

const transitions = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: []
};

exports.checkout = asyncHandler(async (req, res) => {
  const { deliveryAddress, paymentMethod = "simulated_cod" } = req.body;
  if (!deliveryAddress || !["fullName", "phone", "line1", "city", "state", "postalCode"].every(k => deliveryAddress[k])) {
    throw new ApiError(400, "Complete deliveryAddress is required");
  }
  if (!["simulated_cod", "simulated_online"].includes(paymentMethod)) throw new ApiError(400, "Unsupported simulated payment method");
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || !cart.items.length) throw new ApiError(400, "Cart is empty");

  const reserved = [];
  const orderItems = [];
  try {
    for (const item of cart.items) {
      const product = await Product.findOneAndUpdate(
        { _id: item.product, isActive: true, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!product) throw new ApiError(409, "A product is unavailable or has insufficient stock; cart was not checked out");
      reserved.push({ productId: product._id, quantity: item.quantity });
      if (product.stock <= (Number(process.env.LOW_STOCK_THRESHOLD) || 5)) {
        events.emit("stock:low", { productId: product._id, sellerId: product.seller, remaining: product.stock });
      }
      orderItems.push({
        product: product._id, seller: product.seller, name: product.name,
        unitPrice: product.price, quantity: item.quantity,
        lineTotal: Number((product.price * item.quantity).toFixed(2))
      });
    }
    const subtotal = Number(orderItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
    const order = await Order.create({
      orderNumber: `SF-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
      customer: req.user._id, items: orderItems, subtotal, deliveryAddress,
      payment: { method: paymentMethod, status: paymentMethod === "simulated_online" ? "simulated_paid" : "pending", reference: `SIM-${crypto.randomUUID()}` },
      statusHistory: [{ status: "placed", note: "Order placed successfully" }]
    });
    cart.items = [];
    await cart.save();
    events.emit("order:placed", { orderId: order._id, customerId: req.user._id, sellers: [...new Set(orderItems.map(i => i.seller.toString()))] });
    const io = getIO();
    io.to(`user:${req.user._id}`).emit("order:updated", { orderId: order._id, orderNumber: order.orderNumber, status: "placed" });
    for (const sellerId of new Set(orderItems.map(i => i.seller.toString()))) io.to(`user:${sellerId}`).emit("seller:new-order", { orderId: order._id, orderNumber: order.orderNumber });
    res.status(201).json({ success: true, message: "Order placed. Payment is simulated for this academic project.", data: order });
  } catch (error) {
    for (const item of reserved) await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } });
    throw error;
  }
});

exports.myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, data: orders });
});
exports.getOne = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("customer", "name email");
  if (!order) throw new ApiError(404, "Order not found");
  const isCustomer = order.customer._id.toString() === req.user._id.toString();
  const isSeller = order.items.some(i => i.seller.toString() === req.user._id.toString());
  if (req.user.role !== "admin" && !isCustomer && !isSeller) throw new ApiError(403, "Not allowed to view this order");
  res.json({ success: true, data: order });
});
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status, note = "" } = req.body;
  if (!status) throw new ApiError(400, "status is required");
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  const sellerOwnsOrder = order.items.some(i => i.seller.toString() === req.user._id.toString());
  const isCustomer = order.customer.toString() === req.user._id.toString();
  if (req.user.role !== "admin" && !sellerOwnsOrder && !(status === "cancelled" && isCustomer)) {
    throw new ApiError(403, "You cannot update this order");
  }
  if (!transitions[order.status]?.includes(status)) throw new ApiError(400, `Invalid status transition: ${order.status} -> ${status}`);
  if (status === "cancelled") {
    if (req.user.role !== "admin" && !isCustomer) throw new ApiError(403, "Only the customer or admin can cancel this order");
    for (const item of order.items) await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
  }
  order.status = status;
  order.statusHistory.push({ status, note, changedAt: new Date() });
  await order.save();
  getIO().to(`user:${order.customer}`).emit("order:updated", { orderId: order._id, orderNumber: order.orderNumber, status });
  res.json({ success: true, data: order });
});
