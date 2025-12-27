'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  Rocket,
  Target,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Award,
  GraduationCap,
  Zap,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const stats = [
  { label: 'Active Jobs', value: '500+', icon: Briefcase },
  { label: 'Students Connected', value: '2,000+', icon: Users },
  { label: 'Successful Matches', value: '850+', icon: Target },
  { label: 'Universities', value: '25+', icon: GraduationCap },
];

const features = [
  {
    icon: Rocket,
    title: 'Startup Collaborations',
    description:
      'Find co-founders and teammates for your next big idea. Connect with passionate innovators.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Briefcase,
    title: 'Part-Time Jobs',
    description:
      'Discover flexible work opportunities that fit your schedule and build your experience.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Award,
    title: 'Hackathon Teams',
    description:
      'Build winning teams for competitions. Match with complementary skills and interests.',
    color: 'from-orange-500 to-yellow-500',
  },
  {
    icon: GraduationCap,
    title: 'Academic Projects',
    description:
      'Collaborate on research, presentations, and academic endeavors with peers.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Matching',
    description:
      'Our smart algorithm finds perfect matches based on your skills, interests, and goals.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Chat',
    description:
      'Connect instantly with potential collaborators through our seamless messaging system.',
    color: 'from-pink-500 to-rose-500',
  },
];

const benefits = [
  'Smart skill-based matching algorithm',
  'Real-time messaging with collaborators',
  'Application tracking dashboard',
  'AI-powered job recommendations',
  'Profile match score for every opportunity',
  'Draft saving for job posts',
];

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // Show nothing while checking authentication
  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
            >
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Trusted by 25+ Universities
              </span>
            </motion.div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              <span className="text-gray-900 dark:text-white">Connect. </span>
              <span className="gradient-text">Collaborate. </span>
              <span className="text-gray-900 dark:text-white">Create.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              The ultimate talent discovery platform for university students.
              Find collaborators, jobs, and opportunities — all within your
              campus community.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/auth/signup" className="btn-primary inline-flex items-center gap-2 text-lg">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/jobs" className="btn-secondary inline-flex items-center gap-2 text-lg">
                  <Briefcase className="w-5 h-5" />
                  Browse Opportunities
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="glass-card p-6 card-hover"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-indigo-500" />
                <div className="text-3xl font-bold gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Everything you need</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From finding the perfect team to landing your dream gig — we've
              got you covered.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="glass-card p-8 card-hover group"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-indigo-50/50 to-transparent dark:via-indigo-950/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text-accent">Two Modes, One Platform</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Switch seamlessly between finding talent and seeking opportunities.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Talent Finder */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card p-8 card-hover border-l-4 border-indigo-500"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Talent Finder
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Post opportunities and find the perfect candidates for your
                projects, startups, or teams.
              </p>
              <ul className="space-y-3">
                {[
                  'Post jobs with AI-enhanced descriptions',
                  'View applicant profiles & match scores',
                  'Manage applications with ease',
                  'Real-time analytics dashboard',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Talent Seeker */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card p-8 card-hover border-l-4 border-cyan-500"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl gradient-bg-accent flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Talent Seeker
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Discover opportunities that match your skills and interests
                with personalized recommendations.
              </p>
              <ul className="space-y-3">
                {[
                  'AI-powered job recommendations',
                  'See your match score for each job',
                  'Track your applications',
                  'Save and bookmark opportunities',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl animated-gradient p-1"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-12 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                Ready to find your perfect match?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Join thousands of students who are already connecting,
                collaborating, and creating amazing things together.
              </p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/auth/signup"
                  className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
                >
                  Start Your Journey
                  <Sparkles className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-500" />
            <span className="font-semibold text-gray-900 dark:text-white">
              CampusConnect
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 CampusConnect. Built for SURGE '25 Hackathon.
          </p>
        </div>
      </footer>
    </main>
  );
}
