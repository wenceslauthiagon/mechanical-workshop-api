import {
  IsString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CustomerType } from '../../shared/enums';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'CPF or CNPJ document',
    example: '12345678901',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{11}$|^[0-9]{14}$/, {
    message: 'Document must be a valid CPF (11 digits) or CNPJ (14 digits)',
  })
  document: string;

  @ApiProperty({
    description: 'Customer type',
    enum: CustomerType,
    example: CustomerType.INDIVIDUAL,
  })
  @IsEnum(CustomerType)
  type: CustomerType;

  @ApiProperty({
    description: 'Customer name',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'joao@email.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Customer phone',
    example: '11999999999',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10,11}$/, {
    message: 'Phone must be 10 or 11 digits',
  })
  phone: string;

  @ApiProperty({
    description: 'Customer address',
    example: 'Rua das Flores, 123 - São Paulo, SP',
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 500)
  address: string;
}

export class UpdateCustomerDto {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export class CustomerResponseDto {
  id: string;
  document: string;
  type: CustomerType;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}
