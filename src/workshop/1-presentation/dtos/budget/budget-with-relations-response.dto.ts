import { ApiProperty } from '@nestjs/swagger';
import { BudgetStatus } from '../../../3-domain/entities/budget.entity';

export class BudgetItemResponseDto {
  @ApiProperty({
    description: 'ID único do item do orçamento',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  id: string;

  @ApiProperty({
    description: 'Tipo do item (SERVICE ou PART)',
    example: 'SERVICE',
  })
  type: 'SERVICE' | 'PART';

  @ApiProperty({
    description: 'ID do serviço (se aplicável)',
    example: '550e8400-e29b-41d4-a716-446655440004',
    required: false,
  })
  serviceId?: string;

  @ApiProperty({
    description: 'ID da peça (se aplicável)',
    example: '550e8400-e29b-41d4-a716-446655440005',
    required: false,
  })
  partId?: string;

  @ApiProperty({
    description: 'Descrição do item',
    example: 'Troca de óleo do motor',
  })
  description: string;

  @ApiProperty({
    description: 'Quantidade',
    example: 1,
  })
  quantity: number;

  @ApiProperty({
    description: 'Preço unitário',
    example: 150.0,
  })
  unitPrice: number;

  @ApiProperty({
    description: 'Preço total do item',
    example: 150.0,
  })
  total: number;

  @ApiProperty({
    description: 'Dados do serviço relacionado (quando aplicável)',
    required: false,
  })
  service?: {
    name: string;
    description: string;
    category: string;
  };

  @ApiProperty({
    description: 'Dados da peça relacionada (quando aplicável)',
    required: false,
  })
  part?: {
    name: string;
    description: string;
    partNumber: string;
  };
}

export class BudgetWithRelationsResponseDto {
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

  @ApiProperty({
    description: 'Dados atualizados do cliente',
  })
  customer: {
    id: string;
    name: string;
    document: string;
    email: string;
    phone: string;
  };

  @ApiProperty({
    description: 'Dados atualizados da ordem de serviço',
  })
  serviceOrder: {
    id: string;
    orderNumber: string;
    status: string;
    description: string;
  };

  @ApiProperty({
    description: 'Itens do orçamento com dados relacionados atualizados',
    type: [BudgetItemResponseDto],
  })
  items: BudgetItemResponseDto[];
}
