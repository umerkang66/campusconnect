'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    User,
    Mail,
    MessageSquare,
    CheckCircle,
    XCircle,
    Clock,
    Star,
    FileText,
    ExternalLink,
} from 'lucide-react';
import { useStore } from '@/store/use-store';

interface Applicant {
    _id: string;
    status: string;
    coverLetter?: string;
    resume?: string;
    createdAt: string;
    applicantId: {
        _id: string;
        name: string;
        email: string;
        image?: string;
        skills: string[];
        bio?: string;
        university?: string;
        major?: string;
    };
    matchScore?: number;
}

interface Job {
    _id: string;
    title: string;
    type: string;
}

export default function ApplicantsPage() {
    const { data: session } = useSession();
    const params = useParams();
    const jobId = params.jobId as string;
    const { openChatWith } = useStore();

    const [job, setJob] = useState<Job | null>(null);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch job details
                const jobRes = await api.get(`/jobs/${jobId}`);
                setJob(jobRes.data.job);

                // Fetch applications
                const appRes = await api.get(`/jobs/${jobId}/applications`);
                const apps = appRes.data.applications || [];

                // Calculate match scores for each applicant
                const appsWithScores = await Promise.all(
                    apps.map(async (app: Applicant) => {
                        try {
                            const scoreRes = await api.post('/match-score', {
                                jobPostId: jobId,
                                userId: app.applicantId._id,
                            });
                            return { ...app, matchScore: scoreRes.data.score };
                        } catch {
                            return { ...app, matchScore: null };
                        }
                    })
                );

                setApplicants(appsWithScores);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load applicants');
            } finally {
                setLoading(false);
            }
        }

        if (session?.user && jobId) {
            fetchData();
        }
    }, [session, jobId]);

    const handleStatusChange = async (applicationId: string, status: string) => {
        setActionLoading(applicationId);
        try {
            await api.patch(`/applications/${applicationId}`, { status });
            setApplicants(
                applicants.map(a =>
                    a._id === applicationId ? { ...a, status } : a
                )
            );
            toast.success(`Application ${status.toLowerCase()}`);
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleMessage = (userId: string) => {
        openChatWith(userId);
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

    const getMatchColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-blue-500';
        if (score >= 40) return 'text-yellow-500';
        return 'text-gray-500';
    };

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Please sign in to view applicants.</p>
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
                        href="/dashboard/finder/my-jobs"
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-500 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to My Jobs
                    </Link>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Applicants
                    </h1>
                    {job && (
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            For: <span className="font-medium">{job.title}</span>
                        </p>
                    )}
                </motion.div>

                {/* Applicants List */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : applicants.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card p-12 text-center"
                    >
                        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No applicants yet
                        </h2>
                        <p className="text-gray-500">
                            Share your job posting to attract talented candidates!
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {applicants.map((applicant, index) => (
                            <motion.div
                                key={applicant._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card p-4 sm:p-6 card-hover"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg sm:text-xl font-semibold flex-shrink-0 mx-auto sm:mx-0">
                                        {applicant.applicantId.image ? (
                                            <img
                                                src={applicant.applicantId.image}
                                                alt={applicant.applicantId.name}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            applicant.applicantId.name?.charAt(0).toUpperCase()
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                            <div className="text-center sm:text-left">
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                                    {applicant.applicantId.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    <span className="truncate">{applicant.applicantId.email}</span>
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-center sm:justify-end gap-3">
                                                {applicant.matchScore !== null && (
                                                    <div className="text-center">
                                                        <div
                                                            className={`text-xl sm:text-2xl font-bold ${getMatchColor(
                                                                applicant.matchScore || 0
                                                            )}`}
                                                        >
                                                            {applicant.matchScore}%
                                                        </div>
                                                        <div className="text-xs text-gray-500">Match</div>
                                                    </div>
                                                )}
                                                <span className={`badge ${getStatusBadge(applicant.status)}`}>
                                                    {applicant.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Skills */}
                                        {applicant.applicantId.skills?.length > 0 && (
                                            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                                                {applicant.applicantId.skills.slice(0, 4).map((skill, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-2 py-1 text-xs rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {applicant.applicantId.skills.length > 4 && (
                                                    <span className="px-2 py-1 text-xs text-gray-500">
                                                        +{applicant.applicantId.skills.length - 4} more
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* University/Major */}
                                        {(applicant.applicantId.university || applicant.applicantId.major) && (
                                            <p className="text-sm text-gray-500 mt-2 text-center sm:text-left">
                                                {applicant.applicantId.university}
                                                {applicant.applicantId.major && ` • ${applicant.applicantId.major}`}
                                            </p>
                                        )}

                                        {/* Cover Letter */}
                                        {applicant.coverLetter && (
                                            <div className="mt-3 p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-lg">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 sm:line-clamp-3">
                                                    {applicant.coverLetter}
                                                </p>
                                            </div>
                                        )}

                                        {/* Resume PDF Link */}
                                        {applicant.resume && (
                                            <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                                                <FileText className="w-4 h-4 text-indigo-500" />
                                                <a
                                                    href={applicant.resume}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-indigo-500 hover:underline inline-flex items-center gap-1"
                                                >
                                                    View Resume
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
                                            <button
                                                onClick={() => handleMessage(applicant.applicantId._id)}
                                                className="btn-secondary inline-flex items-center gap-2 text-sm py-2"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                <span className="hidden xs:inline">Message</span>
                                            </button>

                                            {applicant.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            handleStatusChange(applicant._id, 'SHORTLISTED')
                                                        }
                                                        disabled={actionLoading === applicant._id}
                                                        className="px-3 sm:px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors inline-flex items-center gap-1 sm:gap-2"
                                                    >
                                                        <Star className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Shortlist</span>
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleStatusChange(applicant._id, 'REJECTED')
                                                        }
                                                        disabled={actionLoading === applicant._id}
                                                        className="px-3 sm:px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors inline-flex items-center gap-1 sm:gap-2"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Reject</span>
                                                    </button>
                                                </>
                                            )}

                                            {applicant.status === 'SHORTLISTED' && (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            handleStatusChange(applicant._id, 'ACCEPTED')
                                                        }
                                                        disabled={actionLoading === applicant._id}
                                                        className="px-3 sm:px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors inline-flex items-center gap-1 sm:gap-2"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Accept</span>
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleStatusChange(applicant._id, 'REJECTED')
                                                        }
                                                        disabled={actionLoading === applicant._id}
                                                        className="px-3 sm:px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors inline-flex items-center gap-1 sm:gap-2"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Reject</span>
                                                    </button>
                                                </>
                                            )}

                                            <span className="text-xs text-gray-400 w-full sm:w-auto sm:ml-auto flex items-center justify-center sm:justify-end gap-1 mt-2 sm:mt-0">
                                                <Clock className="w-3 h-3" />
                                                {new Date(applicant.createdAt).toLocaleDateString()}
                                            </span>
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
