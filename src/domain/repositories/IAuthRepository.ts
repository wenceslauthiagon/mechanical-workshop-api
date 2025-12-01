import { Owner } from '@domain/entities/Owner';

export interface IAuthRepository {
  findByEmail(email: string): Promise<Owner | null>;
  register(owner: Owner, hashedPassword: string): Promise<Owner>;
}
