import { injectable } from "inversify";
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
