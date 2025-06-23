import "reflect-metadata";
import { Container } from "inversify";

// Use Cases
import { RegisterUserUseCase } from "../../application/use-cases/RegisterUser.usecase";
import { LoginUserUseCase } from "../../application/use-cases/LoginUser.usecase";
import { LogoutUserUseCase } from "../../application/use-cases/LogoutUser.usecase";

// Interfaces
import type { IUserRepository } from "../../application/interfaces/IUserRepository";
import type { IPasswordHasher } from "../../application/interfaces/IPasswordHasher";
import type { IJwtTokenService } from "../../application/interfaces/IJwtTokenService";
import type { IEmailService } from "../../application/interfaces/IEmailService";

// Infrastructure Implementations
import { MongoUserRepository } from "../repositories/MongoUserRepository";
import { BcryptPasswordHasher } from "../services/BcryptPasswordHasher";
import { JwtTokenService } from "../services/JwtTokenService";
import { EmailService } from "../services/EmailService";

// Controllers
import { AuthController } from "../../adapters/controllers/AuthController";

const container = new Container();

// Bind Use Cases
container
  .bind<RegisterUserUseCase>("RegisterUserUseCase")
  .to(RegisterUserUseCase);
container.bind<LoginUserUseCase>("LoginUserUseCase").to(LoginUserUseCase);
container.bind<LogoutUserUseCase>("LogoutUserUseCase").to(LogoutUserUseCase);

// Bind Repositories
container.bind<IUserRepository>("IUserRepository").to(MongoUserRepository);

// Bind Services
container.bind<IPasswordHasher>("IPasswordHasher").to(BcryptPasswordHasher);
container.bind<IJwtTokenService>("IJwtTokenService").to(JwtTokenService);
container.bind<IEmailService>("IEmailService").to(EmailService);

// Bind Controllers
container.bind<AuthController>("AuthController").to(AuthController);

export { container };
