import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface User extends DefaultUser {
    emailVerified?: string | undefined;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      emailVerified?: string | undefined;
    } & DefaultSession['user'];
  }

  interface JWT {
    id?: string;
    emailVerified?: string | undefined;
  }
}
