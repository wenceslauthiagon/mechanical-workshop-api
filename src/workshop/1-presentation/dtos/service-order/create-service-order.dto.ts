import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceOrderItemDto {
  @ApiProperty({
    description: 'ID do serviço',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({
    description: 'Quantidade do serviço',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateServiceOrderPartDto {
  @ApiProperty({
    description: 'ID da peça',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  partId: string;

  @ApiProperty({
    description: 'Quantidade da peça',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateServiceOrderDto {
  @ApiProperty({
    description: 'ID do cliente',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({
    description: 'ID do veículo',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  vehicleId: string;

  @ApiProperty({
    description: 'Descrição dos problemas ou serviços solicitados',
    example: 'Troca de óleo e filtro, verificação de freios',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Lista de serviços a serem executados',
    type: [CreateServiceOrderItemDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceOrderItemDto)
  services?: CreateServiceOrderItemDto[];

  @ApiProperty({
    description: 'Lista de peças necessárias',
    type: [CreateServiceOrderPartDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceOrderPartDto)
  parts?: CreateServiceOrderPartDto[];
}
