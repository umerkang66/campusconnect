import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import JobPost from '@/models/post';

// GET - Fetch all jobs with filters
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const userId = searchParams.get('userId'); // For user's own posts

    // Build query
    const query: any = {};

    if (status) {
      query.status = status;
    } else {
      query.status = 'ACTIVE'; // Default to active jobs
    }

    if (type) {
      query.type = type;
    }

    if (userId) {
      query.creatorId = userId;
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Execute query
    const jobs = await JobPost.find(query)
      .populate('creatorId', 'name email image university')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await JobPost.countDocuments(query);

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

// POST - Create new job
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const {
      title,
      description,
      type,
      tags,
      requirements,
      compensation,
      duration,
      status,
    } = body;

    // Validation
    if (!title || !description || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const job = await JobPost.create({
      title,
      description,
      type,
      tags: tags || [],
      requirements: requirements || [],
      compensation,
      duration,
      status: status || 'ACTIVE',
      creatorId: session.user.id,
    });

    const populatedJob = await JobPost.findById(job._id).populate(
      'creatorId',
      'name email image'
    );

    return NextResponse.json({ job: populatedJob }, { status: 201 });
  } catch (error: any) {
    console.error('Create job error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create job' },
      { status: 500 }
    );
  }
}
