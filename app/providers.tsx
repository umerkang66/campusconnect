// app/providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from '@/components/socket-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SocketProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <Toaster />
          {children}
        </Suspense>
      </SocketProvider>
    </SessionProvider>
  );
}
