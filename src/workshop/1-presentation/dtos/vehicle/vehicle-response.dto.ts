import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VehicleResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  plate!: string;

  @ApiProperty()
  model!: string;

  @ApiProperty()
  brand!: string;

  @ApiProperty()
  year!: number;

  @ApiPropertyOptional()
  color?: string;

  @ApiProperty()
  customerId!: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
