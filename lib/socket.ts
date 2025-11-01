import { io, Socket } from 'socket.io-client';
import { useStore } from '@/store/use-store';

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

  // Global incoming message handler: update unread counter and latest sender
  socket.on('message', (msg: any) => {
    try {
      console.log('[Socket] Message received:', msg);
      
      // Extract IDs, handling both string and object formats
      const receiverId = msg.receiverId?._id || msg.receiverId;
      const senderId = msg.senderId?._id || msg.senderId;

      console.log('[Socket] Parsed IDs:', { receiverId, senderId, myUserId: userId });
      
      // only increment unread if this message is for current user and not from them
      if (receiverId === userId && senderId !== userId) {
        console.log('[Socket] Message is for me, checking chat state...');
        
        const state = useStore.getState();
        console.log('[Socket] Current chat state:', {
          chatOpen: state.chatOpen,
          activeChatUserId: state.activeChatUserId,
          unreadCount: state.unreadCount
        });

        // Always track latest sender
        useStore.setState(state => ({
          latestSenderId: senderId,
          unreadCount: state.chatOpen && state.activeChatUserId === senderId 
            ? state.unreadCount  // don't increment if chat is open with sender
            : state.unreadCount + 1
        }));

        console.log('[Socket] Updated store:', useStore.getState());
      }
    } catch (err) {
      console.error('[Socket] Message handling error:', err);
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
