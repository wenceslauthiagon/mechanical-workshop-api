import { IAuthRepository } from '@domain/repositories/IAuthRepository';
import { AuthService } from '@shared/services/AuthService';
import { ERROR_MESSAGES } from '@shared/constants/messages.constants';
import { v4 as uuidv4 } from 'uuid';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address?: string;
}

interface RegisterOutput {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  token: string;
}

export class RegisterUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    if (input.password !== input.confirmPassword) {
      throw new Error(ERROR_MESSAGES.PASSWORD_MISMATCH);
    }

    if (input.password.length < 6) {
      throw new Error(ERROR_MESSAGES.PASSWORD_TOO_SHORT);
    }

    const existingOwner = await this.authRepository.findByEmail(input.email);
    if (existingOwner) {
      throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED);
    }

    const hashedPassword = await this.authService.hashPassword(input.password);

    const owner = {
      id: uuidv4(),
      name: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdOwner = await this.authRepository.register(owner, hashedPassword);

    const token = this.authService.generateToken({
      userId: createdOwner.id,
      email: createdOwner.email,
    });

    return {
      id: createdOwner.id,
      name: createdOwner.name,
      email: createdOwner.email,
      phone: createdOwner.phone,
      address: createdOwner.address,
      token,
    };
  }
}
