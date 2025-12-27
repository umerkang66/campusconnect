import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import JobPost from '@/models/post';
import { generateJobRecommendations } from '@/lib/gemini';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get active jobs
        const jobs = await JobPost.find({ status: 'ACTIVE' })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        // Generate AI recommendations
        const recommendations = await generateJobRecommendations(
            {
                skills: user.skills || [],
                interests: user.interests || [],
                bio: user.bio,
                major: user.major,
            },
            jobs.map((job: any) => ({
                _id: job._id.toString(),
                title: job.title,
                description: job.description,
                type: job.type,
                tags: job.tags || [],
                requirements: job.requirements || [],
            }))
        );

        // Map recommendations to full job data
        const recommendedJobs = recommendations
            .map((rec: any) => {
                const job = jobs.find((j: any) => j._id.toString() === rec.jobId);
                if (job) {
                    return {
                        ...job,
                        _id: job._id.toString(),
                        aiScore: rec.score,
                        aiReason: rec.reason,
                    };
                }
                return null;
            })
            .filter(Boolean);

        return NextResponse.json({ jobs: recommendedJobs });
    } catch (error) {
        console.error('Recommendations error:', error);
        return NextResponse.json(
            { error: 'Failed to get recommendations' },
            { status: 500 }
        );
    }
}
