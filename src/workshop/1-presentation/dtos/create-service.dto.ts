import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ description: 'Nome do serviço', example: 'Troca de óleo' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Descrição do serviço' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Preço do serviço', example: 50.0 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Tempo estimado em minutos',
    example: 30,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  estimatedTimeMinutes: number;

  @ApiPropertyOptional({ description: 'Categoria do serviço' })
  @IsOptional()
  @IsString()
  category?: string | null;
}
