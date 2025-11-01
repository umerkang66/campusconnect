'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useStore } from '@/store/use-store';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { data: session } = useSession();
  const { role } = useStore();

  if (!session)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-500">
          Please sign in to access your dashboard.
        </p>
      </div>
    );

  const cards =
    role === 'FINDER'
      ? [
          {
            title: 'Create Job',
            href: '/create-job',
            description: 'Post a new job for talent to apply.',
          },
        ]
      : [
          {
            title: 'Browse Jobs',
            href: '/jobs',
            description: 'Find opportunities that match your skills.',
          },
          {
            title: 'Applied Jobs',
            href: '/applied-jobs',
            description: 'Your Applied Jobs.',
          },
        ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">Welcome, {session.user?.name}</h1>
      <p className="text-gray-500 mb-8">
        Role: <span className="font-medium">{role}</span>
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {cards.map(card => (
          <motion.div
            key={card.href}
            whileHover={{ scale: 1.03 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 cursor-pointer transition-shadow hover:shadow-lg"
          >
            <Link href={card.href} className="block">
              <h2 className="text-xl font-semibold mb-2">{card.title}</h2>
              <p className="text-gray-600 dark:text-gray-300">
                {card.description}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
