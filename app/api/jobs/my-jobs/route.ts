import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import JobPost from '@/models/post';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const jobs = await JobPost.find({ creatorId: session.user.id })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            jobs: jobs.map((job: any) => ({
                ...job,
                _id: job._id.toString(),
                creatorId: job.creatorId.toString(),
            })),
        });
    } catch (error) {
        console.error('My jobs error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch jobs' },
            { status: 500 }
        );
    }
}
