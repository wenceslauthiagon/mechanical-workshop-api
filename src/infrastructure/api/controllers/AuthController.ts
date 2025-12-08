import { Request, Response } from 'express';
import { RegisterUseCase } from '@application/use-cases/auth/RegisterUseCase';
import { LoginUseCase } from '@application/use-cases/auth/LoginUseCase';

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.registerUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      res.status(400).json({ message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.loginUseCase.execute(req.body);
      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(401).json({ message });
    }
  }
}
