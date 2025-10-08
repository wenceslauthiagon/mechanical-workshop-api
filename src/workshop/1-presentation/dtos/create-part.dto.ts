import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  IsInt,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePartDto {
  @ApiProperty({ description: 'Nome da peça', example: 'Filtro de óleo' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Código/referência da peça' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ description: 'Preço unitário da peça', example: 25.0 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ description: 'Quantidade em estoque', example: 100 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  stockQuantity: number;

  @ApiPropertyOptional({ description: 'Fornecedor da peça' })
  @IsOptional()
  @IsString()
  supplier?: string | null;

  @ApiPropertyOptional({ description: 'Descrição da peça' })
  @IsOptional()
  @IsString()
  description?: string | null;
}
