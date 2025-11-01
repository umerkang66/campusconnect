import mongoose, { Schema, Model, models } from 'mongoose';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  password?: string;
  emailVerified?: Date;
  image?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  resume?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    password: {
      type: String,
      select: false, // Don't return password in queries by default
    },
    emailVerified: Date,
    image: String,
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    resume: String,
    university: String,
    major: String,
    graduationYear: Number,
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ skills: 1 });

const User: Model<IUser> =
  models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
