import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateVehicleDto } from './create-vehicle.dto';

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {
  @ApiProperty({
    description: 'Placa do veículo',
    example: 'ABC-1234',
    required: false,
  })
  licensePlate?: string;

  @ApiProperty({
    description: 'ID do cliente proprietário do veículo',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  customerId?: string;

  @ApiProperty({
    description: 'Marca do veículo',
    example: 'Toyota',
    required: false,
  })
  brand?: string;

  @ApiProperty({
    description: 'Modelo do veículo',
    example: 'Corolla',
    required: false,
  })
  model?: string;

  @ApiProperty({
    description: 'Ano do veículo',
    example: 2023,
    required: false,
  })
  year?: number;

  @ApiProperty({
    description: 'Cor do veículo',
    example: 'Branco',
    required: false,
  })
  color?: string;
}
