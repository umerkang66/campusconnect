'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Eye,
  Clock,
  MapPin,
  DollarSign,
} from 'lucide-react';

const JOB_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'ACADEMIC_PROJECT', label: 'Academic Project' },
  { value: 'STARTUP_COLLABORATION', label: 'Startup / Collaboration' },
  { value: 'PART_TIME_JOB', label: 'Part-Time Job' },
  { value: 'COMPETITION_TEAM', label: 'Competition Team' },
  { value: 'HACKATHON', label: 'Hackathon' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

interface Job {
  _id: string;
  title: string;
  description: string;
  type: string;
  tags: string[];
  views: number;
  status: string;
  compensation?: string;
  duration?: string;
  createdAt: string;
  matchScore?: number;
  isSaved?: boolean;
}

export default function JobsPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [savingJobId, setSavingJobId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        const res = await api.get('/jobs');
        const jobsList = res.data.jobs || [];

        // If logged in, fetch match scores and saved jobs
        if (session?.user) {
          // Fetch saved jobs
          try {
            const savedRes = await api.get('/saved-jobs');
            const savedIds = new Set<string>(
              (savedRes.data.savedJobs || []).map((s: any) => s.jobPostId._id || s.jobPostId)
            );
            setSavedJobIds(savedIds);
          } catch (e) {
            console.log('Could not fetch saved jobs');
          }

          // Fetch match scores for each job
          const jobsWithScores = await Promise.all(
            jobsList.map(async (job: Job) => {
              try {
                const scoreRes = await api.post('/match-score', { jobPostId: job._id });
                return { ...job, matchScore: scoreRes.data.score };
              } catch {
                return { ...job, matchScore: null };
              }
            })
          );
          setJobs(jobsWithScores);
        } else {
          setJobs(jobsList);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [session]);

  const handleSaveJob = async (jobId: string) => {
    if (!session) {
      toast.error('Please sign in to save jobs');
      return;
    }

    setSavingJobId(jobId);
    try {
      if (savedJobIds.has(jobId)) {
        // Unsave
        const savedRes = await api.get('/saved-jobs');
        const savedJob = savedRes.data.savedJobs?.find(
          (s: any) => (s.jobPostId._id || s.jobPostId) === jobId
        );
        if (savedJob) {
          await api.delete(`/saved-jobs?id=${savedJob._id}`);
          setSavedJobIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(jobId);
            return newSet;
          });
          toast.success('Removed from saved');
        }
      } else {
        // Save
        await api.post('/saved-jobs', { jobPostId: jobId });
        setSavedJobIds(prev => new Set(prev).add(jobId));
        toast.success('Job saved!');
      }
    } catch (error) {
      toast.error('Failed to update saved jobs');
    } finally {
      setSavingJobId(null);
    }
  };

  const filtered = jobs.filter(j => {
    const matchesQuery = j.title.toLowerCase().includes(query.toLowerCase()) ||
      j.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
    const matchesType = !typeFilter || j.type === typeFilter;
    return matchesQuery && matchesType;
  });

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-blue-500 to-cyan-500';
    if (score >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Discover Opportunities
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find your perfect match from {jobs.length} available opportunities
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 mb-8"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  placeholder="Search by title or tags..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="input-modern pl-12"
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="input-modern pl-12 pr-8 w-full sm:min-w-[200px]"
                  disabled={loading}
                >
                  {JOB_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Link href="/create-job" className="btn-primary inline-flex items-center justify-center gap-2 whitespace-nowrap sm:hidden">
              Post a Job
            </Link>
            <Link href="/create-job" className="btn-primary hidden sm:inline-flex items-center justify-center gap-2 whitespace-nowrap self-end">
              Post a Job
            </Link>
          </div>
        </motion.div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-12 text-center"
          >
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No jobs found
            </h2>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            {filtered.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-4 sm:p-6 card-hover group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/jobs/${job._id}`}
                      className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white hover:text-indigo-500 transition-colors block truncate"
                    >
                      {job.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded-lg text-xs">
                        {getTypeLabel(job.type)}
                      </span>
                      {job.compensation && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {job.compensation}
                        </span>
                      )}
                      {job.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {job.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  {job.matchScore !== undefined && job.matchScore !== null && (
                    <div className={`px-3 py-2 rounded-xl bg-gradient-to-br ${getMatchColor(job.matchScore)} text-white text-center flex-shrink-0`}>
                      <div className="text-lg font-bold">{job.matchScore}%</div>
                      <div className="text-xs opacity-90">Match</div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                  {job.description}
                </p>

                {/* Tags */}
                {job.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.tags.slice(0, 4).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      >
                        {tag}
                      </span>
                    ))}
                    {job.tags.length > 4 && (
                      <span className="px-2 py-1 text-xs text-gray-500">
                        +{job.tags.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {job.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    {session && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleSaveJob(job._id);
                        }}
                        disabled={savingJobId === job._id}
                        className={`p-2 rounded-lg transition-colors ${savedJobIds.has(job._id)
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500'
                          : 'hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400'
                          }`}
                        title={savedJobIds.has(job._id) ? 'Unsave' : 'Save'}
                      >
                        {savedJobIds.has(job._id) ? (
                          <BookmarkCheck className="w-5 h-5" />
                        ) : (
                          <Bookmark className="w-5 h-5" />
                        )}
                      </button>
                    )}
                    <Link
                      href={`/jobs/${job._id}`}
                      className="btn-primary text-sm py-2 px-4"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
