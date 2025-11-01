import { Server } from 'socket.io';
import http from 'http';

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: '*' },
});

io.on('connection', socket => {
  console.log('Socket connected', socket.id);

  // If client provided userId via auth on connect, join that room
  const handshakeUserId = socket.handshake?.auth?.userId;
  if (handshakeUserId) {
    socket.join(handshakeUserId);
  }

  socket.on('join', userId => {
    if (userId) socket.join(userId);
  });

  // Expect the client to send the full message object (as returned from the API).
  // The server will act as a relay only (the API already persists messages).
  socket.on('message', msg => {
    try {
      // receiverId might be a string or an object with _id when populated.
      const receiverId =
        typeof msg.receiverId === 'string'
          ? msg.receiverId
          : msg.receiverId && msg.receiverId._id
          ? msg.receiverId._id
          : null;

      // Emit to receiver room if we can determine the id
      if (receiverId) {
        io.to(receiverId).emit('message', msg);
      }

      // Also send back to the sender socket for optimistic UI / confirmation
      socket.emit('message', msg);
    } catch (err) {
      console.error('Error handling message event', err);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket server listening on port ${PORT}`);
});
