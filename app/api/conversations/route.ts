import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Message from '@/models/message';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const userId = new mongoose.Types.ObjectId(session.user.id);

        // Aggregate to find all unique conversations with last message
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [{ senderId: userId }, { receiverId: userId }],
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $addFields: {
                    otherUserId: {
                        $cond: {
                            if: { $eq: ['$senderId', userId] },
                            then: '$receiverId',
                            else: '$senderId',
                        },
                    },
                },
            },
            {
                $group: {
                    _id: '$otherUserId',
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$receiverId', userId] },
                                        { $eq: ['$read', false] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'otherUser',
                },
            },
            {
                $unwind: '$otherUser',
            },
            {
                $project: {
                    _id: 1,
                    otherUser: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        image: 1,
                    },
                    lastMessage: {
                        _id: 1,
                        content: 1,
                        createdAt: 1,
                        senderId: 1,
                        receiverId: 1,
                        read: 1,
                    },
                    unreadCount: 1,
                },
            },
            {
                $sort: { 'lastMessage.createdAt': -1 },
            },
        ]);

        return NextResponse.json({ conversations });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversations' },
            { status: 500 }
        );
    }
}
