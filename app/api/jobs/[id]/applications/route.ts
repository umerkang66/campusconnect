import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Application from '@/models/application';
import JobPost from '@/models/post';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Verify job ownership
    const job = await JobPost.findById(params.id);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.creatorId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - You don't own this job" },
        { status: 403 }
      );
    }

    // Get applications
    const applications = await Application.find({
      jobPostId: params.id,
    })
      .populate(
        'applicantId',
        'name email image skills interests bio university major'
      )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Get job applications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
