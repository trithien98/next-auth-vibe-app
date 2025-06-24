import { Schema, model, models, Document } from "mongoose";

export interface IUserDocument extends Document {
  email: string;
  passwordHash: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
    isEmailVerified: boolean;
    isTwoFactorEnabled: boolean;
    lastLoginAt?: Date;
  };
  roles: string[]; // Array of role IDs
  isActive: boolean;
  // Email verification fields
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  // Password reset fields
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    profile: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
      avatar: {
        type: String,
        trim: true,
      },
      phoneNumber: {
        type: String,
        trim: true,
      },
      dateOfBirth: {
        type: Date,
      },
      isEmailVerified: {
        type: Boolean,
        default: false,
      },
      isTwoFactorEnabled: {
        type: Boolean,
        default: false,
      },
      lastLoginAt: {
        type: Date,
      },
    },
    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    // Email verification fields
    emailVerificationToken: {
      type: String,
      index: true,
    },
    emailVerificationExpires: {
      type: Date,
      index: true,
    },
    // Password reset fields
    passwordResetToken: {
      type: String,
      index: true,
    },
    passwordResetExpires: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ "profile.isEmailVerified": 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ emailVerificationToken: 1 });
UserSchema.index({ passwordResetToken: 1 });

export const UserModel =
  models.User || model<IUserDocument>("User", UserSchema);
