import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { enhanceJobDescription } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, description, type } = await req.json();

        if (!title || !description) {
            return NextResponse.json(
                { error: 'Title and description are required' },
                { status: 400 }
            );
        }

        const enhanced = await enhanceJobDescription(title, description, type || 'General');

        return NextResponse.json({ description: enhanced });
    } catch (error) {
        console.error('Enhance description error:', error);
        return NextResponse.json(
            { error: 'Failed to enhance description' },
            { status: 500 }
        );
    }
}
