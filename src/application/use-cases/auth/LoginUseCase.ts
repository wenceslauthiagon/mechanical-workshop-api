import { IAuthRepository } from '@domain/repositories/IAuthRepository';
import { AuthService } from '@shared/services/AuthService';
import { ERROR_MESSAGES } from '@shared/constants/messages.constants';
import { prisma } from '@infrastructure/database/prisma';

interface LoginInput {
  email: string;
  password: string;
}

interface LoginOutput {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  token: string;
}

export class LoginUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const owner = await this.authRepository.findByEmail(input.email);
    if (!owner) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const ownerWithPassword = await prisma.owner.findUnique({
      where: { email: input.email },
    });

    if (!ownerWithPassword) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await this.authService.comparePassword(
      input.password,
      ownerWithPassword.password,
    );

    if (!isPasswordValid) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const token = this.authService.generateToken({
      userId: owner.id,
      email: owner.email,
    });

    return {
      id: owner.id,
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      address: owner.address,
      token,
    };
  }
}
