import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../../infrastructure/auth/auth.service';

export class LoginDto {
  username: string;
  password: string;
}

export class LoginResponseDto {
  access_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    // TODO: Implement login logic with user repository
    console.log(`Login attempt for user: ${loginDto.username}`);
    return Promise.reject(new Error('Login not implemented yet'));
  }
}
