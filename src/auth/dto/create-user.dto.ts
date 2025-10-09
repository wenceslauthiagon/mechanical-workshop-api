import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsEnum,
  MinLength,
  Validate,
} from 'class-validator';
import { UserRole } from '@prisma/client';
import { PasswordMatchValidator } from '../validators/password-match.validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome de usuário único',
    example: 'joao.silva',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao.silva@empresa.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'Senha123',
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Confirmação da senha',
    example: 'Senha123',
  })
  @IsNotEmpty()
  @IsString()
  @Validate(PasswordMatchValidator)
  confirmPassword: string;

  @ApiProperty({
    description: 'Função do usuário no sistema',
    enum: UserRole,
    example: UserRole.EMPLOYEE,
    required: false,
  })
  @IsEnum(UserRole)
  role?: UserRole;
}
