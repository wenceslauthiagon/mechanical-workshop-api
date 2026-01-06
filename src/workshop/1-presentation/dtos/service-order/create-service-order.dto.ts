import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsArray,
  ValidateNested,
  IsOptional,
  IsInt,
  Min,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ServiceItemDto {
  @ApiProperty({
    description: 'ID do serviço',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  serviceId!: string;

  @ApiProperty({
    description: 'Quantidade do serviço',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class PartItemDto {
  @ApiProperty({
    description: 'ID da peça',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  partId!: string;

  @ApiProperty({
    description: 'Quantidade da peça',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateServiceOrderDto {
  @ApiProperty({
    description: 'ID do cliente',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  customerId!: string;

  @ApiProperty({
    description: 'ID do veículo',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  vehicleId!: string;

  @ApiProperty({
    description: 'Descrição da ordem de serviço',
    example: 'Manutenção preventiva completa',
    minLength: 3,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 500)
  description!: string;

  @ApiPropertyOptional({
    description: 'Problema relatado pelo cliente',
    example: 'Veículo apresentando ruídos no motor',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  reportedIssue?: string;

  @ApiProperty({
    description: 'Lista de serviços a serem realizados',
    type: [ServiceItemDto],
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceItemDto)
  services!: ServiceItemDto[];

  @ApiProperty({
    description: 'Lista de peças a serem utilizadas',
    type: [PartItemDto],
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartItemDto)
  parts!: PartItemDto[];

  @ApiPropertyOptional({
    description: 'ID do mecânico responsável',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsUUID()
  mechanicId?: string;
}
