import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, university, major } = await req.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      if (!existingUser.emailVerified) {
        const verifyToken = crypto.randomBytes(32).toString('hex');
        const verifyTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

        // Create user
        existingUser.verifyToken = verifyToken;
        existingUser.verifyTokenExpiry = verifyTokenExpiry;
        await existingUser.save();

        const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verifyToken}`;

        // Configure Nodemailer for Sendinblue SMTP
        const transporter = nodemailer.createTransport({
          host: 'smtp-relay.brevo.com', // Sendinblue SMTP host
          port: 587,
          secure: false, // Use TLS (not SSL)
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"CampusConnect" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Verify Your CampusConnect Email',
          html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); text-align: center;">
        <h1 style="color: #111827; font-size: 24px; margin-bottom: 20px;">Welcome to CampusConnect!</h1>
        <p style="color: #4B5563; font-size: 16px; margin-bottom: 30px;">
          Please verify your email address to activate your account.
        </p>
        <a href="${verifyUrl}" 
           style="display: inline-block; background-color: #4F46E5; color: #ffffff; padding: 12px 25px; font-size: 16px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Verify Email
        </a>
        <p style="color: #9CA3AF; font-size: 14px; margin-top: 30px;">
          This verification link will expire in 1 hour.
        </p>
        <p style="color: #9CA3AF; font-size: 12px; margin-top: 20px;">
          If you did not create an account, you can safely ignore this email.
        </p>
      </div>
    </div>
  `,
        });

        return NextResponse.json(
          {
            error: 'Your are Not verified. Email Verification Sent',
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      university,
      major,
    });

    user.verifyToken = verifyToken;
    user.verifyTokenExpiry = verifyTokenExpiry;

    await user.save();

    const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verifyToken}`;

    // Configure Nodemailer for Sendinblue SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com', // Sendinblue SMTP host
      port: 587,
      secure: false, // Use TLS (not SSL)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"CampusConnect" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your CampusConnect Email',
      html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); text-align: center;">
        <h1 style="color: #111827; font-size: 24px; margin-bottom: 20px;">Welcome to CampusConnect!</h1>
        <p style="color: #4B5563; font-size: 16px; margin-bottom: 30px;">
          Please verify your email address to activate your account.
        </p>
        <a href="${verifyUrl}" 
           style="display: inline-block; background-color: #4F46E5; color: #ffffff; padding: 12px 25px; font-size: 16px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Verify Email
        </a>
        <p style="color: #9CA3AF; font-size: 14px; margin-top: 30px;">
          This verification link will expire in 1 hour.
        </p>
        <p style="color: #9CA3AF; font-size: 12px; margin-top: 20px;">
          If you did not create an account, you can safely ignore this email.
        </p>
      </div>
    </div>
  `,
    });

    return NextResponse.json(
      {
        message: 'User created successfully, Go to email to verify your email',
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
