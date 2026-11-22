const bus = require('./eventBus');

bus.on('user:registered', (user) => {
  console.log(`[event] user:registered -> ${user.username} (${user.email}) role=${user.role}`);
});

bus.on('user:loggedIn', (user) => {
  console.log(`[event] user:loggedIn -> ${user.username}`);
});

bus.on('user:loginFailed', (email) => {
  console.warn(`[event] user:loginFailed -> ${email}`);
});

bus.on('note:created', (note) => {
  console.log(`[event] note:created -> "${note.title}" by owner ${note.owner}`);
});

bus.on('note:deleted', (note) => {
  console.log(`[event] note:deleted -> "${note.title}" by owner ${note.owner}`);
});

bus.on('chat:connected', (socketId) => console.log(`User connected: ${socketId}`));
bus.on('chat:disconnected', (socketId) => console.log(`User disconnected: ${socketId}`));
bus.on('chat:joined', ({ socketId, room }) => console.log(`${socketId} joined room ${room}`));
bus.on('chat:left', ({ socketId, room }) => console.log(`${socketId} left room ${room}`));

bus.on('chat:message', ({ room, username, text }) => {
  console.log(`[${room}] ${username}: ${text}`);
});
