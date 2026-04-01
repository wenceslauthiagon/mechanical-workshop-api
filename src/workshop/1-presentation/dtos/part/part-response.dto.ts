import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PartResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  partNumber!: string;

  @ApiProperty({ type: Number })
  price!: number;

  @ApiProperty()
  stock!: number;

  @ApiProperty()
  minStock!: number;

  @ApiPropertyOptional()
  supplier?: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
