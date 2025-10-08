import { ApiProperty } from '@nestjs/swagger';

export class PartResponseDto {
  @ApiProperty({ description: 'ID da peça' })
  id: string;

  @ApiProperty({ description: 'Nome da peça' })
  name: string;

  @ApiProperty({ description: 'Descrição da peça' })
  description: string | null;

  @ApiProperty({ description: 'Número da peça' })
  partNumber: string | null;

  @ApiProperty({ description: 'Preço da peça' })
  price: string;

  @ApiProperty({ description: 'Quantidade em estoque' })
  stock: number;

  @ApiProperty({ description: 'Estoque mínimo' })
  minStock: number;

  @ApiProperty({ description: 'Fornecedor' })
  supplier: string | null;

  @ApiProperty({ description: 'Status ativo/inativo' })
  isActive: boolean;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}
