'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { initSocket } from '@/lib/socket';

// This component initializes the socket connection as soon as a user is authenticated
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      // Initialize socket connection when user is authenticated
      initSocket(session.user.id);
    }
  }, [session?.user?.id]);

  return <>{children}</>;
}