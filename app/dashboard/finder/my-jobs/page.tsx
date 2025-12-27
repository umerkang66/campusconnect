'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Briefcase,
    Plus,
    Eye,
    Users,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    ArrowLeft,
    MoreVertical,
    Send,
} from 'lucide-react';

interface Job {
    _id: string;
    title: string;
    type: string;
    status: string;
    views: number;
    createdAt: string;
    updatedAt: string;
}

export default function MyJobsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        async function fetchJobs() {
            try {
                const res = await api.get('/jobs/my-jobs');
                setJobs(res.data.jobs || []);
            } catch (error) {
                console.error('Error fetching jobs:', error);
                toast.error('Failed to load jobs');
            } finally {
                setLoading(false);
            }
        }

        if (session?.user) {
            fetchJobs();
        }
    }, [session]);

    const handleStatusChange = async (jobId: string, status: string) => {
        setActionLoading(jobId);
        try {
            await api.patch(`/jobs/${jobId}`, { status });
            setJobs(jobs.map(j => (j._id === jobId ? { ...j, status } : j)));
            toast.success(`Job marked as ${status.toLowerCase()}`);
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (jobId: string) => {
        if (!confirm('Are you sure you want to delete this job?')) return;

        setActionLoading(jobId);
        try {
            await api.delete(`/jobs/${jobId}`);
            setJobs(jobs.filter(j => j._id !== jobId));
            toast.success('Job deleted successfully');
        } catch (error) {
            toast.error('Failed to delete job');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'badge-success';
            case 'DRAFT':
                return 'badge-warning';
            case 'FILLED':
                return 'badge-info';
            case 'CLOSED':
                return 'badge-error';
            default:
                return 'badge-info';
        }
    };

    const getTypeLabel = (type: string) => {
        return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    };

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Please sign in to view your jobs.</p>
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
                        href="/dashboard/finder"
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-500 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                My Job Posts
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Manage and track all your job listings
                            </p>
                        </div>
                        <Link href="/create-job" className="btn-primary inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Create Job
                        </Link>
                    </div>
                </motion.div>

                {/* Jobs List */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : jobs.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card p-12 text-center"
                    >
                        <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No jobs yet
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Start posting opportunities to find amazing talent!
                        </p>
                        <Link href="/create-job" className="btn-primary inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Create Your First Job
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job, index) => (
                            <motion.div
                                key={job._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card p-6 card-hover"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <Link
                                            href={`/jobs/${job._id}`}
                                            className="text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-500 transition-colors"
                                        >
                                            {job.title}
                                        </Link>
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded-lg">
                                                {getTypeLabel(job.type)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3 h-3" />
                                                {job.views} views
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(job.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className={`badge ${getStatusBadge(job.status)}`}>
                                            {job.status}
                                        </span>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/dashboard/finder/applicants/${job._id}`}
                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                                                title="View Applicants"
                                            >
                                                <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                            </Link>
                                            <Link
                                                href={`/jobs/edit/${job._id}`}
                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                            </Link>

                                            {job.status === 'DRAFT' && (
                                                <button
                                                    onClick={() => handleStatusChange(job._id, 'ACTIVE')}
                                                    disabled={actionLoading === job._id}
                                                    className="p-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                                    title="Publish Job"
                                                >
                                                    <Send className="w-5 h-5 text-indigo-500" />
                                                </button>
                                            )}

                                            {job.status === 'ACTIVE' && (
                                                <button
                                                    onClick={() => handleStatusChange(job._id, 'FILLED')}
                                                    disabled={actionLoading === job._id}
                                                    className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                                    title="Mark as Filled"
                                                >
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                </button>
                                            )}

                                            {job.status !== 'CLOSED' && (
                                                <button
                                                    onClick={() => handleStatusChange(job._id, 'CLOSED')}
                                                    disabled={actionLoading === job._id}
                                                    className="p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                                                    title="Close Job"
                                                >
                                                    <XCircle className="w-5 h-5 text-orange-500" />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleDelete(job._id)}
                                                disabled={actionLoading === job._id}
                                                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5 text-red-500" />
                                            </button>
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
