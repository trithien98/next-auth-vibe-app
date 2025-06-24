import { injectable } from "inversify";
import bcrypt from "bcryptjs";
import { User } from "../../domain/entities/User.entity";
import { Role } from "../../domain/entities/Role.entity";
import { Permission } from "../../domain/entities/Permission.entity";
import { UserId } from "../../domain/value-objects/UserId.vo";
import { Email } from "../../domain/value-objects/Email.vo";
import type { IUserRepository } from "../../application/interfaces/IUserRepository";
import { UserModel, IUserDocument } from "../database/UserModel";
import { connectToDatabase } from "../database/connection";

@injectable()
export class MongoUserRepository implements IUserRepository {
  async findById(id: UserId): Promise<User | null> {
    await connectToDatabase();

    const userDoc = await UserModel.findById(id.getValue())
      .populate({
        path: "roles",
        populate: {
          path: "permissions",
          model: "Permission",
        },
      })
      .exec();

    if (!userDoc) {
      return null;
    }

    return this.mapToEntity(userDoc);
  }

  async findByEmail(email: Email): Promise<User | null> {
    await connectToDatabase();

    const userDoc = await UserModel.findOne({ email: email.getValue() })
      .populate({
        path: "roles",
        populate: {
          path: "permissions",
          model: "Permission",
        },
      })
      .exec();

    if (!userDoc) {
      return null;
    }

    return this.mapToEntity(userDoc);
  }

  async save(user: User): Promise<void> {
    await connectToDatabase();

    const userDoc = new UserModel({
      _id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      profile: user.getProfile(),
      roles: user.getRoles().map((role) => role.getId()),
      isActive: user.isUserActive(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    });

    await userDoc.save();
  }

  async update(user: User): Promise<void> {
    await connectToDatabase();

    await UserModel.findByIdAndUpdate(
      user.getId().getValue(),
      {
        profile: user.getProfile(),
        roles: user.getRoles().map((role) => role.getId()),
        isActive: user.isUserActive(),
        updatedAt: user.getUpdatedAt(),
      },
      { new: true }
    );
  }

  async delete(id: UserId): Promise<void> {
    await connectToDatabase();

    await UserModel.findByIdAndDelete(id.getValue());
  }

  async exists(email: Email): Promise<boolean> {
    await connectToDatabase();

    const count = await UserModel.countDocuments({ email: email.getValue() });
    return count > 0;
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    await connectToDatabase();

    const userDoc = await UserModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    })
      .populate({
        path: "roles",
        populate: {
          path: "permissions",
          model: "Permission",
        },
      })
      .exec();

    if (!userDoc) {
      return null;
    }

    return this.mapToEntity(userDoc);
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    await connectToDatabase();

    const userDoc = await UserModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    })
      .populate({
        path: "roles",
        populate: {
          path: "permissions",
          model: "Permission",
        },
      })
      .exec();

    if (!userDoc) {
      return null;
    }

    return this.mapToEntity(userDoc);
  }

  async verifyPassword(email: Email, password: string): Promise<boolean> {
    await connectToDatabase();

    const userDoc = await UserModel.findOne({ email: email.getValue() }).exec();
    if (!userDoc) {
      return false;
    }

    // Use bcrypt to verify the password
    return await bcrypt.compare(password, userDoc.passwordHash);
  }

  async setVerificationToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    await connectToDatabase();

    await UserModel.findByIdAndUpdate(userId, {
      emailVerificationToken: token,
      emailVerificationExpires: expiresAt,
    });
  }

  async clearVerificationToken(userId: string): Promise<void> {
    await connectToDatabase();

    await UserModel.findByIdAndUpdate(userId, {
      $unset: {
        emailVerificationToken: 1,
        emailVerificationExpires: 1,
      },
    });
  }

  async setPasswordResetToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    await connectToDatabase();

    await UserModel.findByIdAndUpdate(userId, {
      passwordResetToken: token,
      passwordResetExpires: expiresAt,
    });
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    await connectToDatabase();

    await UserModel.findByIdAndUpdate(userId, {
      $unset: {
        passwordResetToken: 1,
        passwordResetExpires: 1,
      },
    });
  }

  private mapToEntity(userDoc: IUserDocument): User {
    const userId = new UserId((userDoc._id as unknown as string).toString());
    const email = new Email(userDoc.email);

    // Map roles with permissions - handling populated documents
    const roles = Array.isArray(userDoc.roles)
      ? userDoc.roles.map((roleDoc: unknown) => {
          const role = roleDoc as {
            _id: string;
            name: string;
            description: string;
            level: number;
            permissions: unknown[];
          };
          const permissions = role.permissions.map((permDoc: unknown) => {
            const perm = permDoc as {
              _id: string;
              name?: string;
              description: string;
              resource: string;
              action: string;
            };
            return new Permission(
              perm._id.toString(),
              perm.name || `${perm.resource}:${perm.action}`,
              perm.description,
              perm.resource,
              perm.action
            );
          });

          return new Role(
            role._id.toString(),
            role.name,
            role.description,
            role.level,
            permissions
          );
        })
      : [];

    return new User(
      userId,
      email,
      userDoc.profile,
      roles,
      userDoc.isActive,
      userDoc.createdAt,
      userDoc.updatedAt
    );
  }
}
