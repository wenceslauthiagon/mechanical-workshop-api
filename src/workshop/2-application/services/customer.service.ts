import { Injectable, Inject } from '@nestjs/common';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { Customer } from '@prisma/client';
import type { ICustomerRepository } from '../../3-domain/repositories/customer-repository.interface';
import { CreateCustomerDto } from '../../1-presentation/dtos/customer/create-customer.dto';
import { UpdateCustomerDto } from '../../1-presentation/dtos/customer/update-customer.dto';
import { ERROR_MESSAGES } from '../../../shared/constants/messages.constants';
import { DocumentUtils } from '../../../shared/utils/document.utils';
import { PaginationDto, PaginatedResponseDto } from '../../../shared';

@Injectable()
export class CustomerService {
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(data: CreateCustomerDto): Promise<Customer> {
    let normalizedDocument: string;
    try {
      normalizedDocument = DocumentUtils.validateAndNormalize(data.document);
    } catch (error) {
      this.errorHandler.handleValueObjectError(
        error,
        ERROR_MESSAGES.INVALID_DOCUMENT,
      );
    }

    const existingEmailCustomer = await this.customerRepository.findByEmail(
      data.email,
    );
    if (existingEmailCustomer) {
      this.errorHandler.handleConflictError(
        ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
      );
    }

    const existingDocumentCustomer =
      await this.customerRepository.findByDocument(normalizedDocument);
    if (existingDocumentCustomer) {
      this.errorHandler.handleConflictError(
        ERROR_MESSAGES.DOCUMENT_ALREADY_EXISTS,
      );
    }

    const customerData = {
      ...data,
      document: normalizedDocument,
      additionalInfo: data.additionalInfo ?? null,
    };

    return this.customerRepository.create(customerData);
  }

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }

  async findAllPaginated(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Customer>> {
    const { skip, take, page = 0, size = 10 } = paginationDto;

    const [customers, total] = await Promise.all([
      this.customerRepository.findMany(skip, take),
      this.customerRepository.count(),
    ]);

    return new PaginatedResponseDto(customers, page, size, total);
  }

  async findById(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }
    return customer;
  }

  async findByDocument(document: string): Promise<Customer> {
    const normalizedDocument = DocumentUtils.normalize(document);
    const customer =
      await this.customerRepository.findByDocument(normalizedDocument);
    if (!customer) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }
    return customer;
  }

  async findByEmail(email: string): Promise<Customer> {
    const customer = await this.customerRepository.findByEmail(email);
    if (!customer) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }
    return customer;
  }

  async update(id: string, data: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }

    if (data.email && data.email !== customer.email) {
      const existingCustomer = await this.customerRepository.findByEmail(
        data.email,
      );
      if (existingCustomer) {
        this.errorHandler.handleConflictError(
          ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
        );
      }
    }

    if (data.document && data.document !== customer.document) {
      let normalizedDocument: string;
      try {
        normalizedDocument = DocumentUtils.validateAndNormalize(data.document);
      } catch (error) {
        this.errorHandler.handleValueObjectError(
          error,
          ERROR_MESSAGES.INVALID_DOCUMENT,
        );
      }
      const existingCustomer =
        await this.customerRepository.findByDocument(normalizedDocument);
      if (existingCustomer) {
        this.errorHandler.handleConflictError(
          ERROR_MESSAGES.DOCUMENT_ALREADY_EXISTS,
        );
      }
    }

    let normalizedDocumentForUpdate: string | undefined;
    if (data.document) {
      try {
        normalizedDocumentForUpdate = DocumentUtils.validateAndNormalize(
          data.document,
        );
      } catch (error) {
        this.errorHandler.handleValueObjectError(
          error,
          ERROR_MESSAGES.INVALID_DOCUMENT,
        );
      }
    }

    const customerData = {
      ...data,
      document: normalizedDocumentForUpdate,
      additionalInfo: data.additionalInfo ?? null,
    };

    return this.customerRepository.update(id, customerData);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      this.errorHandler.handleNotFoundError(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }

    const vehicles = await this.customerRepository.findVehiclesByCustomerId(id);
    if (vehicles.length > 0) {
      this.errorHandler.handleConflictError(ERROR_MESSAGES.CLIENT_HAS_VEHICLES);
    }

    await this.customerRepository.delete(id);
  }
}
