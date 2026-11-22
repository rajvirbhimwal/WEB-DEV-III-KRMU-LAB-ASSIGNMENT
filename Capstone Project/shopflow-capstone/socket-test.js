const { io } = require("socket.io-client");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VsbGVyIiwiaWF0IjoxNzk1MjY3NDczLCJleHAiOjE3OTUyNjgzNzMsInN1YiI6IjZhZmQ4MGNlYTUxOTg2NTMzZjdlNjI3MSJ9.cXZmerPsEVcW2QU12x4ISnm1ISkGLZzzeFE6WCr8GhQ";

const socket = io("http://localhost:5000", {
  auth: {
    token: token
  }
});

socket.on("connect", () => {
  console.log("Connected to ShopFlow Socket.IO!");
  console.log("Socket ID:", socket.id);
});

socket.on("socket:ready", (data) => {
  console.log("Socket authentication successful!");
  console.log("User ID:", data.userId);
});

socket.on("connect_error", (error) => {
  console.log("Connection failed:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});
socket.on("order:updated", (data) => {
  console.log("REAL-TIME ORDER UPDATE RECEIVED!");
  console.log(data);
});
socket.on("seller:new-order", (data) => {
  console.log("NEW ORDER NOTIFICATION RECEIVED BY SELLER!");
  console.log(data);
});
socket.on("seller:stock-low", (data) => {
  console.log("LOW-STOCK NOTIFICATION RECEIVED BY SELLER!");
  console.log(data);
});