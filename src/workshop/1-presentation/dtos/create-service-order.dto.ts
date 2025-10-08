import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  IsInt,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ServiceOrderItemDto {
  @ApiProperty({ description: 'ID do serviço' })
  @IsNotEmpty()
  @IsString()
  serviceId: string;

  @ApiProperty({ description: 'Quantidade do serviço', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quantity: number;
}

export class ServiceOrderPartDto {
  @ApiProperty({ description: 'ID da peça' })
  @IsNotEmpty()
  @IsString()
  partId: string;

  @ApiProperty({ description: 'Quantidade da peça', example: 2 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateServiceOrderDto {
  @ApiProperty({ description: 'ID do cliente' })
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @ApiProperty({ description: 'ID do veículo' })
  @IsNotEmpty()
  @IsString()
  vehicleId: string;

  @ApiPropertyOptional({ description: 'Descrição do problema' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({
    description: 'Serviços solicitados',
    type: [ServiceOrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceOrderItemDto)
  services: ServiceOrderItemDto[];

  @ApiPropertyOptional({
    description: 'Peças necessárias',
    type: [ServiceOrderPartDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceOrderPartDto)
  parts?: ServiceOrderPartDto[];
}
