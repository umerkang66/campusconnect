import Pusher from 'pusher-js';
import { useStore } from '@/store/use-store';

let pusher: Pusher | null = null;
let currentChannel: any = null;

export function initPusher(userId?: string) {
  if (pusher) return pusher;

  // Initialize Pusher client
  pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: '/api/pusher/auth',
  });

  if (userId) {
    // Subscribe to user's private channel
    const channelName = `private-user-${userId}`;
    currentChannel = pusher.subscribe(channelName);

    currentChannel.bind('pusher:subscription_succeeded', () => {
      console.log('[Pusher] Successfully subscribed to', channelName);
    });

    currentChannel.bind('pusher:subscription_error', (error: any) => {
      console.error('[Pusher] Subscription error:', error);
    });

    // Listen for incoming messages
    currentChannel.bind('new-message', (msg: any) => {
      try {
        console.log('[Pusher] Message received:', msg);

        // Extract IDs, handling both string and object formats
        const receiverId = msg.receiverId?._id || msg.receiverId;
        const senderId = msg.senderId?._id || msg.senderId;

        console.log('[Pusher] Parsed IDs:', {
          receiverId,
          senderId,
          myUserId: userId,
        });

        // Only increment unread if this message is for current user and not from them
        if (receiverId === userId && senderId !== userId) {
          console.log('[Pusher] Message is for me, checking chat state...');

          const state = useStore.getState();
          console.log('[Pusher] Current chat state:', {
            chatOpen: state.chatOpen,
            activeChatUserId: state.activeChatUserId,
            unreadCount: state.unreadCount,
          });

          // Always track latest sender
          useStore.setState(state => ({
            latestSenderId: senderId,
            unreadCount:
              state.chatOpen && state.activeChatUserId === senderId
                ? state.unreadCount // don't increment if chat is open with sender
                : state.unreadCount + 1,
          }));

          console.log('[Pusher] Updated store:', useStore.getState());
        }
      } catch (err) {
        console.error('[Pusher] Message handling error:', err);
      }
    });
  }

  return pusher;
}

export function getPusher() {
  return pusher;
}

export function getCurrentChannel() {
  return currentChannel;
}

export function disconnectPusher() {
  if (currentChannel) {
    currentChannel.unbind_all();
    currentChannel.unsubscribe();
    currentChannel = null;
  }
  if (pusher) {
    pusher.disconnect();
    pusher = null;
  }
}

