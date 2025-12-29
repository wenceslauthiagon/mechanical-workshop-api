import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Nome de usuário' })
  @IsNotEmpty()
  @IsString()
  username!: string;

  @ApiProperty({ description: 'Senha do usuário' })
  @IsNotEmpty()
  @IsString()
  password!: string;
}
