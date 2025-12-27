import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generateProfileFromResume } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { resumeText } = await req.json();

        if (!resumeText || resumeText.length < 50) {
            return NextResponse.json(
                { error: 'Please provide more resume content (at least 50 characters)' },
                { status: 400 }
            );
        }

        const profile = await generateProfileFromResume(resumeText);

        if (!profile) {
            return NextResponse.json(
                { error: 'Could not generate profile. Please check your API key.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ profile });
    } catch (error) {
        console.error('Generate profile error:', error);
        return NextResponse.json(
            { error: 'Failed to generate profile' },
            { status: 500 }
        );
    }
}
