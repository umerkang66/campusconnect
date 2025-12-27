import './globals.css';
import Header from '@/components/header';
import { Providers } from './providers';

export const metadata = { title: 'CampusConnect' };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Header />
          <main className="pt-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
