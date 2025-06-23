import { Schema, model, models, Document } from "mongoose";

export interface IRoleDocument extends Document {
  name: string;
  description: string;
  level: number;
  permissions: string[]; // Array of permission IDs
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRoleDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
RoleSchema.index({ name: 1 });
RoleSchema.index({ level: 1 });
RoleSchema.index({ isActive: 1 });

export const RoleModel =
  models.Role || model<IRoleDocument>("Role", RoleSchema);
