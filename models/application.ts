import mongoose, { Schema, Model, models } from 'mongoose';

export enum ApplicationStatus {
  PENDING = 'PENDING',
  SHORTLISTED = 'SHORTLISTED',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
}

export interface IApplication {
  _id: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  coverLetter?: string;
  resume?: string;
  applicantId: mongoose.Types.ObjectId;
  jobPostId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
    },
    coverLetter: {
      type: String,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
    },
    resume: String,
    applicantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobPostId: {
      type: Schema.Types.ObjectId,
      ref: 'JobPost',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate applications
ApplicationSchema.index({ applicantId: 1, jobPostId: 1 }, { unique: true });
ApplicationSchema.index({ jobPostId: 1, status: 1 });

const Application: Model<IApplication> =
  models.Application ||
  mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;
