'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { LogIn, Github, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    const toastId = toast.loading('Signing you in...');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (!res || res.error) {
        toast.error(res?.error || 'Invalid email or password.', {
          id: toastId,
        });
      } else {
        toast.success('Signed in successfully!', { id: toastId });
        router.push('/dashboard');
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong. Please try again.';
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  async function handleGithubSignIn() {
    const toastId = toast.loading('Redirecting to GitHub...');
    try {
      await signIn('github', { callbackUrl: '/dashboard' });
    } catch {
      toast.error('GitHub sign-in failed. Please try again.', { id: toastId });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Gradient border wrapper */}
        <div className="animated-gradient p-[1px] rounded-2xl">
          <div className="glass-card p-8 rounded-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-bg flex items-center justify-center animate-pulse-glow"
              >
                <LogIn className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">
                <span className="gradient-text">Welcome Back</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Sign in to continue your journey
              </p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-4">
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  placeholder="Email address"
                  required
                  disabled={loading}
                  className="input-modern disabled:opacity-60 disabled:cursor-not-allowed"
                />

                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type="password"
                  placeholder="Password"
                  required
                  disabled={loading}
                  className="input-modern disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex justify-end">
                <Link
                  href="/auth/reset-request"
                  className="text-sm text-indigo-500 hover:text-indigo-400 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className={`w-full btn-primary flex items-center justify-center gap-2 py-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-neutral-700 to-transparent" />
              <span className="text-sm text-gray-500 dark:text-gray-400">or continue with</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-neutral-700 to-transparent" />
            </div>

            {/* GitHub Sign-in */}
            <motion.button
              onClick={handleGithubSignIn}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full btn-secondary flex items-center justify-center gap-3 py-3 disabled:opacity-60"
            >
              <Github className="w-5 h-5" />
              <span className="font-medium">GitHub</span>
            </motion.button>

            {/* Footer */}
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-6">
              Don't have an account?{' '}
              <Link
                href="/auth/signup"
                className="gradient-text font-semibold hover:opacity-80 transition-opacity"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex justify-center"
        >
          <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Join 2,000+ students already connected
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
