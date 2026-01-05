import { IsNotEmpty, IsString, IsEmail, IsEnum, MinLength, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
// import { User } from '@prisma/client'; // Not used
import { UserRole } from '../../shared/enums';
import { PasswordMatchValidator } from '../validators/password-match.validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Nome de usuário' })
  @IsNotEmpty()
  @IsString()
  username!: string;

  @ApiProperty({ description: 'Senha do usuário' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ description: 'Confirmação da senha' })
  @IsNotEmpty()
  @IsString()
  @Validate(PasswordMatchValidator)
  confirmPassword!: string;

  @ApiProperty({ description: 'Email do usuário' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: UserRole, description: 'Papel do usuário' })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role!: UserRole;
}

