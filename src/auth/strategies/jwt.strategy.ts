import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService, JwtPayload } from '../services/auth.service';
import { ERROR_MESSAGES } from '../../shared/constants/messages.constants';
import { ErrorHandlerService } from '../../shared/services/error-handler.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly errorHandler: ErrorHandlerService,
  ) {
    const jwtSecret = process.env.JWT_SECRET || 'default-jwt-secret-fallback-key-12345';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateJwtPayload(payload);

    if (!user) {
      this.errorHandler.handleError(new Error(ERROR_MESSAGES.INVALID_TOKEN));
    }

    return user;
  }
}
