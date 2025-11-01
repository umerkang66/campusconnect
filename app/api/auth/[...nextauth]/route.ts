import NextAuth, { User as NextAuthUser, AuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import mongoose from 'mongoose';

export const authOptions: AuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).select(
          '+password'
        );

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        if (!user.emailVerified) {
          throw new Error('Email Not Verified. Go to your email to verify.');
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified?.toString(), // ✅ include here too
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      await connectDB();

      if (account?.provider === 'github') {
        let existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          // MongoDB will auto-generate _id
          existingUser = await User.create({
            email: user.email,
            name: user.name || profile?.name,
            image: user.image,
            emailVerified: new Date(),
          });
        }
        // Attach MongoDB _id to user object for JWT
        user.id = existingUser._id.toString();
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;

        const isValid = mongoose.Types.ObjectId.isValid(user.id);

        if (isValid) {
          await connectDB();
          const foundUser = await User.findById(user.id);

          token.emailVerified = foundUser?.emailVerified;
        } else {
          token.emailVerified = new Date();
        }
      }

      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.emailVerified = token.emailVerified as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
