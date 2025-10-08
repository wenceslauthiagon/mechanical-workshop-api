import { Injectable } from '@nestjs/common';
import { Customer } from '../../../domain/entities';
import type { CustomerRepository } from '../../../domain/repositories';
import {
  CreateCustomerDto,
  CustomerResponseDto,
} from '../../dtos/customer.dto';

@Injectable()
export class CreateCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(
    createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    // Validar documento
    if (
      !Customer.isValidDocument(
        createCustomerDto.document,
        createCustomerDto.type,
      )
    ) {
      throw new Error('Invalid document format');
    }

    // Verificar se cliente já existe
    const existingCustomer = await this.customerRepository.findByDocument(
      createCustomerDto.document,
    );
    if (existingCustomer) {
      throw new Error('Customer with this document already exists');
    }

    // Criar novo cliente
    const customer = new Customer(
      createCustomerDto.document,
      createCustomerDto.type,
      createCustomerDto.name,
      createCustomerDto.email,
      createCustomerDto.phone,
      createCustomerDto.address,
    );

    const savedCustomer = await this.customerRepository.save(customer);

    return this.mapToResponseDto(savedCustomer);
  }

  private mapToResponseDto(customer: Customer): CustomerResponseDto {
    return {
      id: customer.id,
      document: customer.document,
      type: customer.type,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
