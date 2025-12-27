'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { getPusher } from '@/lib/socket';
import {
    MessageSquare,
    Search,
    ArrowLeft,
    Send,
    User,
    Check,
    CheckCheck,
} from 'lucide-react';

interface UserInfo {
    _id: string;
    name: string;
    email: string;
    image?: string;
}

interface Message {
    _id: string;
    content: string;
    senderId: { _id: string; name: string; image?: string };
    receiverId: { _id: string; name: string; image?: string };
    read: boolean;
    createdAt: string;
}

interface Conversation {
    _id: string;
    otherUser: UserInfo;
    lastMessage: {
        _id: string;
        content: string;
        createdAt: string;
        senderId: string;
        receiverId: string;
        read: boolean;
    };
    unreadCount: number;
}

export default function MessagesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Fetch all conversations
    useEffect(() => {
        if (status === 'loading') return;
        if (!session?.user) {
            router.push('/auth/signin');
            return;
        }

        const fetchConversations = async () => {
            try {
                const res = await api.get('/conversations');
                setConversations(res.data.conversations || []);

                // Check if there's a userId in the URL to open that conversation
                const userIdParam = searchParams.get('userId');
                if (userIdParam) {
                    const conv = res.data.conversations?.find(
                        (c: Conversation) => c.otherUser._id === userIdParam
                    );
                    if (conv) {
                        setActiveConversation(conv);
                    }
                }
            } catch (error) {
                console.error('Error fetching conversations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [session, status, router, searchParams]);

    // Fetch messages for active conversation
    useEffect(() => {
        if (!activeConversation || !session?.user?.id) return;

        const fetchMessages = async () => {
            try {
                const res = await api.get(`/messages?userId=${activeConversation.otherUser._id}`);
                setMessages(res.data.messages || []);
                scrollToBottom();
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
    }, [activeConversation, session?.user?.id]);

    // Real-time message updates via Pusher
    useEffect(() => {
        if (!session?.user?.id) return;

        const pusher = getPusher();
        if (!pusher) return;

        const channelName = `private-user-${session.user.id}`;
        let channel = pusher.channel(channelName);

        if (!channel) {
            channel = pusher.subscribe(channelName);
        }

        const handleMessage = (msg: Message) => {
            // Update messages if this is the active conversation
            if (
                activeConversation &&
                (msg.senderId._id === activeConversation.otherUser._id ||
                    msg.receiverId._id === activeConversation.otherUser._id)
            ) {
                setMessages((prev) => [...prev, msg]);
                scrollToBottom();
            }

            // Update conversation list
            setConversations((prev) => {
                const otherUserId =
                    msg.senderId._id === session.user?.id
                        ? msg.receiverId._id
                        : msg.senderId._id;

                const existingIndex = prev.findIndex(
                    (c) => c.otherUser._id === otherUserId
                );

                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        lastMessage: {
                            _id: msg._id,
                            content: msg.content,
                            createdAt: msg.createdAt,
                            senderId: msg.senderId._id,
                            receiverId: msg.receiverId._id,
                            read: msg.read,
                        },
                        unreadCount:
                            msg.senderId._id !== session.user?.id
                                ? updated[existingIndex].unreadCount + 1
                                : updated[existingIndex].unreadCount,
                    };
                    // Move to top
                    const [movedConv] = updated.splice(existingIndex, 1);
                    return [movedConv, ...updated];
                }

                return prev;
            });
        };

        channel.bind('new-message', handleMessage);

        return () => {
            channel?.unbind('new-message', handleMessage);
        };
    }, [session?.user?.id, activeConversation]);

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeConversation || sending) return;

        setSending(true);
        try {
            await api.post('/messages', {
                receiverId: activeConversation.otherUser._id,
                content: newMessage.trim(),
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const filteredConversations = conversations.filter((conv) =>
        conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-60px)] bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            <div className="max-w-6xl mx-auto h-full flex">
                {/* Conversations Sidebar */}
                <div
                    className={`w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-neutral-800 flex flex-col bg-white/50 dark:bg-neutral-900/50 ${activeConversation ? 'hidden md:flex' : 'flex'
                        }`}
                >
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-neutral-800">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                            <MessageSquare className="w-6 h-6 text-indigo-500" />
                            Messages
                        </h1>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800 border-none text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                                <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
                                <p className="text-center">No conversations yet</p>
                                <p className="text-sm text-center mt-1">
                                    Start chatting with job posters or applicants!
                                </p>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
                                <motion.div
                                    key={conv._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => setActiveConversation(conv)}
                                    className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors border-b border-gray-100 dark:border-neutral-800 ${activeConversation?._id === conv._id
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20'
                                            : ''
                                        }`}
                                >
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        {conv.otherUser.image ? (
                                            <img
                                                src={conv.otherUser.image}
                                                alt={conv.otherUser.name}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                                {conv.otherUser.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        {conv.unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                {conv.otherUser.name}
                                            </h3>
                                            <span className="text-xs text-gray-500 flex-shrink-0">
                                                {formatTime(conv.lastMessage.createdAt)}
                                            </span>
                                        </div>
                                        <p
                                            className={`text-sm truncate ${conv.unreadCount > 0
                                                    ? 'text-gray-900 dark:text-white font-medium'
                                                    : 'text-gray-500'
                                                }`}
                                        >
                                            {conv.lastMessage.senderId === session?.user?.id && (
                                                <span className="text-gray-400">You: </span>
                                            )}
                                            {conv.lastMessage.content}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div
                    className={`flex-1 flex flex-col ${activeConversation ? 'flex' : 'hidden md:flex'
                        }`}
                >
                    {activeConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
                                <button
                                    onClick={() => setActiveConversation(null)}
                                    className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                {activeConversation.otherUser.image ? (
                                    <img
                                        src={activeConversation.otherUser.image}
                                        alt={activeConversation.otherUser.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                        {activeConversation.otherUser.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h2 className="font-semibold text-gray-900 dark:text-white">
                                        {activeConversation.otherUser.name}
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        {activeConversation.otherUser.email}
                                    </p>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-neutral-950/50">
                                <AnimatePresence initial={false}>
                                    {messages.map((msg) => {
                                        const isMe = msg.senderId._id === session?.user?.id;
                                        return (
                                            <motion.div
                                                key={msg._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${isMe
                                                            ? 'bg-indigo-500 text-white rounded-br-md'
                                                            : 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded-bl-md shadow-sm'
                                                        }`}
                                                >
                                                    <p className="break-words">{msg.content}</p>
                                                    <div
                                                        className={`flex items-center gap-1 mt-1 text-xs ${isMe ? 'text-indigo-200' : 'text-gray-400'
                                                            }`}
                                                    >
                                                        <span>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                        {isMe && (
                                                            msg.read ? (
                                                                <CheckCheck className="w-3.5 h-3.5" />
                                                            ) : (
                                                                <Check className="w-3.5 h-3.5" />
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-gray-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                        className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 dark:bg-neutral-800 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!newMessage.trim() || sending}
                                        className="p-3 rounded-2xl bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Empty State */
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                                <MessageSquare className="w-12 h-12 text-indigo-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Your Messages
                            </h2>
                            <p className="text-center max-w-sm">
                                Select a conversation from the sidebar to start chatting
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
