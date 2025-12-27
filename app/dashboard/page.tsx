'use client';

import { useSession } from 'next-auth/react';
import { useStore } from '@/store/use-store';
import FinderDashboard from './finder/page';
import SeekerDashboard from './seeker/page';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const { role } = useStore();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        <p className="text-lg text-gray-500">
          Please sign in to access your dashboard.
        </p>
      </div>
    );
  }

  // Route based on current role
  return role === 'FINDER' ? <FinderDashboard /> : <SeekerDashboard />;
}
