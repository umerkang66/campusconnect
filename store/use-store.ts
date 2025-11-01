import { create } from 'zustand';

interface State {
  role: 'FINDER' | 'SEEKER';
  toggleRole: () => void;

  // Chat UI state
  unreadCount: number;
  unreadMessages: { [senderId: string]: number }; // per-sender unread counts
  latestSenderId: string | null;
  chatOpen: boolean;
  activeChatUserId: string | null;

  // actions
  incrementUnread: (fromId: string) => void;
  resetUnread: (senderId?: string) => void; // reset all or specific sender
  openChatWith: (userId: string | null) => void;
  closeChat: () => void;
}

export const useStore = create<State>(set => ({
  role: 'SEEKER',
  toggleRole: () =>
    set(s => ({ role: s.role === 'SEEKER' ? 'FINDER' : 'SEEKER' })),

  // chat defaults
  unreadCount: 0,
  unreadMessages: {},
  latestSenderId: null,
  chatOpen: false,
  activeChatUserId: null,

  incrementUnread: (fromId: string) =>
    set(state => {
      const currentUnread = state.unreadMessages[fromId] || 0;
      const unreadMessages = {
        ...state.unreadMessages,
        [fromId]: currentUnread + 1
      };
      
      return {
        unreadCount: Object.values(unreadMessages).reduce((a, b) => a + b, 0),
        unreadMessages,
        latestSenderId: fromId
      };
    }),

  resetUnread: (senderId?: string) =>
    set(state => {
      if (senderId) {
        const unreadMessages = { ...state.unreadMessages };
        delete unreadMessages[senderId];
        return {
          unreadMessages,
          unreadCount: Object.values(unreadMessages).reduce((a, b) => a + b, 0)
        };
      }
      return { unreadCount: 0, unreadMessages: {} };
    }),

  openChatWith: userId =>
    set(state => {
      if (userId) {
        // Reset unread for this sender when opening their chat
        const unreadMessages = { ...state.unreadMessages };
        delete unreadMessages[userId];
        return {
          chatOpen: true,
          activeChatUserId: userId,
          unreadMessages,
          unreadCount: Object.values(unreadMessages).reduce((a, b) => a + b, 0)
        };
      }
      return { chatOpen: true, activeChatUserId: userId };
    }),

  closeChat: () => 
    set({ chatOpen: false, activeChatUserId: null }),
}));
