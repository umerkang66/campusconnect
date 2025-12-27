'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { UserPlus, Loader2, Sparkles, ArrowRight, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    university: '',
    major: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const toastId = toast.loading('Creating your account...');

    try {
      await api.post('/auth/signup', form);
      toast.loading('Signing you in...', { id: toastId });

      // Auto sign-in after successful signup
      const signInRes = await signIn('credentials', {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      if (signInRes?.error) {
        toast.error('Account created but sign-in failed. Please sign in manually.', { id: toastId });
        router.push('/auth/signin');
      } else {
        toast.success('Account created successfully!', { id: toastId });
        router.push('/dashboard');
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Signup failed. Please try again.';
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  const inputFields = [
    { key: 'name', placeholder: 'Full name', type: 'text', icon: '👤' },
    { key: 'email', placeholder: 'Email address', type: 'email', icon: '✉️' },
    { key: 'password', placeholder: 'Create a password', type: 'password', icon: '🔒' },
    { key: 'university', placeholder: 'University', type: 'text', icon: '🎓' },
    { key: 'major', placeholder: 'Major / Field of Study', type: 'text', icon: '📚' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float-delayed" />
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
                className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-bg-accent flex items-center justify-center animate-pulse-glow"
              >
                <UserPlus className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">
                <span className="gradient-text-accent">Create Account</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Join the community — it only takes a minute
              </p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              {inputFields.map(({ key, placeholder, type }, index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <input
                    value={(form as any)[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    type={type}
                    placeholder={placeholder}
                    required
                    disabled={loading}
                    className="input-modern disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </motion.div>
              ))}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className={`w-full btn-primary flex items-center justify-center gap-2 py-3 mt-6 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-6">
              Already have an account?{' '}
              <Link
                href="/auth/signin"
                className="gradient-text-accent font-semibold hover:opacity-80 transition-opacity"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex flex-wrap justify-center gap-3"
        >
          <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">25+ Universities</span>
          </div>
          <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">AI-Powered</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
