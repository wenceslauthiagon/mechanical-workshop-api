import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MechanicResponseDto {
  @ApiProperty({
    description: 'ID único do mecânico',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome completo do mecânico',
    example: 'João Silva',
  })
  name: string;

  @ApiProperty({
    description: 'Email do mecânico',
    example: 'joao.silva@oficina.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Telefone de contato',
    example: '(11) 99999-9999',
  })
  phone?: string;

  @ApiProperty({
    description: 'Lista de especialidades do mecânico',
    example: ['Motor', 'Freios', 'Suspensão'],
    type: [String],
  })
  specialties: string[];

  @ApiProperty({
    description: 'Se o mecânico está ativo no sistema',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Se o mecânico está disponível para novos serviços',
    example: true,
  })
  isAvailable: boolean;

  @ApiProperty({
    description: 'Anos de experiência profissional',
    example: 5,
  })
  experienceYears: number;

  @ApiPropertyOptional({
    description: 'Número de ordens de serviço ativas',
    example: 3,
  })
  activeServiceOrders?: number;

  @ApiPropertyOptional({
    description: 'Número de ordens de serviço concluídas',
    example: 25,
  })
  completedServiceOrders?: number;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2023-10-01T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2023-10-01T10:00:00Z',
  })
  updatedAt: Date;

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.specialties = data.specialties;
    this.isActive = data.isActive;
    this.isAvailable = data.isAvailable;
    this.experienceYears = data.experienceYears;
    this.activeServiceOrders = data.activeServiceOrders;
    this.completedServiceOrders = data.completedServiceOrders;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class MechanicWorkloadDto {
  @ApiProperty({
    description: 'Número de ordens ativas',
    example: 3,
  })
  activeOrders: number;

  @ApiProperty({
    description: 'Número de ordens concluídas neste mês',
    example: 8,
  })
  completedThisMonth: number;

  @ApiProperty({
    description: 'Tempo médio de conclusão em horas',
    example: 4.5,
  })
  averageCompletionTime: number;
}
