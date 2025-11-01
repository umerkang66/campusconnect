'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, DollarSign, Eye, X } from 'lucide-react';

interface UserType {
  _id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  university?: string;
  major?: string;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  location?: string;
  salary?: string;
  views: number;
  creatorId: UserType;
}

export default function JobPage() {
  const { id } = useParams();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);

  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState('');

  // Fetch current session
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        setCurrentUserId(data?.user?.id || null);
      } catch (err) {
        console.error(err);
      }
    }
    fetchSession();
  }, []);

  // Fetch job post
  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        const data = await res.json();
        if (!res.ok) toast.error(data.error || 'Failed to load job');
        else setJob(data.job);
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || 'Failed to delete job');
      else {
        toast.success('Job deleted successfully');
        router.push('/jobs');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  async function handleApply() {
    if (!coverLetter || !resume) {
      toast.error('Please fill in all fields');
      return;
    }
    setApplying(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobPostId: id,
          coverLetter,
          resume,
        }),
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || 'Failed to apply');
      else {
        toast.success('Applied successfully!');
        setShowApplyModal(false);
        setCoverLetter('');
        setResume('');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    } finally {
      setApplying(false);
    }
  }

  if (loading)
    return (
      <p className="text-center mt-20 text-gray-500 dark:text-gray-400">
        Loading...
      </p>
    );
  if (!job)
    return (
      <p className="text-center mt-20 text-gray-500 dark:text-gray-400">
        Job not found
      </p>
    );

  const isCreator = currentUserId === job.creatorId._id;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-5xl mx-auto mt-10 p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-800 transition-colors"
      >
        {/* Job Title */}
        <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          {job.title}
        </h1>

        {/* Creator Info */}
        <div className="flex items-center gap-4 mb-8 bg-gray-50 dark:bg-neutral-800 p-4 rounded-xl shadow-sm">
          {job.creatorId.image ? (
            <Image
              src={job.creatorId.image}
              alt={job.creatorId.name}
              width={70}
              height={70}
              className="rounded-full border border-gray-300 dark:border-neutral-700"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 dark:bg-neutral-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300">
              <User className="w-8 h-8" />
            </div>
          )}
          <div>
            <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
              {job.creatorId.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {job.creatorId.university} • {job.creatorId.major}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {job.creatorId.email}
            </p>
            {job.creatorId.bio && (
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                {job.creatorId.bio}
              </p>
            )}
          </div>
        </div>

        {/* Job Details */}
        <div className="text-gray-700 dark:text-gray-300 mb-6 space-y-3">
          <p>{job.description}</p>
          {job.location && (
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>
                <strong>Location:</strong> {job.location}
              </span>
            </p>
          )}
          {job.salary && (
            <p className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>
                <strong>Salary:</strong> {job.salary}
              </span>
            </p>
          )}
          <p className="flex items-center gap-2 text-sm text-gray-400">
            <Eye className="w-4 h-4" /> Views: {job.views}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          {isCreator ? (
            <>
              <button
                onClick={() => router.push(`/jobs/edit/${job._id}`)}
                className="cursor-pointer px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={deleting}
                className={`cursor-pointer px-6 py-2 bg-red-600 text-white font-medium rounded-lg transition shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${
                  deleting
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:bg-red-700'
                }`}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>

              <button
                onClick={() => router.push(`/jobs/${job._id}/applicants`)}
                className="cursor-pointer px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                Applicants
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowApplyModal(true)}
              className="cursor-pointer px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              Apply
            </button>
          )}
        </div>
      </motion.div>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-200 dark:border-neutral-800"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Confirm Deletion
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to delete this job? This action cannot be
                undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                    deleting
                      ? 'bg-red-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apply Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-lg w-full shadow-xl border border-gray-200 dark:border-neutral-800"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Apply for Job
                </h3>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                placeholder="Cover Letter"
                className="w-full p-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white h-28 mb-4 resize-none"
                disabled={applying}
              />
              <textarea
                value={resume}
                onChange={e => setResume(e.target.value)}
                placeholder="Resume"
                className="w-full p-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white h-28 mb-4 resize-none"
                disabled={applying}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                    applying
                      ? 'bg-green-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {applying ? 'Applying...' : 'Apply'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
