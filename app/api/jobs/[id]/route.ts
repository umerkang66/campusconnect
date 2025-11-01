import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import JobPost from '@/models/post';

// GET - Fetch single job
export async function GET(req: NextRequest, context: { params: any }) {
  try {
    await connectDB();

    // In App Router, params is a Promise-like object, unwrap it
    const { id } = await context.params;

    console.log('🌟 Job ID:', id);

    const job = await JobPost.findById(id).populate(
      'creatorId',
      'name email image bio university major'
    );

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Increment views
    job.views += 1;
    await job.save();

    return NextResponse.json({ job });
  } catch (error) {
    console.error('Get job error:', error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

// PATCH - Update job
export async function PATCH(req: NextRequest, context: { params: any }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const job = await JobPost.findById(id);
    if (!job)
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    if (job.creatorId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - You don't own this job" },
        { status: 403 }
      );
    }

    const updates = await req.json();
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'creatorId' && key !== 'views') {
        (job as any)[key] = updates[key];
      }
    });

    await job.save();

    const updatedJob = await JobPost.findById(id).populate(
      'creatorId',
      'name email image'
    );
    return NextResponse.json({ job: updatedJob });
  } catch (error) {
    console.error('Update job error:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

// DELETE - Delete job
export async function DELETE(req: NextRequest, context: { params: any }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const job = await JobPost.findById(id);
    if (!job)
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    if (job.creatorId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await JobPost.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}
