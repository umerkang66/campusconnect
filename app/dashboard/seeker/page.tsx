'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import {
    Briefcase,
    Bookmark,
    FileCheck,
    Sparkles,
    TrendingUp,
    Search,
    ArrowRight,
    Target,
} from 'lucide-react';

interface DashboardStats {
    savedJobs: number;
    appliedJobs: number;
    pendingApplications: number;
    acceptedApplications: number;
}

interface RecommendedJob {
    _id: string;
    title: string;
    type: string;
    aiScore: number;
    aiReason: string;
}

export default function SeekerDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<DashboardStats>({
        savedJobs: 0,
        appliedJobs: 0,
        pendingApplications: 0,
        acceptedApplications: 0,
    });
    const [recommendations, setRecommendations] = useState<RecommendedJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [recsLoading, setRecsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch saved jobs count
                const savedRes = await api.get('/saved-jobs');
                const savedCount = savedRes.data.savedJobs?.length || 0;

                // Fetch applications
                const appsRes = await api.get('/applications/my-applications');
                const apps = appsRes.data.applications || [];
                const pending = apps.filter((a: any) => a.status === 'PENDING').length;
                const accepted = apps.filter((a: any) => a.status === 'ACCEPTED').length;

                setStats({
                    savedJobs: savedCount,
                    appliedJobs: apps.length,
                    pendingApplications: pending,
                    acceptedApplications: accepted,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        }

        async function fetchRecommendations() {
            try {
                const res = await api.get('/ai/recommendations');
                setRecommendations(res.data.jobs || []);
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            } finally {
                setRecsLoading(false);
            }
        }

        if (session?.user) {
            fetchData();
            fetchRecommendations();
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
            label: 'Saved Jobs',
            value: stats.savedJobs,
            icon: Bookmark,
            color: 'from-indigo-500 to-purple-500',
            href: '/dashboard/seeker/saved',
        },
        {
            label: 'Applied',
            value: stats.appliedJobs,
            icon: FileCheck,
            color: 'from-blue-500 to-cyan-500',
            href: '/applied-jobs',
        },
        {
            label: 'Pending',
            value: stats.pendingApplications,
            icon: TrendingUp,
            color: 'from-orange-500 to-yellow-500',
            href: '/applied-jobs',
        },
        {
            label: 'Accepted',
            value: stats.acceptedApplications,
            icon: Target,
            color: 'from-green-500 to-emerald-500',
            href: '/applied-jobs',
        },
    ];

    const quickActions = [
        {
            title: 'Browse Jobs',
            description: 'Find new opportunities',
            href: '/jobs',
            icon: Search,
            color: 'from-indigo-500 to-purple-500',
        },
        {
            title: 'Saved Jobs',
            description: 'View bookmarked jobs',
            href: '/dashboard/seeker/saved',
            icon: Bookmark,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            title: 'My Applications',
            description: 'Track your progress',
            href: '/applied-jobs',
            icon: FileCheck,
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
                        <TrendingUp className="w-8 h-8 text-cyan-500" />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Talent Seeker Dashboard
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Welcome back, {session.user?.name}! Find your next opportunity.
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
                        >
                            <Link href={stat.href}>
                                <div className="glass-card p-6 card-hover cursor-pointer">
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
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
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
                                    <div className="mt-4 flex items-center text-cyan-500 text-sm font-medium">
                                        Go <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* AI Recommendations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="glass-card p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                AI-Powered Recommendations
                            </h2>
                            <p className="text-sm text-gray-500">
                                Personalized job suggestions based on your profile
                            </p>
                        </div>
                    </div>

                    {recsLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : recommendations.length === 0 ? (
                        <div className="text-center py-8">
                            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 mb-4">
                                Complete your profile to get personalized recommendations!
                            </p>
                            <Link href="/me" className="btn-primary inline-flex items-center gap-2">
                                Update Profile
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recommendations.slice(0, 5).map((job) => (
                                <Link key={job._id} href={`/jobs/${job._id}`}>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-neutral-800/50 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                {job.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                                {job.aiReason}
                                            </p>
                                        </div>
                                        <div className="text-center ml-4">
                                            <div className="text-xl font-bold text-purple-500">
                                                {job.aiScore}%
                                            </div>
                                            <div className="text-xs text-gray-500">Match</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
