import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsInt,
  Min,
  IsOptional,
  Length,
  IsBoolean,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({
    description: 'Nome do serviço',
    example: 'Troca de óleo',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    description: 'Descrição detalhada do serviço',
    example: 'Troca de óleo motor com filtro incluso',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({
    description: 'Preço do serviço em reais',
    example: 89.9,
    type: 'number',
    format: 'decimal',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Preço deve ter até 2 casas decimais' },
  )
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'Tempo estimado em minutos',
    example: 45,
    minimum: 1,
    maximum: 1440,
  })
  @IsInt()
  @Min(1)
  estimatedMinutes: number;

  @ApiProperty({
    description: 'Categoria do serviço',
    example: 'Manutenção Preventiva',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  category: string;

  @ApiProperty({
    description: 'Se o serviço está ativo',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
