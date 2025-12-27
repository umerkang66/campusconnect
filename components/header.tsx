'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useStore } from '@/store/use-store';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, X, MessageSquare, Target, TrendingUp, Menu } from 'lucide-react';
import ChatWindow from './chat-window';
import { ThemeToggle } from './theme-toggle';

export default function Header() {
  const { data: session } = useSession();
  const { role, toggleRole } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    openChatWith(latestSenderId);
    resetUnread();
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full sticky top-0 z-50 glass border-b border-gray-200 dark:border-neutral-800"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold text-lg hover:text-indigo-500 transition-colors"
        >
          <GraduationCap className="w-7 h-7 text-indigo-500" />
          <span className="gradient-text font-bold hidden sm:inline">CampusConnect</span>
          <span className="gradient-text font-bold sm:hidden">CC</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Link
            href="/jobs"
            className="text-gray-700 dark:text-gray-300 hover:text-indigo-500 transition-colors text-sm font-medium"
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
                <MessageSquare className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Role Toggle */}
              <button
                onClick={toggleRole}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${role === 'FINDER'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  }`}
              >
                {role === 'FINDER' ? (
                  <>
                    <Target className="w-4 h-4" />
                    Finder
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Seeker
                  </>
                )}
              </button>

              <Link
                href="/dashboard"
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-500 transition-colors text-sm font-medium"
              >
                Dashboard
              </Link>

              <Link
                href="/me"
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-500 transition-colors text-sm font-medium"
              >
                Profile
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="btn-secondary text-sm py-1.5 px-4"
              >
                Sign out
              </button>

              <ThemeToggle />
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="btn-primary text-sm py-1.5 px-4">
                Sign in
              </Link>
              <Link href="/auth/signup" className="btn-secondary text-sm py-1.5 px-4">
                Sign up
              </Link>
              <ThemeToggle />
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          {session?.user && (
            <button
              onClick={handleOpenChat}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
              aria-label="Open chat"
            >
              <MessageSquare className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-200 dark:border-neutral-800 overflow-hidden"
          >
            <nav className="px-4 py-4 space-y-3">
              <Link
                href="/jobs"
                onClick={closeMobileMenu}
                className="block text-gray-700 dark:text-gray-300 hover:text-indigo-500 transition-colors font-medium py-2"
              >
                Jobs
              </Link>

              {session?.user ? (
                <>
                  {/* Role Toggle */}
                  <button
                    onClick={() => {
                      toggleRole();
                      closeMobileMenu();
                    }}
                    className={`w-full px-4 py-2.5 text-sm rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${role === 'FINDER'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                      }`}
                  >
                    {role === 'FINDER' ? (
                      <>
                        <Target className="w-4 h-4" />
                        Switch to Seeker
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4" />
                        Switch to Finder
                      </>
                    )}
                  </button>

                  <Link
                    href="/dashboard"
                    onClick={closeMobileMenu}
                    className="block text-gray-700 dark:text-gray-300 hover:text-indigo-500 transition-colors font-medium py-2"
                  >
                    Dashboard
                  </Link>

                  <Link
                    href="/me"
                    onClick={closeMobileMenu}
                    className="block text-gray-700 dark:text-gray-300 hover:text-indigo-500 transition-colors font-medium py-2"
                  >
                    Profile
                  </Link>

                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' });
                      closeMobileMenu();
                    }}
                    className="w-full btn-secondary text-sm py-2.5"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/auth/signin"
                    onClick={closeMobileMenu}
                    className="btn-primary text-sm py-2.5 text-center"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={closeMobileMenu}
                    className="btn-secondary text-sm py-2.5 text-center"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat overlay - Responsive */}
      {chatOpen && (
        <div className="fixed right-0 sm:right-6 top-14 sm:top-16 z-50 w-full sm:w-96 max-w-full">
          <div className="glass-card overflow-hidden shadow-2xl mx-2 sm:mx-0 rounded-xl sm:rounded-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-neutral-800 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
              <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                Chat
              </div>
              <button
                onClick={() => closeChat()}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {activeChatUserId ? (
              <ChatWindow otherUserId={activeChatUserId} />
            ) : (
              <div className="p-6 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No conversations yet.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Start a conversation by messaging a job poster or applicant.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.header>
  );
}
