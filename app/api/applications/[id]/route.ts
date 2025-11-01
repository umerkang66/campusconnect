import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Application from '@/models/application';
import JobPost from '@/models/post';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { status } = await req.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const application = await Application.findById(params.id);

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Verify ownership — only the job creator can update status
    const job = await JobPost.findById(application.jobPostId);

    if (!job) {
      return NextResponse.json(
        { error: 'Associated job not found' },
        { status: 404 }
      );
    }

    if (job.creatorId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You are not the owner of this job' },
        { status: 403 }
      );
    }

    // Update status
    application.status = status;
    await application.save();

    const updatedApplication = await Application.findById(params.id)
      .populate('applicantId', 'name email image')
      .populate('jobPostId', 'title');

    return NextResponse.json(
      {
        application: updatedApplication,
        message: 'Application status updated',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update application status error:', error);
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    );
  }
}
