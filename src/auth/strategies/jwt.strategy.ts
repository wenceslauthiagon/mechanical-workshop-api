import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService, JwtPayload } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';
import { ERROR_MESSAGES } from '../../shared/constants/messages.constants';
import { APP_CONSTANTS, ENV_KEYS } from '../../shared/constants/app.constants';
import { ErrorHandlerService } from '../../shared/services/error-handler.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly errorHandler: ErrorHandlerService,
  ) {
    const jwtSecret =
      configService.get<string>(ENV_KEYS.JWT_SECRET) ||
      APP_CONSTANTS.DEFAULT_JWT_SECRET_FALLBACK;

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
