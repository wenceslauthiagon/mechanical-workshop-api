import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Customer } from '@prisma/client';
import { CustomerRepository } from '../../4-infrastructure/repositories/customer.repository';
import { CreateCustomerDto } from '../../1-presentation/dtos/customer/create-customer.dto';
import { UpdateCustomerDto } from '../../1-presentation/dtos/customer/update-customer.dto';
import { ERROR_MESSAGES } from '../../../shared/constants/messages.constants';
import { DocumentUtils } from '../../../shared/utils/document.utils';

@Injectable()
export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async create(data: CreateCustomerDto): Promise<Customer> {
    let normalizedDocument: string;
    try {
      normalizedDocument = DocumentUtils.validateAndNormalize(data.document);
    } catch {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_DOCUMENT);
    }

    const existingEmailCustomer = await this.customerRepository.findByEmail(
      data.email,
    );
    if (existingEmailCustomer) {
      throw new ConflictException(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const existingDocumentCustomer =
      await this.customerRepository.findByDocument(normalizedDocument);
    if (existingDocumentCustomer) {
      throw new ConflictException(ERROR_MESSAGES.DOCUMENT_ALREADY_EXISTS);
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

  async findById(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }
    return customer;
  }

  async findByDocument(document: string): Promise<Customer> {
    const normalizedDocument = DocumentUtils.normalize(document);
    const customer =
      await this.customerRepository.findByDocument(normalizedDocument);
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
      let normalizedDocument: string;
      try {
        normalizedDocument = DocumentUtils.validateAndNormalize(data.document);
      } catch {
        throw new BadRequestException(ERROR_MESSAGES.INVALID_DOCUMENT);
      }
      const existingCustomer =
        await this.customerRepository.findByDocument(normalizedDocument);
      if (existingCustomer) {
        throw new ConflictException(ERROR_MESSAGES.DOCUMENT_ALREADY_EXISTS);
      }
    }

    let normalizedDocumentForUpdate: string | undefined;
    if (data.document) {
      try {
        normalizedDocumentForUpdate = DocumentUtils.validateAndNormalize(
          data.document,
        );
      } catch {
        throw new BadRequestException(ERROR_MESSAGES.INVALID_DOCUMENT);
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
      throw new NotFoundException(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }

    const vehicles = await this.customerRepository.findVehiclesByCustomerId(id);
    if (vehicles.length > 0) {
      throw new ConflictException(ERROR_MESSAGES.CLIENT_HAS_VEHICLES);
    }

    await this.customerRepository.delete(id);
  }
}
