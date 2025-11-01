import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Application from '@/models/application';
import JobPost from '@/models/post';

// GET - User's applications
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const applications = await Application.find({
      applicantId: session.user.id,
    })
      .populate({
        path: 'jobPostId',
        populate: {
          path: 'creatorId',
          select: 'name email image',
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// POST - Apply to job
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { jobPostId, coverLetter, resume } = await req.json();

    if (!jobPostId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Check if job exists
    const job = await JobPost.findById(jobPostId);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'This job is no longer accepting applications' },
        { status: 400 }
      );
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      applicantId: session.user.id,
      jobPostId,
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      );
    }

    // Create application
    const application = await Application.create({
      applicantId: session.user.id,
      jobPostId,
      coverLetter,
      resume,
    });

    const populatedApplication = await Application.findById(
      application._id
    ).populate('jobPostId');

    return NextResponse.json(
      { application: populatedApplication },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create application error:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}
