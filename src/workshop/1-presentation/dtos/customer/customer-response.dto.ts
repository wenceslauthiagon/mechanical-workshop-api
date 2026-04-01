import { ApiProperty } from '@nestjs/swagger';
import { CustomerType } from '../../../../shared/enums/customer-type.enum';

export class CustomerResponseDto {
  @ApiProperty({ description: 'ID do cliente' })
  id!: string;

  @ApiProperty({ description: 'Nome do cliente' })
  name!: string;

  @ApiProperty({ description: 'Email do cliente' })
  email!: string;

  @ApiProperty({ description: 'Telefone do cliente' })
  phone!: string;

  @ApiProperty({ description: 'Endereço do cliente' })
  address!: string;

  @ApiProperty({
    enum: CustomerType,
    description: 'Tipo do cliente (PESSOA_FISICA ou PESSOA_JURIDICA)',
  })
  type!: CustomerType;

  @ApiProperty({ description: 'CPF ou CNPJ do cliente' })
  document!: string;

  @ApiProperty({ description: 'Informações adicionais' })
  additionalInfo!: string | null;

  @ApiProperty({ description: 'Data de criação' })
  createdAt!: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Veículos do cliente',
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        licensePlate: { type: 'string' },
        brand: { type: 'string' },
        model: { type: 'string' },
        year: { type: 'number' },
        color: { type: 'string' },
      },
    },
  })
  vehicles?: {
    id: string;
    licensePlate: string;
    brand: string;
    model: string;
    year: number;
    color: string;
  }[];
}
