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
  // New fields
  linkedin?: string;
  github?: string;
  portfolio?: string;
  profileScore?: number;
  notificationsEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
  resetToken?: string;
  resetTokenExpiry?: Date | number;
  verifyToken?: string;
  verifyTokenExpiry?: Date | number;
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
    resetToken: String,
    resetTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,
    password: {
      type: String,
      select: false, // Don't return password in queries by default
    },
    emailVerified: { type: Date, default: null },
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
    // New fields
    linkedin: {
      type: String,
      trim: true,
    },
    github: {
      type: String,
      trim: true,
    },
    portfolio: {
      type: String,
      trim: true,
    },
    profileScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ skills: 1 });

// Calculate profile score before saving
UserSchema.pre('save', function (next) {
  let score = 0;
  if (this.name) score += 10;
  if (this.email) score += 10;
  if (this.bio && this.bio.length > 20) score += 15;
  if (this.skills && this.skills.length > 0) score += 15;
  if (this.interests && this.interests.length > 0) score += 10;
  if (this.resume) score += 15;
  if (this.university) score += 5;
  if (this.major) score += 5;
  if (this.linkedin) score += 5;
  if (this.github) score += 5;
  if (this.portfolio) score += 5;
  this.profileScore = Math.min(score, 100);
  next();
});

const User: Model<IUser> =
  models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
