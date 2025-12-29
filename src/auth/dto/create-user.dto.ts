import { IsNotEmpty, IsString, IsEmail, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

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
