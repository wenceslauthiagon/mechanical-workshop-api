import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async generateJwtToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  async verifyJwtToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(token);
  }
}
