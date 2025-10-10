import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SharedModule } from '../shared/shared.module';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './controllers/auth.controller';
import { APP_CONSTANTS, ENV_KEYS } from '../shared/constants/app.constants';

@Module({
  imports: [
    SharedModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret =
          configService.get<string>(ENV_KEYS.JWT_SECRET) ||
          APP_CONSTANTS.DEFAULT_JWT_SECRET_FALLBACK;
        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn:
              configService.get<string>(ENV_KEYS.JWT_EXPIRES_IN) ||
              APP_CONSTANTS.DEFAULT_JWT_EXPIRES_IN,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtStrategy, PrismaService],
  exports: [AuthService, UserService],
})
export class AuthModule {}
