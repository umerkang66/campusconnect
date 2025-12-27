'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import {
  User,
  MapPin,
  DollarSign,
  Eye,
  X,
  Clock,
  Briefcase,
  Tag,
  CheckCircle,
  Upload,
  FileText,
  Sparkles,
  Loader2,
  MessageSquare,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import ChatWindow from '@/components/chat-window';
import { useStore } from '@/store/use-store';
import ReactMarkdown from 'react-markdown';

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
  type: string;
  tags: string[];
  requirements: string[];
  compensation?: string;
  duration?: string;
  status: string;
  views: number;
  createdAt: string;
  creatorId: UserType;
}

export default function JobPage() {
  const { id } = useParams();
  const router = useRouter();
  const { openChatWith } = useStore();

  const [showChatWindow, setShowChatWindow] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

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

  // Fetch match score and saved status
  useEffect(() => {
    async function fetchExtras() {
      if (!currentUserId || !job) return;

      try {
        const scoreRes = await api.post('/match-score', { jobPostId: job._id });
        setMatchScore(scoreRes.data.score);
      } catch (e) {
        console.log('Could not fetch match score');
      }

      try {
        const savedRes = await api.get('/saved-jobs');
        const saved = savedRes.data.savedJobs?.some(
          (s: any) => (s.jobPostId._id || s.jobPostId) === job._id
        );
        setIsSaved(saved);
      } catch (e) {
        console.log('Could not check saved status');
      }

      try {
        const appRes = await api.get('/applications/my-applications');
        const applied = appRes.data.applications?.some(
          (a: any) => (a.jobPostId._id || a.jobPostId) === job._id
        );
        setHasApplied(applied);
      } catch (e) {
        console.log('Could not check application status');
      }
    }
    fetchExtras();
  }, [currentUserId, job]);

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

  async function handleFileUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Upload failed');
        return null;
      }

      setResumeUrl(data.url);
      toast.success('Resume uploaded!');
      return data.url;
    } catch (error) {
      toast.error('Failed to upload file');
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function handleAICoverLetter() {
    if (!job) return;

    setAiLoading(true);
    try {
      const res = await api.post('/ai/cover-letter', { jobId: job._id });
      setCoverLetter(res.data.coverLetter);
      toast.success('Cover letter generated!');
    } catch (error) {
      toast.error('Failed to generate cover letter');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleApply() {
    if (!coverLetter) {
      toast.error('Please write a cover letter');
      return;
    }

    // Upload file if selected but not uploaded yet
    let finalResumeUrl = resumeUrl;
    if (resumeFile && !resumeUrl) {
      const uploaded = await handleFileUpload(resumeFile);
      if (!uploaded) return;
      finalResumeUrl = uploaded;
    }

    setApplying(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobPostId: id,
          coverLetter,
          resume: finalResumeUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || 'Failed to apply');
      else {
        toast.success('Applied successfully!');
        setShowApplyModal(false);
        setCoverLetter('');
        setResumeUrl('');
        setResumeFile(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    } finally {
      setApplying(false);
    }
  }

  async function handleSaveJob() {
    if (!currentUserId) {
      toast.error('Please sign in to save jobs');
      return;
    }

    try {
      if (isSaved) {
        const savedRes = await api.get('/saved-jobs');
        const savedJob = savedRes.data.savedJobs?.find(
          (s: any) => (s.jobPostId._id || s.jobPostId) === job?._id
        );
        if (savedJob) {
          await api.delete(`/saved-jobs?id=${savedJob._id}`);
          setIsSaved(false);
          toast.success('Removed from saved');
        }
      } else {
        await api.post('/saved-jobs', { jobPostId: job?._id });
        setIsSaved(true);
        toast.success('Job saved!');
      }
    } catch (error) {
      toast.error('Failed to update saved jobs');
    }
  }

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-blue-500 to-cyan-500';
    if (score >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Job not found</p>
      </div>
    );
  }

  const isCreator = currentUserId === job.creatorId._id;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-500 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 sm:p-8"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    {getTypeLabel(job.type)}
                  </span>
                  <span className={`badge ${job.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                    {job.status}
                  </span>
                  {/* Match Score - Mobile */}
                  {matchScore !== null && !isCreator && (
                    <div className={`sm:hidden px-2 py-1 rounded-lg bg-gradient-to-br ${getMatchColor(matchScore)} text-white text-center text-xs`}>
                      {matchScore}% Match
                    </div>
                  )}
                </div>
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 sm:w-4 h-3 sm:h-4" />
                    {job.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 sm:w-4 h-3 sm:h-4" />
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                  {job.duration && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 sm:w-4 h-3 sm:h-4" />
                      {job.duration}
                    </span>
                  )}
                  {job.compensation && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 sm:w-4 h-3 sm:h-4" />
                      {job.compensation}
                    </span>
                  )}
                </div>
              </div>

              {/* Match Score - Desktop */}
              {matchScore !== null && !isCreator && (
                <div className={`hidden sm:block px-4 py-3 rounded-xl bg-gradient-to-br ${getMatchColor(matchScore)} text-white text-center flex-shrink-0`}>
                  <div className="text-2xl font-bold">{matchScore}%</div>
                  <div className="text-xs opacity-90">Match</div>
                </div>
              )}
            </div>

            {/* Tags */}
            {job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {job.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Description
              </h3>
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
                <ReactMarkdown>{job.description}</ReactMarkdown>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Requirements
                </h3>
                <ul className="space-y-2">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Creator Info */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800/50 mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Posted by</h3>
              <div className="flex items-center gap-4">
                {job.creatorId.image ? (
                  <Image
                    src={job.creatorId.image}
                    alt={job.creatorId.name}
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white font-semibold">
                    {job.creatorId.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {job.creatorId.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {job.creatorId.university}
                    {job.creatorId.major && ` • ${job.creatorId.major}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              {isCreator ? (
                <>
                  <button
                    onClick={() => router.push(`/jobs/edit/${job._id}`)}
                    className="btn-primary"
                  >
                    Edit Job
                  </button>
                  <Link
                    href={`/dashboard/finder/applicants/${job._id}`}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    View Applicants
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={deleting}
                    className="px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <>
                  {hasApplied ? (
                    <button
                      disabled
                      className="btn-primary opacity-70 cursor-not-allowed inline-flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Applied
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Apply Now
                    </button>
                  )}
                  <button
                    onClick={() => {
                      openChatWith(job.creatorId._id);
                      setShowChatWindow(true);
                    }}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </button>
                  <button
                    onClick={handleSaveJob}
                    className={`btn-secondary inline-flex items-center gap-2 ${isSaved ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : ''
                      }`}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Chat Window */}
      {showChatWindow && (
        <div className="fixed bottom-0 sm:bottom-4 right-0 sm:right-4 w-full sm:w-[400px] z-50">
          <div className="glass-card overflow-hidden shadow-2xl sm:rounded-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-neutral-800 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
              <span className="font-semibold text-sm sm:text-base truncate">Chat with {job.creatorId.name}</span>
              <button onClick={() => setShowChatWindow(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ChatWindow otherUserId={job.creatorId._id} />
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass-card p-6 max-w-sm w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delete Job?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This action cannot be undone. All applications will also be deleted.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50"
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass-card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Apply for {job.title}
                </h3>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Resume Upload */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Resume (PDF)
                  </label>
                </div>
                <div className="border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-xl p-6 text-center">
                  {resumeUrl ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Resume uploaded
                        </p>
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-500 hover:underline"
                        >
                          View PDF
                        </a>
                      </div>
                      <button
                        onClick={() => {
                          setResumeUrl('');
                          setResumeFile(null);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : resumeFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-indigo-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {resumeFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => setResumeFile(null)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) setResumeFile(file);
                        }}
                      />
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload PDF resume
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Max 5MB</p>
                    </label>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cover Letter *
                  </label>
                  <button
                    type="button"
                    onClick={handleAICoverLetter}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Generate with AI
                  </button>
                </div>
                <textarea
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  placeholder="Write why you're a great fit for this opportunity..."
                  rows={6}
                  className="input-modern resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying || uploading}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  {(applying || uploading) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  {uploading ? 'Uploading...' : applying ? 'Applying...' : 'Submit Application'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
