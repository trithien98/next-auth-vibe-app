import { Schema, model, models, Document } from "mongoose";

export interface IPermissionDocument extends Document {
  resource: string;
  action: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new Schema<IPermissionDocument>(
  {
    resource: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for resource and action
PermissionSchema.index({ resource: 1, action: 1 }, { unique: true });
PermissionSchema.index({ isActive: 1 });

export const PermissionModel =
  models.Permission ||
  model<IPermissionDocument>("Permission", PermissionSchema);
