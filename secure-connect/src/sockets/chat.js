const User = require('../models/User');
const Message = require('../models/Message');
const bus = require('../events/eventBus');
const { verifyToken, extractToken } = require('../utils/token');

const DEFAULT_ROOM = 'general';
const ROOM_REGEX = /^[a-zA-Z0-9_-]{1,30}$/;
const MAX_MESSAGE_LENGTH = 1000;
const HISTORY_LIMIT = 20;

module.exports = (io) => {
  // Authenticate every socket using the same JWT as the REST API.
  // Token can be sent as socket.handshake.auth.token or via the "token" cookie.
  io.use(async (socket, next) => {
    try {
      const { auth, headers } = socket.handshake;
      const rawToken = auth && auth.token ? String(auth.token) : null;
      const token = rawToken
        ? rawToken.replace(/^Bearer\s+/i, '')
        : extractToken(null, headers.cookie);

      if (!token) return next(new Error('No token provided'));

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));

      socket.user = { id: user.id, username: user.username, role: user.role };
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    bus.emit('chat:connected', socket.id);

    const joinRoom = async (room) => {
      if (typeof room !== 'string' || !ROOM_REGEX.test(room)) {
        return socket.emit('chatError', 'Invalid room name');
      }
      if (socket.rooms.has(room)) return;

      socket.join(room);
      bus.emit('chat:joined', { socketId: socket.id, room });

      socket.emit('joinedRoom', room);
      socket.to(room).emit('systemMessage', {
        room,
        text: `${socket.user.username} joined the room`,
        createdAt: new Date(),
      });

      const history = await Message.find({ room }).sort('-createdAt').limit(HISTORY_LIMIT);
      socket.emit('history', { room, messages: history.reverse() });
    };

    const leaveRoom = (room) => {
      if (!socket.rooms.has(room) || room === socket.id) return;
      socket.leave(room);
      bus.emit('chat:left', { socketId: socket.id, room });
      socket.emit('leftRoom', room);
      socket.to(room).emit('systemMessage', {
        room,
        text: `${socket.user.username} left the room`,
        createdAt: new Date(),
      });
    };

    // Everyone starts in the default room
    joinRoom(DEFAULT_ROOM).catch(console.error);

    socket.on('joinRoom', (room) => joinRoom(room).catch(console.error));
    socket.on('leaveRoom', leaveRoom);

    socket.on('chatMessage', async (payload) => {
      try {
        const room = payload && payload.room ? payload.room : DEFAULT_ROOM;
        const text = payload && typeof payload.text === 'string' ? payload.text.trim() : '';

        if (!socket.rooms.has(room)) return socket.emit('chatError', 'Join the room first');
        if (!text) return socket.emit('chatError', 'Message cannot be empty');
        if (text.length > MAX_MESSAGE_LENGTH) {
          return socket.emit('chatError', `Message too long (max ${MAX_MESSAGE_LENGTH})`);
        }

        const saved = await Message.create({
          room,
          sender: socket.user.id,
          username: socket.user.username,
          text,
        });

        io.to(room).emit('message', {
          room,
          username: saved.username,
          text: saved.text,
          createdAt: saved.createdAt,
        });
        bus.emit('chat:message', { room, username: saved.username, text: saved.text });
      } catch (err) {
        console.error(err);
        socket.emit('chatError', 'Could not send message');
      }
    });

    socket.on('typing', (room) => {
      if (typeof room === 'string' && socket.rooms.has(room)) {
        socket.to(room).emit('typing', { room, username: socket.user.username });
      }
    });

    socket.on('disconnect', () => bus.emit('chat:disconnected', socket.id));
  });
};
