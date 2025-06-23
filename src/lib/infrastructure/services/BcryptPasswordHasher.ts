import { injectable } from "inversify";
import bcrypt from "bcryptjs";
import type { IPasswordHasher } from "../../application/interfaces/IPasswordHasher";

@injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly saltRounds = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async verify(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
