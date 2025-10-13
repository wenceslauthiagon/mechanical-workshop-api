import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { BudgetItem } from '../../../3-domain/repositories/budget.repository.interface';

export class CreateBudgetDto {
  @ApiProperty({
    description: 'ID da ordem de serviço',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  serviceOrderId: string;

  @ApiProperty({
    description: 'ID do cliente',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsString()
  customerId: string;

  @ApiProperty({
    description: 'Lista de itens do orçamento',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        type: { type: 'string', enum: ['SERVICE', 'PART'] },
        description: { type: 'string' },
        quantity: { type: 'number' },
        unitPrice: { type: 'number' },
        total: { type: 'number' },
      },
    },
  })
  @IsArray()
  items: BudgetItem[];

  @ApiPropertyOptional({
    description: 'Dias de validade do orçamento',
    example: 15,
    minimum: 1,
    maximum: 90,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(90)
  validDays?: number;
}
