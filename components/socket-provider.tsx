'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { initPusher } from '@/lib/socket';

// This component initializes the Pusher connection as soon as a user is authenticated
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      // Initialize Pusher connection when user is authenticated
      initPusher(session.user.id);
    }
  }, [session?.user?.id]);

  return <>{children}</>;
}

