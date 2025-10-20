import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsDecimal,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePartDto {
  @ApiProperty({
    description: 'Nome da peça',
    example: 'Filtro de Óleo',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Descrição da peça',
    example: 'Filtro de óleo para motor 1.6',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Número da peça (código do fabricante)',
    example: 'FL500S',
    required: false,
  })
  @IsString()
  @IsOptional()
  partNumber?: string;

  @ApiProperty({
    description: 'Preço da peça',
    example: '25.90',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  price?: string;

  @ApiProperty({
    description: 'Quantidade em estoque',
    example: 50,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  stock?: number;

  @ApiProperty({
    description: 'Estoque mínimo',
    example: 10,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  minStock?: number;

  @ApiProperty({
    description: 'Nome do fornecedor',
    example: 'AutoPeças Brasil Ltda',
    required: false,
  })
  @IsString()
  @IsOptional()
  supplier?: string;
}
