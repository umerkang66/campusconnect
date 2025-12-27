'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import {
    ArrowLeft,
    TrendingUp,
    Eye,
    Users,
    Briefcase,
    Activity,
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

interface JobStats {
    _id: string;
    title: string;
    views: number;
    applications: number;
    status: string;
    type: string;
    createdAt: string;
}

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
    const { data: session } = useSession();
    const [jobs, setJobs] = useState<JobStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const jobsRes = await api.get('/jobs/my-jobs');
                const jobsList = jobsRes.data.jobs || [];

                // Fetch application counts for each job
                const jobsWithStats = await Promise.all(
                    jobsList.map(async (job: any) => {
                        try {
                            const appRes = await api.get(`/applications?jobPostId=${job._id}`);
                            return {
                                ...job,
                                applications: appRes.data.applications?.length || 0,
                            };
                        } catch {
                            return { ...job, applications: 0 };
                        }
                    })
                );

                setJobs(jobsWithStats);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        }

        if (session?.user) {
            fetchData();
        }
    }, [session]);

    // Calculate totals
    const totalViews = jobs.reduce((sum, j) => sum + (j.views || 0), 0);
    const totalApplications = jobs.reduce((sum, j) => sum + j.applications, 0);
    const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length;
    const avgInterestRate =
        totalViews > 0 ? ((totalApplications / totalViews) * 100).toFixed(1) : '0';

    // Prepare chart data
    const viewsData = jobs
        .slice(0, 7)
        .reverse()
        .map(j => ({
            name: j.title.substring(0, 15) + (j.title.length > 15 ? '...' : ''),
            views: j.views || 0,
            applications: j.applications,
        }));

    const statusData = [
        { name: 'Active', value: jobs.filter(j => j.status === 'ACTIVE').length },
        { name: 'Draft', value: jobs.filter(j => j.status === 'DRAFT').length },
        { name: 'Filled', value: jobs.filter(j => j.status === 'FILLED').length },
        { name: 'Closed', value: jobs.filter(j => j.status === 'CLOSED').length },
    ].filter(d => d.value > 0);

    const typeData = jobs.reduce((acc: any[], job) => {
        const existing = acc.find(t => t.name === job.type);
        if (existing) {
            existing.value++;
        } else {
            acc.push({ name: job.type.replace(/_/g, ' '), value: 1 });
        }
        return acc;
    }, []);

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Please sign in to view analytics.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 py-12 px-6">
            <div className="max-w-6xl mx-auto">
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

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Analytics Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Track the performance of your job postings
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Stats Overview */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {[
                                {
                                    label: 'Total Views',
                                    value: totalViews,
                                    icon: Eye,
                                    color: 'from-blue-500 to-cyan-500',
                                },
                                {
                                    label: 'Applications',
                                    value: totalApplications,
                                    icon: Users,
                                    color: 'from-green-500 to-emerald-500',
                                },
                                {
                                    label: 'Active Jobs',
                                    value: activeJobs,
                                    icon: Briefcase,
                                    color: 'from-indigo-500 to-purple-500',
                                },
                                {
                                    label: 'Interest Rate',
                                    value: `${avgInterestRate}%`,
                                    icon: TrendingUp,
                                    color: 'from-orange-500 to-yellow-500',
                                },
                            ].map((stat, index) => (
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
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Charts */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            {/* Views & Applications Chart */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="glass-card p-6"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Views & Applications by Job
                                </h3>
                                {viewsData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={viewsData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(17, 17, 17, 0.9)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: '#fff',
                                                }}
                                            />
                                            <Bar dataKey="views" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="applications" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[250px] flex items-center justify-center text-gray-500">
                                        No data available
                                    </div>
                                )}
                            </motion.div>

                            {/* Status Distribution */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="glass-card p-6"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Job Status Distribution
                                </h3>
                                {statusData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) =>
                                                    `${name} ${(percent * 100).toFixed(0)}%`
                                                }
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(17, 17, 17, 0.9)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: '#fff',
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[250px] flex items-center justify-center text-gray-500">
                                        No data available
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Job Type Distribution */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="glass-card p-6"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Jobs by Category
                            </h3>
                            {typeData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={typeData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                        <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            tick={{ fontSize: 12 }}
                                            stroke="#9ca3af"
                                            width={120}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(17, 17, 17, 0.9)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#fff',
                                            }}
                                        />
                                        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[200px] flex items-center justify-center text-gray-500">
                                    No data available
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
}
