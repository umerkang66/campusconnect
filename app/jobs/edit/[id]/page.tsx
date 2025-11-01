'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '@/lib/api';

export default function EditJobPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'INTERNSHIP',
    tags: '',
    requirements: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await api.get(`/jobs/${id}`);
        const data = res.data.job;

        if (!data) {
          toast.error('Job not found');
          router.push('/jobs');
        } else {
          setForm({
            title: data.title,
            description: data.description,
            type: data.type || 'INTERNSHIP',
            tags: data.tags?.join(', ') || '',
            requirements: data.requirements?.join(', ') || '',
          });
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Failed to fetch job');
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.patch(`/jobs/${id}`, {
        ...form,
        tags: form.tags
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        requirements: form.requirements
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      });
      toast.success('Job updated successfully');
      router.push(`/jobs/${id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update job');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <p className="text-center mt-20 text-gray-500 dark:text-gray-400">
        Loading job...
      </p>
    );

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-neutral-900 dark:to-neutral-950 px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-neutral-800 transition-colors"
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
          Edit Job
        </h2>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-5"
        >
          {/* Job Title */}
          <input
            type="text"
            placeholder="Job Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full p-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            disabled={submitting}
            required
          />

          {/* Job Description */}
          <textarea
            placeholder="Job Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full p-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white h-36 resize-none"
            disabled={submitting}
            required
          />

          {/* Tags */}
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={e => setForm({ ...form, tags: e.target.value })}
            className="w-full p-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            disabled={submitting}
          />

          {/* Requirements */}
          <input
            type="text"
            placeholder="Requirements (comma separated)"
            value={form.requirements}
            onChange={e => setForm({ ...form, requirements: e.target.value })}
            className="w-full p-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            disabled={submitting}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 text-white font-semibold rounded-lg shadow-md transition-all flex justify-center items-center ${
              submitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {submitting ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            ) : (
              'Update Job'
            )}
          </button>
        </motion.form>
      </motion.div>
    </section>
  );
}
