import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const user = await User.findById(session.user.id).lean();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                ...user,
                _id: user._id.toString(),
            },
        });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const body = await req.json();
        const allowedFields = [
            'name',
            'bio',
            'skills',
            'interests',
            'university',
            'major',
            'graduationYear',
            'linkedin',
            'github',
            'portfolio',
            'resume',
            'notificationsEnabled',
        ];

        const updates: any = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        // Fetch the current user to merge with updates for profile score calculation
        const existingUser = await User.findById(session.user.id).lean();
        if (!existingUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Merge existing data with updates for score calculation
        const userData = { ...existingUser, ...updates };

        // Calculate profile score manually (since findByIdAndUpdate doesn't trigger pre-save hooks)
        let score = 0;
        if (userData.name) score += 10;
        if (userData.email) score += 10;
        if (userData.bio && userData.bio.length > 20) score += 15;
        if (userData.skills && userData.skills.length > 0) score += 15;
        if (userData.interests && userData.interests.length > 0) score += 10;
        if (userData.resume) score += 15;
        if (userData.university) score += 5;
        if (userData.major) score += 5;
        if (userData.linkedin) score += 5;
        if (userData.github) score += 5;
        if (userData.portfolio) score += 5;
        updates.profileScore = Math.min(score, 100);

        const user = await User.findByIdAndUpdate(
            session.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).lean();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                ...user,
                _id: user._id.toString(),
            },
        });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

