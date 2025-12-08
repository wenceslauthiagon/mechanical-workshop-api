import { ApiProperty } from '@nestjs/swagger';
import { BudgetStatus } from '../../../3-domain/entities/budget.entity';

export class BudgetResponseDto {
  @ApiProperty({
    description: 'ID único do orçamento',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'ID da ordem de serviço',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  serviceOrderId: string;

  @ApiProperty({
    description: 'ID do cliente',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  customerId: string;

  @ApiProperty({
    description: 'Subtotal do orçamento',
    example: 1500.0,
  })
  subtotal: number;

  @ApiProperty({
    description: 'Valor dos impostos',
    example: 150.0,
  })
  taxes: number;

  @ApiProperty({
    description: 'Valor do desconto',
    example: 50.0,
  })
  discount: number;

  @ApiProperty({
    description: 'Valor total do orçamento',
    example: 1600.0,
  })
  total: number;

  @ApiProperty({
    description: 'Data de validade do orçamento',
    example: '2023-10-28T10:00:00Z',
  })
  validUntil: Date;

  @ApiProperty({
    description: 'Status do orçamento',
    enum: BudgetStatus,
    example: BudgetStatus.ENVIADO,
  })
  status: BudgetStatus;

  @ApiProperty({
    description: 'Data de criação',
    example: '2023-10-13T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de última atualização',
    example: '2023-10-13T11:30:00Z',
  })
  updatedAt: Date;

  constructor(data: any) {
    this.id = data.id;
    this.serviceOrderId = data.serviceOrderId;
    this.customerId = data.customerId;
    this.subtotal = data.subtotal;
    this.taxes = data.taxes;
    this.discount = data.discount;
    this.total = data.total;
    this.validUntil = data.validUntil;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
