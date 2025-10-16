import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateServiceDto } from './create-service.dto';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  @ApiProperty({
    description: 'Nome do serviço',
    example: 'Troca de óleo',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'Descrição detalhada do serviço',
    example: 'Troca de óleo motor com filtro incluso',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Preço do serviço em reais',
    example: 89.9,
    required: false,
  })
  price?: number;

  @ApiProperty({
    description: 'Tempo estimado em minutos',
    example: 45,
    required: false,
  })
  estimatedMinutes?: number;

  @ApiProperty({
    description: 'Categoria do serviço',
    example: 'Manutenção Preventiva',
    required: false,
  })
  category?: string;

  @ApiProperty({
    description: 'Se o serviço está ativo',
    example: true,
    required: false,
  })
  isActive?: boolean;
}
