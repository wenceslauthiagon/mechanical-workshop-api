import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../../shared/enums';

export class User {
  public readonly id: string;
  public readonly username: string;
  public readonly email: string;
  public passwordHash: string;
  public role: UserRole;
  public isActive: boolean;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    username: string,
    email: string,
    passwordHash: string,
    role: UserRole = UserRole.ADMIN,
    id?: string,
    isActive?: boolean,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.id = id || uuidv4();
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.isActive = isActive !== undefined ? isActive : true;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  public updatePassword(newPasswordHash: string): void {
    this.passwordHash = newPasswordHash;
    this.updatedAt = new Date();
  }

  public updateRole(newRole: UserRole): void {
    this.role = newRole;
    this.updatedAt = new Date();
  }

  public activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  public deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }
}
