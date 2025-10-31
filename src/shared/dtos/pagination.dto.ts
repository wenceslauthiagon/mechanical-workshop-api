import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, Min, Max } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: 'Número da página (começando em 0)',
    example: 0,
    minimum: 0,
    required: false,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0, { message: 'A página deve ser no mínimo 0' })
  page?: number = 0;

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
  @Min(1, { message: 'O tamanho deve ser no mínimo 1' })
  @Max(100, { message: 'O tamanho deve ser no máximo 100' })
  size?: number = 10;

  get skip(): number {
    return (this.page || 0) * (this.size || 10);
  }

  get take(): number {
    return this.size || 10;
  }
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Dados da página atual' })
  data: T[];

  @ApiProperty({ description: 'Metadados da paginação' })
  pagination: {
    page: number;
    totalPages: number;
    totalRecords: number;
  };

  constructor(data: T[], page: number, size: number, total: number) {
    this.data = data;
    this.pagination = {
      page,
      totalPages: Math.ceil(total / size),
      totalRecords: total,
    };
  }
}
