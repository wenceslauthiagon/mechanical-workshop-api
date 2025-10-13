import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  Max,
  ArrayNotEmpty,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMechanicDto {
  @ApiProperty({
    description: 'Nome completo do mecânico',
    example: 'João Silva',
  })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    description: 'Email do mecânico',
    example: 'joao.silva@oficina.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Telefone de contato',
    example: '(11) 99999-9999',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Lista de especialidades do mecânico',
    example: ['Motor', 'Freios', 'Suspensão'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  specialties: string[];

  @ApiPropertyOptional({
    description: 'Anos de experiência profissional',
    example: 5,
    minimum: 0,
    maximum: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  experienceYears?: number;
}
