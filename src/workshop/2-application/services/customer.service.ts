import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Customer } from '@prisma/client';
import { CustomerRepository } from '../../4-infrastructure/repositories/customer.repository';
import { CreateCustomerDto } from '../../1-presentation/dtos/customer/create-customer.dto';
import { UpdateCustomerDto } from '../../1-presentation/dtos/customer/update-customer.dto';
import { ERROR_MESSAGES } from '../../../shared/constants/messages.constants';

@Injectable()
export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async create(data: CreateCustomerDto): Promise<Customer> {
    const existingEmailCustomer = await this.customerRepository.findByEmail(
      data.email,
    );
    if (existingEmailCustomer) {
      throw new ConflictException(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const existingDocumentCustomer =
      await this.customerRepository.findByDocument(data.document);
    if (existingDocumentCustomer) {
      throw new ConflictException(ERROR_MESSAGES.DOCUMENT_ALREADY_EXISTS);
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
      throw new NotFoundException(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }
    return customer;
  }

  async findByDocument(document: string): Promise<Customer> {
    const customer = await this.customerRepository.findByDocument(document);
    if (!customer) {
      throw new NotFoundException(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }
    return customer;
  }

  async findByEmail(email: string): Promise<Customer> {
    const customer = await this.customerRepository.findByEmail(email);
    if (!customer) {
      throw new NotFoundException(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }
    return customer;
  }

  async update(id: string, data: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }

    if (data.email && data.email !== customer.email) {
      const existingCustomer = await this.customerRepository.findByEmail(
        data.email,
      );
      if (existingCustomer) {
        throw new ConflictException(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
      }
    }

    if (data.document && data.document !== customer.document) {
      const existingCustomer = await this.customerRepository.findByDocument(
        data.document,
      );
      if (existingCustomer) {
        throw new ConflictException(ERROR_MESSAGES.DOCUMENT_ALREADY_EXISTS);
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
      throw new NotFoundException(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }

    const vehicles = await this.customerRepository.findVehiclesByCustomerId(id);
    if (vehicles.length > 0) {
      throw new ConflictException(ERROR_MESSAGES.CLIENT_HAS_VEHICLES);
    }

    await this.customerRepository.delete(id);
  }
}
