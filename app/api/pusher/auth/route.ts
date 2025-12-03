import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Pusher from 'pusher';

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    useTLS: true,
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            console.error('[Pusher Auth] No session found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.text();
        const params = new URLSearchParams(body);
        const socketId = params.get('socket_id');
        const channelName = params.get('channel_name');

        if (!socketId || !channelName) {
            return NextResponse.json(
                { error: 'Missing socket_id or channel_name' },
                { status: 400 }
            );
        }

        // Verify that the user is only subscribing to their own private channel
        const userId = (session.user as any).id;
        const expectedChannel = `private-user-${userId}`;

        if (channelName !== expectedChannel) {
            return NextResponse.json(
                { error: 'Forbidden: Cannot subscribe to this channel' },
                { status: 403 }
            );
        }

        // Authenticate the user for this private channel
        const authResponse = pusher.authorizeChannel(socketId, channelName);

        console.log('[Pusher Auth] ✓ Authorized:', channelName);

        return NextResponse.json(authResponse);
    } catch (error) {
        console.error('Pusher auth error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
