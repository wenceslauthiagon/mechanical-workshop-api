import { ApiProperty } from '@nestjs/swagger';
import { ServiceOrderStatus } from '@prisma/client';

export class ServiceOrderResponseDto {
  @ApiProperty({
    description: 'ID único da ordem de serviço',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Número da ordem de serviço',
    example: 'OS-2025-001',
  })
  orderNumber: string;

  @ApiProperty({
    description: 'ID do cliente',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  customerId: string;

  @ApiProperty({
    description: 'ID do veículo',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  vehicleId: string;

  @ApiProperty({
    description: 'Status atual da ordem de serviço',
    enum: ServiceOrderStatus,
    example: ServiceOrderStatus.RECEBIDA,
  })
  status: ServiceOrderStatus;

  @ApiProperty({
    description: 'Descrição dos serviços solicitados',
    example: 'Troca de óleo e filtro, verificação de freios',
  })
  description: string;

  @ApiProperty({
    description: 'Preço total dos serviços',
    example: '150.00',
  })
  totalServicePrice: string;

  @ApiProperty({
    description: 'Preço total das peças',
    example: '75.50',
  })
  totalPartsPrice: string;

  @ApiProperty({
    description: 'Preço total da ordem de serviço',
    example: '225.50',
  })
  totalPrice: string;

  @ApiProperty({
    description: 'Tempo estimado em horas',
    example: '2.5',
  })
  estimatedTimeHours: string;

  @ApiProperty({
    description: 'Data estimada de conclusão',
    example: '2025-10-15T14:00:00.000Z',
  })
  estimatedCompletionDate: Date;

  @ApiProperty({
    description: 'Data de início dos trabalhos',
    example: '2025-10-08T09:00:00.000Z',
    nullable: true,
  })
  startedAt: Date | null;

  @ApiProperty({
    description: 'Data de conclusão dos trabalhos',
    example: '2025-10-10T16:00:00.000Z',
    nullable: true,
  })
  completedAt: Date | null;

  @ApiProperty({
    description: 'Data de entrega ao cliente',
    example: '2025-10-11T10:00:00.000Z',
    nullable: true,
  })
  deliveredAt: Date | null;

  @ApiProperty({
    description: 'Data de aprovação do orçamento',
    example: '2025-10-09T11:00:00.000Z',
    nullable: true,
  })
  approvedAt: Date | null;

  @ApiProperty({
    description: 'Data de criação',
    example: '2025-10-08T08:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de última atualização',
    example: '2025-10-08T08:30:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Dados do cliente',
  })
  customer?: {
    id: string;
    name: string;
    document: string;
    type: string;
    email: string;
    phone: string;
  };

  @ApiProperty({
    description: 'Dados do veículo',
  })
  vehicle?: {
    id: string;
    licensePlate: string;
    brand: string;
    model: string;
    year: number;
    color: string;
  };

  @ApiProperty({
    description: 'Dados do mecânico responsável',
    nullable: true,
  })
  mechanic?: {
    id: string;
    name: string;
    specialty: string;
    phone: string;
    isAvailable: boolean;
  } | null;

  @ApiProperty({
    description: 'Serviços incluídos na ordem',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        serviceId: { type: 'string' },
        quantity: { type: 'number' },
        price: { type: 'string' },
        totalPrice: { type: 'string' },
        service: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
          },
        },
      },
    },
  })
  services: Array<{
    id: string;
    serviceId: string;
    quantity: number;
    price: string;
    totalPrice: string;
    service: {
      name: string;
      description: string | null;
      category: string;
    };
  }>;

  @ApiProperty({
    description: 'Peças incluídas na ordem',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        partId: { type: 'string' },
        quantity: { type: 'number' },
        price: { type: 'string' },
        totalPrice: { type: 'string' },
        part: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            partNumber: { type: 'string' },
          },
        },
      },
    },
  })
  parts: Array<{
    id: string;
    partId: string;
    quantity: number;
    price: string;
    totalPrice: string;
    part: {
      name: string;
      description: string | null;
      partNumber: string | null;
    };
  }>;
}
