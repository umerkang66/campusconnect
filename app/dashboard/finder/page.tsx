'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useStore } from '@/store/use-store';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import {
    Briefcase,
    Users,
    Eye,
    TrendingUp,
    Plus,
    FileText,
    BarChart3,
    ArrowRight,
    Sparkles,
    Target,
    Clock,
} from 'lucide-react';

interface DashboardStats {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    totalViews: number;
}

interface RecentJob {
    _id: string;
    title: string;
    status: string;
    views: number;
    applicationsCount: number;
    createdAt: string;
}

export default function FinderDashboard() {
    const { data: session } = useSession();
    const { role } = useStore();
    const [stats, setStats] = useState<DashboardStats>({
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        totalViews: 0,
    });
    const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const jobsRes = await api.get('/jobs/my-jobs');
                const jobs = jobsRes.data.jobs || [];

                // Calculate stats
                const totalJobs = jobs.length;
                const activeJobs = jobs.filter((j: any) => j.status === 'ACTIVE').length;
                const totalViews = jobs.reduce((sum: number, j: any) => sum + (j.views || 0), 0);

                // Get applications count for each job
                let totalApplications = 0;
                const jobsWithApps = await Promise.all(
                    jobs.slice(0, 5).map(async (job: any) => {
                        try {
                            const appRes = await api.get(`/applications?jobPostId=${job._id}`);
                            const count = appRes.data.applications?.length || 0;
                            totalApplications += count;
                            return { ...job, applicationsCount: count };
                        } catch {
                            return { ...job, applicationsCount: 0 };
                        }
                    })
                );

                setStats({ totalJobs, activeJobs, totalApplications, totalViews });
                setRecentJobs(jobsWithApps);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }

        if (session?.user) {
            fetchData();
        }
    }, [session]);

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Please sign in to access your dashboard.</p>
            </div>
        );
    }

    const statCards = [
        {
            label: 'Total Jobs',
            value: stats.totalJobs,
            icon: Briefcase,
            color: 'from-indigo-500 to-purple-500',
        },
        {
            label: 'Active Jobs',
            value: stats.activeJobs,
            icon: TrendingUp,
            color: 'from-green-500 to-emerald-500',
        },
        {
            label: 'Applications',
            value: stats.totalApplications,
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            label: 'Total Views',
            value: stats.totalViews,
            icon: Eye,
            color: 'from-orange-500 to-yellow-500',
        },
    ];

    const quickActions = [
        {
            title: 'Create Job',
            description: 'Post a new opportunity',
            href: '/create-job',
            icon: Plus,
            color: 'from-indigo-500 to-purple-500',
        },
        {
            title: 'My Jobs',
            description: 'Manage your listings',
            href: '/dashboard/finder/my-jobs',
            icon: FileText,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            title: 'Analytics',
            description: 'View performance',
            href: '/dashboard/finder/analytics',
            icon: BarChart3,
            color: 'from-green-500 to-emerald-500',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 py-12 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Target className="w-8 h-8 text-indigo-500" />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Talent Finder Dashboard
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Welcome back, {session.user?.name}! Here's an overview of your job postings.
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {statCards.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card p-6 card-hover"
                        >
                            <div
                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}
                            >
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                {loading ? '...' : stat.value}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Quick Actions */}
                    {quickActions.map((action, index) => (
                        <motion.div
                            key={action.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                        >
                            <Link href={action.href}>
                                <div className="glass-card p-6 card-hover group cursor-pointer h-full">
                                    <div
                                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                                    >
                                        <action.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                        {action.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {action.description}
                                    </p>
                                    <div className="mt-4 flex items-center text-indigo-500 text-sm font-medium">
                                        Go <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Recent Jobs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="glass-card p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Recent Job Posts
                        </h2>
                        <Link
                            href="/dashboard/finder/my-jobs"
                            className="text-indigo-500 text-sm font-medium hover:underline"
                        >
                            View All
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : recentJobs.length === 0 ? (
                        <div className="text-center py-8">
                            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 mb-4">No jobs posted yet</p>
                            <Link href="/create-job" className="btn-primary inline-flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Create Your First Job
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentJobs.map((job) => (
                                <div
                                    key={job._id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-neutral-800/50 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors gap-3"
                                >
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/jobs/${job._id}`}
                                            className="font-medium text-gray-900 dark:text-white hover:text-indigo-500 transition-colors block truncate"
                                        >
                                            {job.title}
                                        </Link>
                                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(job.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3 h-3" />
                                                {job.views} views
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {job.applicationsCount} apps
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                                        <span
                                            className={`badge ${job.status === 'ACTIVE'
                                                ? 'badge-success'
                                                : job.status === 'DRAFT'
                                                    ? 'badge-warning'
                                                    : 'badge-info'
                                                }`}
                                        >
                                            {job.status}
                                        </span>
                                        <Link
                                            href={`/dashboard/finder/applicants/${job._id}`}
                                            className="text-sm text-indigo-500 hover:underline whitespace-nowrap"
                                        >
                                            View Applicants
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
