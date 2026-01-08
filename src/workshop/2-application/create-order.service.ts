import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { Customer } from '@prisma/client';
import type { ICustomerRepository } from '../3-domain/repositories/customer-repository.interface';
import { CreateCustomerDto, UpdateCustomerDto } from '../1-presentation/dtos';
import { ERROR_MESSAGES } from '../../shared/constants/messages.constants';
import { ErrorHandlerService } from '../../shared/services/error-handler.service';

@Injectable()
export class CreateOrderService {
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const existingByEmail = await this.customerRepository.findByEmail(
      createCustomerDto.email,
    );
    if (existingByEmail) {
      this.errorHandler.handleConflictError(
        ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
      );
    }

    const existingByDocument = await this.customerRepository.findByDocument(
      createCustomerDto.document,
    );
    if (existingByDocument) {
      this.errorHandler.handleConflictError(
        ERROR_MESSAGES.DOCUMENT_ALREADY_EXISTS,
      );
    }

    try {
      const customerData = {
        ...createCustomerDto,
        additionalInfo: createCustomerDto.additionalInfo ?? null,
      };
      return await this.customerRepository.create(customerData);
    } catch {
      this.errorHandler.generateException(
        ERROR_MESSAGES.CLIENT_CREATE_ERROR,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }
    return customer;
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const existingCustomer = await this.customerRepository.findById(id);
    if (!existingCustomer) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }

    if (
      updateCustomerDto.email &&
      updateCustomerDto.email !== existingCustomer.email
    ) {
      const existingByEmail = await this.customerRepository.findByEmail(
        updateCustomerDto.email,
      );
      if (existingByEmail) {
        this.errorHandler.handleConflictError(
          ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
        );
      }
    }

    if (
      updateCustomerDto.document &&
      updateCustomerDto.document !== existingCustomer.document
    ) {
      const existingByDocument = await this.customerRepository.findByDocument(
        updateCustomerDto.document,
      );
      if (existingByDocument) {
        this.errorHandler.handleConflictError(
          ERROR_MESSAGES.DOCUMENT_ALREADY_EXISTS,
        );
      }
    }

    try {
      const updateData = {
        ...updateCustomerDto,
        additionalInfo: updateCustomerDto.additionalInfo ?? null,
      };
      return await this.customerRepository.update(id, updateData);
    } catch {
      this.errorHandler.generateException(
        ERROR_MESSAGES.CLIENT_UPDATE_ERROR,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string): Promise<void> {
    const existingCustomer = await this.customerRepository.findById(id);
    if (!existingCustomer) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }

    try {
      await this.customerRepository.delete(id);
    } catch {
      this.errorHandler.generateException(
        ERROR_MESSAGES.CLIENT_DELETE_ERROR,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
