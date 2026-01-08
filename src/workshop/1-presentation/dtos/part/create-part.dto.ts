import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePartDto {
  @ApiProperty({ description: 'Nome da peça' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Descrição da peça' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Número da peça' })
  @IsNotEmpty()
  @IsString()
  partNumber!: string;

  @ApiProperty({ description: 'Preço da peça' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @ApiProperty({ description: 'Quantidade em estoque' })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock!: number;

  @ApiProperty({ description: 'Estoque mínimo' })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minStock!: number;

  @ApiPropertyOptional({ description: 'Fornecedor' })
  @IsOptional()
  @IsString()
  supplier?: string;
}
