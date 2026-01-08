import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ServiceOrderStatus } from '../../../../shared/enums';

export class UpdateServiceOrderStatusDto {
  @ApiProperty({
    description: 'Novo status da ordem de serviço',
    enum: ServiceOrderStatus,
    example: ServiceOrderStatus.IN_DIAGNOSIS,
  })
  @IsEnum(ServiceOrderStatus)
  status!: string; // Changed to string for SQLite compatibility

  @ApiProperty({
    description: 'ID do mecânico responsável (opcional, usado ao iniciar execução)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  mechanicId?: string;

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
