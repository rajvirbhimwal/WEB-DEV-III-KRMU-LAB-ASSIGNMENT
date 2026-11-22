const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 }
  }],
  subtotal: { type: Number, required: true, min: 0 },
  deliveryAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true }
  },
  payment: {
    method: { type: String, enum: ["simulated_cod", "simulated_online"], default: "simulated_cod" },
    status: { type: String, enum: ["simulated_paid", "pending", "refunded"], default: "pending" },
    reference: String
  },
  status: { type: String, enum: ["placed", "confirmed", "packed", "shipped", "delivered", "cancelled"], default: "placed" },
  statusHistory: [{ status: String, note: String, changedAt: { type: Date, default: Date.now } }]
}, { timestamps: true });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ "items.seller": 1, status: 1, createdAt: -1 });
module.exports = mongoose.model("Order", orderSchema);
