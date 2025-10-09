import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { LoginDto } from '../dto/login.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login do usuário',
    description: 'Autentica um usuário e retorna um token JWT',
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar usuário (Admin apenas)',
    description: 'Cria um novo usuário no sistema. Requer role ADMIN.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - Role ADMIN necessário',
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obter perfil do usuário',
    description: 'Retorna informações do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
  })
  async getProfile(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...user } = req.user;
    return user;
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar usuários (Admin apenas)',
    description: 'Lista todos os usuários do sistema. Requer role ADMIN.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - Role ADMIN necessário',
  })
  async getUsers() {
    return this.userService.findAll();
  }
}
