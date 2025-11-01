import connectDB from '@/lib/mongodb';
import User from '@/models/user';

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return new Response(JSON.stringify({ error: 'No token provided' }), {
      status: 400,
    });
  }

  const user = await User.findOne({
    verifyToken: token,
    verifyTokenExpiry: { $gt: Date.now() }, // token not expired
  });

  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 400,
    });
  }

  user.emailVerified = new Date();
  user.verifyToken = undefined;
  user.verifyTokenExpiry = undefined;
  await user.save();

  // Redirect to a success page
  return Response.redirect(`${process.env.NEXTAUTH_URL}/dashboard`);
}
