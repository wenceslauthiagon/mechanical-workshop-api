import {
  Controller,
  Post,
  Body,
  Get,
  Inject,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBody,
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
import { Public } from '../decorators/public.decorator';
// import { GetUser } from '../decorators/get-user.decorator'; // Not used yet
// import { User } from '@prisma/client'; // Not used
import { UserRole } from '../../shared/enums/user-role.enum';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    schema: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: { type: 'string', example: 'admin' },
        password: { type: 'string', example: 'admin123' },
      },
    },
  })
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

  @Post('users/first-admin')
  @Public()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['username', 'email', 'password', 'confirmPassword', 'role'],
      properties: {
        username: { type: 'string', example: 'admin' },
        email: { type: 'string', example: 'admin@oficina.com' },
        password: { type: 'string', example: 'admin123' },
        confirmPassword: { type: 'string', example: 'admin123' },
        role: { type: 'string', example: 'ADMIN' },
      },
    },
  })
  @ApiOperation({
    summary: 'Criar primeiro usuário admin',
    description:
      'Cria o primeiro usuário admin do sistema. Só funciona quando não há usuários cadastrados.',
  })
  @ApiResponse({
    status: 201,
    description: 'Primeiro admin criado com sucesso',
  })
  @ApiResponse({
    status: 409,
    description: 'Já existem usuários no sistema',
  })
  async createFirstAdmin(@Body() createUserDto: CreateUserDto) {
    const userData = this.removeConfirmPassword(createUserDto);
    return this.userService.createFirstAdmin(userData);
  }

  @Post('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['username', 'email', 'password', 'confirmPassword', 'role'],
      properties: {
        username: { type: 'string', example: 'funcionario1' },
        email: { type: 'string', example: 'funcionario1@oficina.com' },
        password: { type: 'string', example: 'senha123' },
        confirmPassword: { type: 'string', example: 'senha123' },
        role: { type: 'string', example: 'EMPLOYEE' },
      },
    },
  })
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
    const userData = this.removeConfirmPassword(createUserDto);
    return this.userService.create(userData);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
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
  async getProfile(@Request() req: any) {
    const { passwordHash, ...user } = req.user;
    void passwordHash;
    return user;
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
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

  private removeConfirmPassword(
    dto: CreateUserDto,
  ): Omit<CreateUserDto, 'confirmPassword'> {
    const { confirmPassword, ...userData } = dto;
    void confirmPassword;
    return userData;
  }
}

