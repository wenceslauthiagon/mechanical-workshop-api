import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ description: 'Placa do veículo' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z]{3}-?\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/, {
    message: 'Placa deve estar no formato ABC-1234 ou ABC1D23 (Mercosul)',
  })
  plate!: string;

  @ApiProperty({ description: 'Modelo do veículo' })
  @IsNotEmpty()
  @IsString()
  model!: string;

  @ApiProperty({ description: 'Marca do veículo' })
  @IsNotEmpty()
  @IsString()
  brand!: string;

  @ApiProperty({ description: 'Ano do veículo' })
  @IsNotEmpty()
  @IsInt()
  year!: number;

  @ApiPropertyOptional({ description: 'Cor do veículo' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'ID do cliente proprietário' })
  @IsNotEmpty()
  @IsString()
  customerId!: string;

  @ApiPropertyOptional({ description: 'Observações sobre o veículo' })
  @IsOptional()
  @IsString()
  notes?: string;
}
