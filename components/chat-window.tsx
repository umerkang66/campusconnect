'use client';

import { getPusher } from '@/lib/socket';
import api from '@/lib/api';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatWindow({ otherUserId }: { otherUserId: string }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const ref = useRef<HTMLDivElement | null>(null);

  const scrollBottom = () => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages?userId=${otherUserId}`);
        setMessages(res.data.messages || []);
        scrollBottom();
      } catch (e) {
        console.error(e);
      }
    };

    fetchMessages();

    const pusher = getPusher();
    if (!pusher) {
      console.warn('[ChatWindow] Pusher not initialized');
      return;
    }

    // Get the already-subscribed channel
    const channelName = `private-user-${session.user.id}`;
    let channel = pusher.channel(channelName);

    // If channel doesn't exist, subscribe to it
    if (!channel) {
      console.log('[ChatWindow] Subscribing to channel:', channelName);
      channel = pusher.subscribe(channelName);
    }

    console.log('[ChatWindow] Setting up message handler for channel:', channelName);

    const handleMessage = (msg: any) => {
      console.log('[ChatWindow] Message received:', msg);

      // Only push messages between these two users
      if (
        (msg.senderId._id === otherUserId &&
          msg.receiverId._id === session.user.id) ||
        (msg.senderId._id === session.user.id &&
          msg.receiverId._id === otherUserId)
      ) {
        console.log('[ChatWindow] Adding message to chat');
        setMessages(m => [...m, msg]);
        scrollBottom();
      } else {
        console.log('[ChatWindow] Message not for this conversation');
      }
    };

    channel.bind('new-message', handleMessage);

    return () => {
      if (channel) {
        channel.unbind('new-message', handleMessage);
      }
    };
  }, [otherUserId, session?.user?.id]);

  const send = async () => {
    if (!text.trim() || !session?.user?.id) return;

    const messagePayload = {
      senderId: session.user.id,
      receiverId: otherUserId,
      content: text,
    };

    try {
      // API route will handle sending the message via Pusher
      await api.post('/messages', messagePayload);
      setText('');
      scrollBottom();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[500px] border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-lg bg-white dark:bg-neutral-900 overflow-hidden">
      <div className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 font-semibold text-gray-800 dark:text-gray-100">
        Chat
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map(m => {
            const isMe = m.senderId._id === session?.user?.id;
            return (
              <motion.div
                key={m._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex flex-col max-w-xs ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl break-words shadow-sm text-sm ${isMe
                    ? 'bg-green-500 text-white rounded-br-none'
                    : 'bg-gray-200 dark:bg-neutral-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                    }`}
                >
                  {m.content}
                </div>
                <span className="text-xs text-gray-400 mt-1">
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={ref} />
      </div>

      <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          className="flex-1 p-3 rounded-2xl border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-600"
        />
        <button
          onClick={send}
          className="cursor-pointer px-4 py-2 rounded-2xl bg-green-500 text-white hover:bg-green-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
