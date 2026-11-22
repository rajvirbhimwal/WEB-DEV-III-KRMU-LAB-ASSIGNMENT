const Order = require("../models/Order");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");

exports.salesSummary = asyncHandler(async (req, res) => {
  const match = { status: { $ne: "cancelled" } };
  if (req.query.from || req.query.to) {
    match.createdAt = {};
    if (req.query.from) match.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) match.createdAt.$lte = new Date(req.query.to);
  }
  const summary = await Order.aggregate([
    { $match: match },
    { $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: "$subtotal" }, averageOrderValue: { $avg: "$subtotal" } } },
    { $project: { _id: 0, orders: 1, revenue: { $round: ["$revenue", 2] }, averageOrderValue: { $round: ["$averageOrderValue", 2] } } }
  ]);
  const byDay = await Order.aggregate([
    { $match: match },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, orders: { $sum: 1 }, revenue: { $sum: "$subtotal" } } },
    { $sort: { _id: 1 } }
  ]);
  res.json({ success: true, data: { summary: summary[0] || { orders: 0, revenue: 0, averageOrderValue: 0 }, byDay } });
});

exports.bestSellers = asyncHandler(async (req, res) => {
  const data = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $unwind: "$items" },
    { $group: { _id: "$items.product", productName: { $first: "$items.name" }, unitsSold: { $sum: "$items.quantity" }, revenue: { $sum: "$items.lineTotal" } } },
    { $sort: { unitsSold: -1 } },
    { $limit: Math.min(20, Number(req.query.limit) || 10) }
  ]);
  res.json({ success: true, data });
});

exports.inventory = asyncHandler(async (req, res) => {
  const data = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$category", products: { $sum: 1 }, totalUnits: { $sum: "$stock" }, lowStockProducts: { $sum: { $cond: [{ $lte: ["$stock", Number(process.env.LOW_STOCK_THRESHOLD) || 5] }, 1, 0] } } } },
    { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    { $project: { category: "$category.name", products: 1, totalUnits: 1, lowStockProducts: 1 } },
    { $sort: { lowStockProducts: -1 } }
  ]);
  res.json({ success: true, data });
});
