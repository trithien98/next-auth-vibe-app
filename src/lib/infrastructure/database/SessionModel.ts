import { Schema, model, models, Document } from "mongoose";

export interface ISessionDocument extends Document {
  userId: Schema.Types.ObjectId;
  refreshToken: string;
  accessToken: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
  deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
    deviceId?: string;
  };
  isActive: boolean;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    accessToken: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    refreshExpiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    deviceInfo: {
      userAgent: {
        type: String,
        trim: true,
      },
      ipAddress: {
        type: String,
        trim: true,
      },
      deviceId: {
        type: String,
        trim: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
SessionSchema.index({ userId: 1, isActive: 1 });
SessionSchema.index({ refreshToken: 1, isActive: 1 });
SessionSchema.index({ expiresAt: 1 });
SessionSchema.index({ refreshExpiresAt: 1 });

// TTL index to automatically remove expired sessions
SessionSchema.index({ refreshExpiresAt: 1 }, { expireAfterSeconds: 0 });

export const SessionModel =
  models.Session || model<ISessionDocument>("Session", SessionSchema);
