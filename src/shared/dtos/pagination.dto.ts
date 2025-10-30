import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min, Max } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: 'Número da página (começando em 1)',
    example: 1,
    minimum: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: 'A página deve ser um número positivo' })
  @Min(1, { message: 'A página deve ser no mínimo 1' })
  page?: number = 1;

  @ApiProperty({
    description: 'Número de itens por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: 'O limite deve ser um número positivo' })
  @Min(1, { message: 'O limite deve ser no mínimo 1' })
  @Max(100, { message: 'O limite deve ser no máximo 100' })
  limit?: number = 10;

  get skip(): number {
    return ((this.page || 1) - 1) * (this.limit || 10);
  }

  get take(): number {
    return this.limit || 10;
  }
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Dados da página atual' })
  data: T[];

  @ApiProperty({ description: 'Metadados da paginação' })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  constructor(data: T[], page: number, limit: number, total: number) {
    this.data = data;
    this.pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }
}
