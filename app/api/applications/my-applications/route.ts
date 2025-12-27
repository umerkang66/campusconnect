import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Application from '@/models/application';
import JobPost from '@/models/post'; // Required for populate
import User from '@/models/user'; // Required for potential internal refs

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const applications = await Application.find({ applicantId: session.user.id })
            .populate('jobPostId', 'title type status tags creatorId')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            applications: applications.map((app: any) => ({
                ...app,
                _id: app._id.toString(),
                applicantId: app.applicantId.toString(),
                jobPostId: app.jobPostId
                    ? {
                        ...app.jobPostId,
                        _id: app.jobPostId._id.toString(),
                        creatorId: app.jobPostId.creatorId?.toString(),
                    }
                    : null,
            })),
        });
    } catch (error) {
        console.error('My applications error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch applications' },
            { status: 500 }
        );
    }
}
