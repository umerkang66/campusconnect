import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import JobPost from '@/models/post';
import { generateCoverLetterSuggestion } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { jobId } = await req.json();

        if (!jobId) {
            return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findById(session.user.id);
        const job = await JobPost.findById(jobId);

        if (!user || !job) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const coverLetter = await generateCoverLetterSuggestion(
            {
                name: user.name,
                skills: user.skills || [],
                bio: user.bio,
            },
            {
                title: job.title,
                description: job.description,
                requirements: job.requirements || [],
            }
        );

        if (!coverLetter) {
            return NextResponse.json(
                { error: 'Could not generate cover letter. Please check your API key.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ coverLetter });
    } catch (error) {
        console.error('Cover letter error:', error);
        return NextResponse.json(
            { error: 'Failed to generate cover letter' },
            { status: 500 }
        );
    }
}
