'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import {
  ArrowLeft,
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { useStore } from '@/store/use-store';

interface Application {
  _id: string;
  status: string;
  coverLetter?: string;
  createdAt: string;
  updatedAt: string;
  jobPostId: {
    _id: string;
    title: string;
    type: string;
    status: string;
    creatorId: string;
  };
}

export default function AppliedJobsPage() {
  const { data: session } = useSession();
  const { openChatWith } = useStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const res = await api.get('/applications/my-applications');
        setApplications(res.data.applications || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchApplications();
    }
  }, [session]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'SHORTLISTED':
        return <Star className="w-5 h-5 text-blue-500" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'badge-success';
      case 'SHORTLISTED':
        return 'badge-info';
      case 'REJECTED':
        return 'badge-error';
      default:
        return 'badge-warning';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  // Group applications by status for timeline view
  const statusGroups = {
    PENDING: applications.filter(a => a.status === 'PENDING'),
    SHORTLISTED: applications.filter(a => a.status === 'SHORTLISTED'),
    ACCEPTED: applications.filter(a => a.status === 'ACCEPTED'),
    REJECTED: applications.filter(a => a.status === 'REJECTED'),
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Please sign in to view your applications.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-500 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-green-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Applications
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track the status of your job applications
              </p>
            </div>
          </div>
        </motion.div>

        {/* Status Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Pending', count: statusGroups.PENDING.length, color: 'from-yellow-500 to-orange-500', icon: Clock },
            { label: 'Shortlisted', count: statusGroups.SHORTLISTED.length, color: 'from-blue-500 to-cyan-500', icon: Star },
            { label: 'Accepted', count: statusGroups.ACCEPTED.length, color: 'from-green-500 to-emerald-500', icon: CheckCircle },
            { label: 'Rejected', count: statusGroups.REJECTED.length, color: 'from-red-500 to-pink-500', icon: XCircle },
          ].map((item, index) => (
            <div key={item.label} className="glass-card p-4 text-center">
              <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-2`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {item.count}
              </div>
              <div className="text-sm text-gray-500">{item.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Applications List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-12 text-center"
          >
            <FileCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No applications yet
            </h2>
            <p className="text-gray-500 mb-6">
              Start applying to jobs to see your applications here!
            </p>
            <Link href="/jobs" className="btn-primary inline-flex items-center gap-2">
              Browse Jobs
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {applications.map((app, index) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-4 sm:p-6 card-hover"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 hidden sm:block mt-1">
                    {getStatusIcon(app.status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 sm:hidden mb-2">
                          {getStatusIcon(app.status)}
                          <span className={`badge ${getStatusBadge(app.status)}`}>
                            {app.status}
                          </span>
                        </div>
                        <Link
                          href={`/jobs/${app.jobPostId._id}`}
                          className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-500 transition-colors block truncate"
                        >
                          {app.jobPostId.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 rounded text-xs">
                            {getTypeLabel(app.jobPostId.type)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <span className={`badge ${getStatusBadge(app.status)} hidden sm:inline-block flex-shrink-0`}>
                        {app.status}
                      </span>
                    </div>

                    {/* Timeline */}
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${app.status === 'PENDING'
                            ? 'bg-yellow-500 w-1/4'
                            : app.status === 'SHORTLISTED'
                              ? 'bg-blue-500 w-2/4'
                              : app.status === 'ACCEPTED'
                                ? 'bg-green-500 w-full'
                                : 'bg-red-500 w-full'
                            }`}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
                      <Link
                        href={`/jobs/${app.jobPostId._id}`}
                        className="text-sm text-indigo-500 hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </Link>
                      <button
                        onClick={() => openChatWith(app.jobPostId.creatorId)}
                        className="text-sm text-indigo-500 hover:underline inline-flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Message
                      </button>
                      {app.status === 'PENDING' && (
                        <span className="text-xs sm:text-sm text-gray-400 w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0">
                          Waiting for review...
                        </span>
                      )}
                      {app.status === 'SHORTLISTED' && (
                        <span className="text-xs sm:text-sm text-blue-500 w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0">
                          🎉 Shortlisted!
                        </span>
                      )}
                      {app.status === 'ACCEPTED' && (
                        <span className="text-xs sm:text-sm text-green-500 w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0">
                          🎉 Accepted!
                        </span>
                      )}
                    </div>
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
