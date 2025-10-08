import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ description: 'Placa do veículo', example: 'ABC-1234' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z]{3}-\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/, {
    message: 'Placa deve estar no formato ABC-1234 ou ABC1D23 (Mercosul)',
  })
  licensePlate: string;

  @ApiProperty({ description: 'Marca do veículo', example: 'Toyota' })
  @IsNotEmpty()
  @IsString()
  brand: string;

  @ApiProperty({ description: 'Modelo do veículo', example: 'Corolla' })
  @IsNotEmpty()
  @IsString()
  model: string;

  @ApiProperty({ description: 'Ano do veículo', example: 2020 })
  @IsNotEmpty()
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @ApiProperty({ description: 'Cor do veículo', example: 'Branco' })
  @IsNotEmpty()
  @IsString()
  color: string;

  @ApiProperty({ description: 'ID do cliente proprietário' })
  @IsNotEmpty()
  @IsString()
  customerId: string;
}
