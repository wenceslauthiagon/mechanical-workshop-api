import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  Matches,
  Length,
} from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({
    description: 'Placa do veículo',
    example: 'ABC-1234',
    pattern: '^[A-Z]{3}-[0-9]{4}$|^[A-Z]{3}[0-9][A-Z][0-9]{2}$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{3}-[0-9]{4}$|^[A-Z]{3}[0-9][A-Z][0-9]{2}$/, {
    message: 'Placa deve estar no formato ABC-1234 ou ABC1D23 (Mercosul)',
  })
  licensePlate: string;

  @ApiProperty({
    description: 'ID do cliente proprietário do veículo',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({
    description: 'Marca do veículo',
    example: 'Toyota',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  brand: string;

  @ApiProperty({
    description: 'Modelo do veículo',
    example: 'Corolla',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  model: string;

  @ApiProperty({
    description: 'Ano do veículo',
    example: 2023,
    minimum: 1900,
    maximum: 2030,
  })
  @IsInt()
  @Min(1900)
  @Max(2030)
  year: number;

  @ApiProperty({
    description: 'Cor do veículo',
    example: 'Branco',
    minLength: 3,
    maxLength: 30,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 30)
  color: string;
}
