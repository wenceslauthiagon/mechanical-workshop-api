import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Customer } from '@prisma/client';
import { CustomerRepository } from '../4-infrastructure/repositories/customer.repository';
import { CreateCustomerDto, UpdateCustomerDto } from '../1-presentation/dtos';
import { ERROR_MESSAGES } from '../../shared/constants/messages.constants';

@Injectable()
export class CreateOrderService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // Verificar se email já existe
    const existingByEmail = await this.customerRepository.findByEmail(
      createCustomerDto.email,
    );
    if (existingByEmail) {
      throw new ConflictException(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    // Verificar se documento já existe
    const existingByDocument = await this.customerRepository.findByDocument(
      createCustomerDto.document,
    );
    if (existingByDocument) {
      throw new ConflictException(ERROR_MESSAGES.DOCUMENT_ALREADY_EXISTS);
    }

    try {
      const customerData = {
        ...createCustomerDto,
        additionalInfo: createCustomerDto.additionalInfo ?? null,
      };
      return await this.customerRepository.create(customerData);
    } catch {
      throw new BadRequestException(ERROR_MESSAGES.CLIENT_CREATE_ERROR);
    }
  }

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }
    return customer;
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const existingCustomer = await this.customerRepository.findById(id);
    if (!existingCustomer) {
      throw new NotFoundException(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }

    // Verificar conflitos de email (apenas se o email está sendo alterado)
    if (
      updateCustomerDto.email &&
      updateCustomerDto.email !== existingCustomer.email
    ) {
      const existingByEmail = await this.customerRepository.findByEmail(
        updateCustomerDto.email,
      );
      if (existingByEmail) {
        throw new ConflictException(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
      }
    }

    // Verificar conflitos de documento (apenas se o documento está sendo alterado)
    if (
      updateCustomerDto.document &&
      updateCustomerDto.document !== existingCustomer.document
    ) {
      const existingByDocument = await this.customerRepository.findByDocument(
        updateCustomerDto.document,
      );
      if (existingByDocument) {
        throw new ConflictException(ERROR_MESSAGES.DOCUMENT_ALREADY_EXISTS);
      }
    }

    try {
      const updateData = {
        ...updateCustomerDto,
        additionalInfo: updateCustomerDto.additionalInfo ?? null,
      };
      return await this.customerRepository.update(id, updateData);
    } catch {
      throw new BadRequestException(ERROR_MESSAGES.CLIENT_UPDATE_ERROR);
    }
  }

  async remove(id: string): Promise<void> {
    const existingCustomer = await this.customerRepository.findById(id);
    if (!existingCustomer) {
      throw new NotFoundException(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }

    try {
      await this.customerRepository.delete(id);
    } catch {
      throw new BadRequestException(ERROR_MESSAGES.CLIENT_DELETE_ERROR);
    }
  }
}
