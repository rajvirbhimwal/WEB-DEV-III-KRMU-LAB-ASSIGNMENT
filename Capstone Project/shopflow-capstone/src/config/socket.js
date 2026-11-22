const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "*",
      methods: ["GET", "POST", "PATCH"]
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.user = { id: payload.sub, role: payload.role };
      next();
    } catch {
      next(new Error("Invalid or expired socket token"));
    }
  });

  io.on("connection", socket => {
    socket.join(`user:${socket.user.id}`);
    socket.join(`role:${socket.user.role}`);
    socket.emit("socket:ready", { userId: socket.user.id });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.IO has not been initialized");
  return io;
}

module.exports = { initializeSocket, getIO };
