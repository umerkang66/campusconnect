'use client';

import JobForm from '@/components/job-form';
import { motion } from 'framer-motion';
import { Briefcase, Sparkles, Zap } from 'lucide-react';

export default function CreateJob() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 py-12 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-bg flex items-center justify-center animate-pulse-glow"
          >
            <Briefcase className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Create Opportunity</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Post a job, project, or collaboration opportunity
          </p>
        </motion.div>

        {/* Feature badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">AI-Enhanced Descriptions</span>
          </div>
          <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Smart Matching</span>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="animated-gradient p-[1px] rounded-2xl">
            <div className="glass-card p-8 rounded-2xl">
              <JobForm />
            </div>
          </div>
        </motion.div>

        {/* Bottom tip */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6"
        >
          💡 Tip: Use the AI enhancement feature to make your job description more compelling
        </motion.p>
      </div>
    </div>
  );
}
