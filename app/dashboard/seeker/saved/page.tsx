'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Bookmark,
    ArrowLeft,
    Briefcase,
    Trash2,
    ExternalLink,
    Clock,
} from 'lucide-react';

interface SavedJob {
    _id: string;
    jobPostId: {
        _id: string;
        title: string;
        type: string;
        status: string;
        createdAt: string;
        tags: string[];
    };
    createdAt: string;
}

export default function SavedJobsPage() {
    const { data: session } = useSession();
    const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSavedJobs() {
            try {
                const res = await api.get('/saved-jobs');
                setSavedJobs(res.data.savedJobs || []);
            } catch (error) {
                console.error('Error fetching saved jobs:', error);
                toast.error('Failed to load saved jobs');
            } finally {
                setLoading(false);
            }
        }

        if (session?.user) {
            fetchSavedJobs();
        }
    }, [session]);

    const handleRemove = async (savedJobId: string) => {
        setRemoving(savedJobId);
        try {
            await api.delete(`/saved-jobs?id=${savedJobId}`);
            setSavedJobs(savedJobs.filter(sj => sj._id !== savedJobId));
            toast.success('Removed from saved jobs');
        } catch (error) {
            toast.error('Failed to remove job');
        } finally {
            setRemoving(null);
        }
    };

    const getTypeLabel = (type: string) => {
        return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    };

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Please sign in to view saved jobs.</p>
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
                        href="/dashboard/seeker"
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-500 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>

                    <div className="flex items-center gap-3">
                        <Bookmark className="w-8 h-8 text-indigo-500" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Saved Jobs
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Jobs you've bookmarked for later
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Saved Jobs List */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : savedJobs.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card p-12 text-center"
                    >
                        <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No saved jobs yet
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Browse opportunities and save the ones you're interested in!
                        </p>
                        <Link href="/jobs" className="btn-primary inline-flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Browse Jobs
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {savedJobs.map((saved, index) => (
                            <motion.div
                                key={saved._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card p-6 card-hover"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <Link
                                            href={`/jobs/${saved.jobPostId._id}`}
                                            className="text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-500 transition-colors"
                                        >
                                            {saved.jobPostId.title}
                                        </Link>
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded-lg">
                                                {getTypeLabel(saved.jobPostId.type)}
                                            </span>
                                            <span
                                                className={`badge ${saved.jobPostId.status === 'ACTIVE'
                                                        ? 'badge-success'
                                                        : 'badge-warning'
                                                    }`}
                                            >
                                                {saved.jobPostId.status}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Saved {new Date(saved.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {saved.jobPostId.tags?.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {saved.jobPostId.tags.slice(0, 4).map((tag, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-2 py-1 text-xs rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <Link
                                            href={`/jobs/${saved.jobPostId._id}`}
                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                                            title="View Job"
                                        >
                                            <ExternalLink className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        </Link>
                                        <button
                                            onClick={() => handleRemove(saved._id)}
                                            disabled={removing === saved._id}
                                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                            title="Remove from Saved"
                                        >
                                            <Trash2 className="w-5 h-5 text-red-500" />
                                        </button>
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
