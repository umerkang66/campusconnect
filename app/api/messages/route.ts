import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Message from '@/models/message';
import Pusher from 'pusher';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const otherUserId = searchParams.get('userId');

    if (!otherUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const messages = await Message.find({
      $or: [
        { senderId: session.user.id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: session.user.id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name image')
      .populate('receiverId', 'name image');

    await Message.updateMany(
      { senderId: otherUserId, receiverId: session.user.id, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { receiverId, content } = await req.json();

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const message = await Message.create({
      senderId: session.user.id,
      receiverId,
      content,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name image')
      .populate('receiverId', 'name image');

    // Initialize Pusher and trigger event to receiver's channel
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true,
    });

    console.log('[Messages API] Triggering Pusher events for message:', message._id);
    console.log('[Messages API] Receiver channel:', `private-user-${receiverId}`);
    console.log('[Messages API] Sender channel:', `private-user-${session.user.id}`);

    try {
      // Trigger event to receiver's private channel
      await pusher.trigger(
        `private-user-${receiverId}`,
        'new-message',
        populatedMessage
      );
      console.log('[Messages API] ✓ Triggered to receiver');

      // Also trigger to sender's channel for optimistic UI updates
      await pusher.trigger(
        `private-user-${session.user.id}`,
        'new-message',
        populatedMessage
      );
      console.log('[Messages API] ✓ Triggered to sender');
    } catch (pusherError) {
      console.error('[Messages API] Pusher trigger error:', pusherError);
    }

    return NextResponse.json({ message: populatedMessage }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
