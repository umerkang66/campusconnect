import mongoose, { Schema, Model, models } from 'mongoose';

export interface ISavedJob {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  jobPostId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const SavedJobSchema = new Schema<ISavedJob>(
  {
    userId: {
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

// Compound unique index
SavedJobSchema.index({ userId: 1, jobPostId: 1 }, { unique: true });

const SavedJob: Model<ISavedJob> =
  models.SavedJob || mongoose.model<ISavedJob>('SavedJob', SavedJobSchema);

export default SavedJob;
