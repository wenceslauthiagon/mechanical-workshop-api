import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ServiceOrderStatus } from '@prisma/client';

export class UpdateServiceOrderStatusDto {
  @ApiProperty({
    description: 'Novo status da ordem de serviço',
    enum: ServiceOrderStatus,
    example: ServiceOrderStatus.EM_DIAGNOSTICO,
  })
  @IsEnum(ServiceOrderStatus)
  status: ServiceOrderStatus;

  @ApiProperty({
    description: 'Observações sobre a mudança de status',
    example:
      'Diagnóstico concluído, problemas identificados no sistema de freios',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
