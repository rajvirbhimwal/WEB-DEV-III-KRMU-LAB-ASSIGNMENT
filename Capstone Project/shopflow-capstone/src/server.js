require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { initializeSocket } = require("./config/socket");
const events = require("./events/appEvents");
const Product = require("./models/Product");

const server = http.createServer(app);
initializeSocket(server);

// EventEmitter decouples business events from notification logic.
events.on("order:placed", async ({ orderId, customerId, sellers }) => {
  console.log(`[EVENT] order:placed ${orderId} customer=${customerId} sellers=${sellers.join(",")}`);
});
events.on("stock:low", ({ productId, sellerId, remaining }) => {
  console.log(`[EVENT] stock:low product=${productId} seller=${sellerId} remaining=${remaining}`);
  // Notify the seller's private Socket.IO room when stock reaches the configured threshold.
  try {
    const { getIO } = require("./config/socket");
    getIO().to(`user:${sellerId}`).emit("seller:stock-low", { productId, remaining });
  } catch (error) {
    console.error("Low-stock notification failed:", error.message);
  }
});

async function start() {
  try {
    await connectDB();
    server.listen(process.env.PORT || 5000, () => console.log(`ShopFlow API listening on port ${process.env.PORT || 5000}`));
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}
if (require.main === module) start();
module.exports = { app, server, start };
