import { ApiProperty } from '@nestjs/swagger';

export class VehicleResponseDto {
  @ApiProperty({
    description: 'ID único do veículo',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Placa do veículo',
    example: 'ABC-1234',
  })
  licensePlate: string;

  @ApiProperty({
    description: 'ID do cliente proprietário',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  customerId: string;

  @ApiProperty({
    description: 'Marca do veículo',
    example: 'Toyota',
  })
  brand: string;

  @ApiProperty({
    description: 'Modelo do veículo',
    example: 'Corolla',
  })
  model: string;

  @ApiProperty({
    description: 'Ano do veículo',
    example: 2023,
  })
  year: number;

  @ApiProperty({
    description: 'Cor do veículo',
    example: 'Branco',
  })
  color: string;

  @ApiProperty({
    description: 'Data de criação',
    example: '2025-10-08T14:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de última atualização',
    example: '2025-10-08T14:30:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Dados do cliente proprietário',
    required: false,
  })
  customer?: {
    id: string;
    name: string;
    document: string;
    email: string;
    phone: string;
  };
}
