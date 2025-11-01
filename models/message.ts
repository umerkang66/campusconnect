import mongoose, { Schema, Model, models } from 'mongoose';

export interface IMessage {
  _id: mongoose.Types.ObjectId;
  content: string;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for chat queries
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
MessageSchema.index({ receiverId: 1, read: 1 });

const Message: Model<IMessage> =
  models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
