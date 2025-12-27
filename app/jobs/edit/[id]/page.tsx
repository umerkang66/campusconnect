'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import JobForm from '@/components/job-form';
import { Edit3, Sparkles, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface JobData {
  _id: string;
  title: string;
  description: string;
  type: string;
  tags: string[];
  requirements: string[];
  compensation?: string;
  duration?: string;
  status: string;
}

export default function EditJobPage() {
  const { id } = useParams();
  const router = useRouter();
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await api.get(`/jobs/${id}`);
        const data = res.data.job;

        if (!data) {
          toast.error('Job not found');
          router.push('/dashboard/finder/my-jobs');
        } else {
          setJobData(data);
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Failed to fetch job');
        router.push('/dashboard/finder/my-jobs');
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!jobData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 py-12 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/dashboard/finder/my-jobs"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-500 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Jobs
          </Link>
        </motion.div>

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
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center animate-pulse-glow"
          >
            <Edit3 className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Edit Opportunity</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Update your job posting details
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
            <span className="text-sm text-gray-600 dark:text-gray-300">Instant Updates</span>
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
              <JobForm initialData={jobData} isEdit />
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
          💡 Tip: Keep your job description updated to attract the best candidates
        </motion.p>
      </div>
    </div>
  );
}
