import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initSocket(userId?: string) {
  if (socket) return socket;
  const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
  socket = io(url, {
    auth: { userId }, // send userId to server for joining room
  });

  socket.on('connect', () => {
    if (userId) {
      socket?.emit('join', userId); // join own room
    }
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
