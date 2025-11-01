import mongoose, { Schema, Model, models } from 'mongoose';

export enum JobType {
  ACADEMIC_PROJECT = 'ACADEMIC_PROJECT',
  STARTUP_COLLABORATION = 'STARTUP_COLLABORATION',
  PART_TIME_JOB = 'PART_TIME_JOB',
  COMPETITION_TEAM = 'COMPETITION_TEAM',
  HACKATHON = 'HACKATHON',
  INTERNSHIP = 'INTERNSHIP',
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  FILLED = 'FILLED',
  CLOSED = 'CLOSED',
}

export interface IJobPost {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: JobType;
  tags: string[];
  requirements: string[];
  compensation?: string;
  duration?: string;
  status: PostStatus;
  views: number;
  creatorId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobPostSchema = new Schema<IJobPost>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    type: {
      type: String,
      enum: Object.values(JobType),
      required: [true, 'Job type is required'],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr: string[]) {
          return arr.length <= 10;
        },
        message: 'Maximum 10 tags allowed',
      },
    },
    requirements: {
      type: [String],
      default: [],
    },
    compensation: String,
    duration: String,
    status: {
      type: String,
      enum: Object.values(PostStatus),
      default: PostStatus.ACTIVE,
    },
    views: {
      type: Number,
      default: 0,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
JobPostSchema.index({ creatorId: 1, createdAt: -1 });
JobPostSchema.index({ status: 1, createdAt: -1 });
JobPostSchema.index({ type: 1 });
JobPostSchema.index({ tags: 1 });
JobPostSchema.index({ title: 'text', description: 'text' }); // Full-text search

const JobPost: Model<IJobPost> =
  models.JobPost || mongoose.model<IJobPost>('JobPost', JobPostSchema);

export default JobPost;
