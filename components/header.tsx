'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useStore } from '@/store/use-store';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import ChatWindow from './chat-window';
import { X } from 'lucide-react';

export default function Header() {
  const { data: session } = useSession();
  const { role, toggleRole } = useStore();

  const {
    unreadCount,
    latestSenderId,
    openChatWith,
    chatOpen,
    closeChat,
    activeChatUserId,
    resetUnread,
  } = useStore();

  const handleOpenChat = () => {
    // open with latest sender if available
    openChatWith(latestSenderId);
    // clear badge (we assume user will see messages)
    resetUnread();
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-neutral-900/70 border-b border-gray-200 dark:border-neutral-800 shadow-sm"
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold text-lg hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <GraduationCap className="w-6 h-6" />
          <span>CampusConnect</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <Link
            href="/jobs"
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors text-sm font-medium"
          >
            Jobs
          </Link>

          {session?.user ? (
            <>
              {/* Chat button */}
              <button
                onClick={handleOpenChat}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                aria-label="Open chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-700 dark:text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4-.8L3 20l1.2-3A7.966 7.966 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={toggleRole}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all duration-200"
              >
                {role}
              </button>

              <Link
                href="/dashboard"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors text-sm font-medium"
              >
                Dashboard
              </Link>

              <Link
                href="/me"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors text-sm font-medium"
              >
                Me
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="cursor-pointer px-4 py-2 text-sm font-semibold rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 shadow-md"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 shadow-md"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all duration-200"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Chat overlay */}
      {chatOpen && (
        <div className="fixed right-6 top-16 z-50 w-96">
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-neutral-800">
              <div className="font-semibold">Chat</div>
              <button
                onClick={() => {
                  closeChat();
                }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {activeChatUserId ? (
              <ChatWindow otherUserId={activeChatUserId} />
            ) : (
              <div className="p-4 text-sm text-gray-500">
                No conversations yet.
              </div>
            )}
          </div>
        </div>
      )}
    </motion.header>
  );
}
