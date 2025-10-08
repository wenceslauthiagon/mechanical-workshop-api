import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Customer } from '@prisma/client';
import { CustomerRepository } from '../../4-infrastructure/repositories/customer.repository';
import { CreateCustomerDto } from '../../1-presentation/dtos/customer/create-customer.dto';
import { UpdateCustomerDto } from '../../1-presentation/dtos/customer/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async create(data: CreateCustomerDto): Promise<Customer> {
    // Verificar se email já existe
    const existingEmailCustomer = await this.customerRepository.findByEmail(
      data.email,
    );
    if (existingEmailCustomer) {
      throw new ConflictException('Email já cadastrado no sistema');
    }

    // Verificar se documento (CPF/CNPJ) já existe
    const existingDocumentCustomer =
      await this.customerRepository.findByDocument(data.document);
    if (existingDocumentCustomer) {
      throw new ConflictException('CPF/CNPJ já cadastrado no sistema');
    }

    const customerData = {
      ...data,
      additionalInfo: data.additionalInfo ?? null,
    };

    return this.customerRepository.create(customerData);
  }

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }

  async findById(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return customer;
  }

  async findByDocument(document: string): Promise<Customer> {
    const customer = await this.customerRepository.findByDocument(document);
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return customer;
  }

  async findByEmail(email: string): Promise<Customer> {
    const customer = await this.customerRepository.findByEmail(email);
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return customer;
  }

  async update(id: string, data: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Se está mudando o email, verificar se não existe
    if (data.email && data.email !== customer.email) {
      const existingCustomer = await this.customerRepository.findByEmail(
        data.email,
      );
      if (existingCustomer) {
        throw new ConflictException('Email já cadastrado no sistema');
      }
    }

    // Se está mudando o documento, verificar se não existe
    if (data.document && data.document !== customer.document) {
      const existingCustomer = await this.customerRepository.findByDocument(
        data.document,
      );
      if (existingCustomer) {
        throw new ConflictException('CPF/CNPJ já cadastrado no sistema');
      }
    }

    const customerData = {
      ...data,
      additionalInfo: data.additionalInfo ?? null,
    };

    return this.customerRepository.update(id, customerData);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Verificar se cliente tem veículos
    const vehicles = await this.customerRepository.findVehiclesByCustomerId(id);
    if (vehicles.length > 0) {
      throw new ConflictException(
        'Não é possível remover cliente com veículos cadastrados',
      );
    }

    await this.customerRepository.delete(id);
  }
}
