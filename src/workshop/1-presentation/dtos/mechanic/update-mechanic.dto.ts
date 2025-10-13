import { PartialType } from '@nestjs/swagger';
import { CreateMechanicDto } from './create-mechanic.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMechanicDto extends PartialType(CreateMechanicDto) {
  @ApiPropertyOptional({
    description: 'Se o mecânico está ativo no sistema',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Se o mecânico está disponível para novos serviços',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
