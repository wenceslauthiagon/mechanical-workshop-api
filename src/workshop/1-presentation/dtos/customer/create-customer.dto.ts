import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomerType } from '@prisma/client';

export class CreateCustomerDto {
  @ApiProperty({ description: 'Nome do cliente' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email do cliente' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Telefone do cliente' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Endereço do cliente' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    enum: CustomerType,
    description: 'Tipo do cliente (PESSOA_FISICA ou PESSOA_JURIDICA)',
  })
  @IsNotEmpty()
  @IsEnum(CustomerType)
  type: CustomerType;

  @ApiProperty({
    description: 'CPF ou CNPJ do cliente',
    example: '123.456.789-10',
  })
  @IsNotEmpty()
  @IsString()
  document: string;

  @ApiPropertyOptional({ description: 'Informações adicionais' })
  @IsOptional()
  @IsString()
  additionalInfo?: string | null;
}
