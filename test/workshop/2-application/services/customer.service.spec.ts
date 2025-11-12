import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { CustomerType } from '@prisma/client';
import { CustomerService } from '../../../../src/workshop/2-application/services/customer.service';
import { ErrorHandlerService } from '../../../../src/shared/services/error-handler.service';
import { ERROR_MESSAGES } from '../../../../src/shared/constants/messages.constants';
import { DocumentUtils } from '../../../../src/shared/utils/document.utils';

describe('CustomerService', () => {
  let service: CustomerService;
  let customerRepository: any;
  let errorHandler: any;

  const mockCustomer = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    document: '12345678901',
    email: faker.internet.email(),
    phone: faker.phone.number(),
    type: CustomerType.PESSOA_FISICA,
    address: faker.location.streetAddress(),
    additionalInfo: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const mockVehicle = {
    id: faker.string.uuid(),
    customerId: mockCustomer.id,
    licensePlate: 'ABC-1234',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    color: 'Preto',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const createCustomerDto = {
    name: faker.person.fullName(),
    document: '12345678901',
    email: faker.internet.email(),
    phone: faker.phone.number(),
    type: CustomerType.PESSOA_FISICA,
    address: faker.location.streetAddress(),
    additionalInfo: null,
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByDocument: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findVehiclesByCustomerId: jest.fn(),
    };

    const mockErrorHandler = {
      handleError: jest.fn().mockImplementation((error) => {
        throw error;
      }),
      handleNotFoundError: jest.fn().mockImplementation((message) => {
        throw new Error(message);
      }),
      handleConflictError: jest.fn().mockImplementation((message) => {
        throw new Error(message);
      }),
      handleValueObjectError: jest.fn().mockImplementation((error, message) => {
        throw new Error(message);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        { provide: 'ICustomerRepository', useValue: mockRepository },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    customerRepository = module.get('ICustomerRepository');
    errorHandler = module.get(ErrorHandlerService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      customerRepository.findByEmail.mockResolvedValue(null);
      customerRepository.findByDocument.mockResolvedValue(null);
      customerRepository.create.mockResolvedValue(mockCustomer);
      jest
        .spyOn(DocumentUtils, 'validateAndNormalize')
        .mockReturnValue('12345678901');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('TC0001 - Should create customer successfully', async () => {
      const result = await service.create(createCustomerDto);

      expect(result).toEqual(mockCustomer);
      expect(DocumentUtils.validateAndNormalize).toHaveBeenCalledWith(
        createCustomerDto.document,
      );
      expect(customerRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          document: '12345678901',
          additionalInfo: null,
        }),
      );
    });

    it('TC0002 - Should create customer with additionalInfo', async () => {
      const dtoWithInfo = {
        ...createCustomerDto,
        additionalInfo: 'VIP Cliente',
      };
      const customerWithInfo = {
        ...mockCustomer,
        additionalInfo: 'VIP Cliente',
      };
      customerRepository.create.mockResolvedValue(customerWithInfo);

      const result = await service.create(dtoWithInfo);

      expect(result.additionalInfo).toBe('VIP Cliente');
      expect(customerRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          additionalInfo: 'VIP Cliente',
        }),
      );
    });

    it('TC0003 - Should throw error when document is invalid', async () => {
      jest
        .spyOn(DocumentUtils, 'validateAndNormalize')
        .mockImplementation(() => {
          throw new Error('Invalid document');
        });

      await expect(service.create(createCustomerDto)).rejects.toThrow(
        ERROR_MESSAGES.INVALID_DOCUMENT,
      );
      expect(errorHandler.handleValueObjectError).toHaveBeenCalledWith(
        expect.any(Error),
        ERROR_MESSAGES.INVALID_DOCUMENT,
      );
    });

    it('TC0004 - Should throw error when email already exists', async () => {
      const existingCustomer = {
        ...mockCustomer,
        email: createCustomerDto.email,
      };
      customerRepository.findByEmail.mockResolvedValue(existingCustomer);

      await expect(service.create(createCustomerDto)).rejects.toThrow(
        ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
      );
      expect(errorHandler.handleConflictError).toHaveBeenCalledWith(
        ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
      );
    });

    it('TC0005 - Should throw error when document already exists', async () => {
      const existingCustomer = {
        ...mockCustomer,
        document: createCustomerDto.document,
      };
      customerRepository.findByDocument.mockResolvedValue(existingCustomer);

      await expect(service.create(createCustomerDto)).rejects.toThrow(
        ERROR_MESSAGES.DOCUMENT_ALREADY_EXISTS,
      );
      expect(errorHandler.handleConflictError).toHaveBeenCalledWith(
        ERROR_MESSAGES.DOCUMENT_ALREADY_EXISTS,
      );
    });
  });

  describe('findAll', () => {
    it('TC0001 - Should return all customers', async () => {
      const customers = [mockCustomer];
      customerRepository.findAll.mockResolvedValue(customers);

      const result = await service.findAll();

      expect(result).toEqual(customers);
      expect(customerRepository.findAll).toHaveBeenCalled();
    });

    it('TC0002 - Should return empty array when no customers exist', async () => {
      customerRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findAllPaginated', () => {
    it('TC0001 - Should return paginated customers', async () => {
      const customers = [mockCustomer];
      const paginationDto = { page: 0, size: 10, skip: 0, take: 10 };
      customerRepository.findMany.mockResolvedValue(customers);
      customerRepository.count.mockResolvedValue(1);

      const result = await service.findAllPaginated(paginationDto);

      expect(customerRepository.findMany).toHaveBeenCalledWith(0, 10);
      expect(customerRepository.count).toHaveBeenCalled();
      expect(result.data).toEqual(customers);
      expect(result.pagination.totalRecords).toBe(1);
      expect(result.pagination.page).toBe(0);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('TC0002 - Should return empty paginated result', async () => {
      const paginationDto = { page: 0, size: 10, skip: 0, take: 10 };
      customerRepository.findMany.mockResolvedValue([]);
      customerRepository.count.mockResolvedValue(0);

      const result = await service.findAllPaginated(paginationDto);

      expect(result.data).toEqual([]);
      expect(result.pagination.totalRecords).toBe(0);
    });
  });

  describe('findById', () => {
    it('TC0001 - Should return customer by id', async () => {
      customerRepository.findById.mockResolvedValue(mockCustomer);

      const result = await service.findById(mockCustomer.id);

      expect(result).toEqual(mockCustomer);
      expect(customerRepository.findById).toHaveBeenCalledWith(mockCustomer.id);
    });

    it('TC0002 - Should throw error when customer not found', async () => {
      customerRepository.findById.mockResolvedValue(null);

      await expect(service.findById('invalid-id')).rejects.toThrow(
        ERROR_MESSAGES.CLIENT_NOT_FOUND,
      );
      expect(errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        ERROR_MESSAGES.CLIENT_NOT_FOUND,
      );
    });
  });

  describe('findByDocument', () => {
    beforeEach(() => {
      jest.spyOn(DocumentUtils, 'normalize').mockReturnValue('12345678901');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('TC0001 - Should return customer by document', async () => {
      customerRepository.findByDocument.mockResolvedValue(mockCustomer);

      const result = await service.findByDocument('123.456.789-01');

      expect(result).toEqual(mockCustomer);
      expect(DocumentUtils.normalize).toHaveBeenCalledWith('123.456.789-01');
      expect(customerRepository.findByDocument).toHaveBeenCalledWith(
        '12345678901',
      );
    });

    it('TC0002 - Should throw error when customer not found', async () => {
      customerRepository.findByDocument.mockResolvedValue(null);

      await expect(service.findByDocument('123.456.789-01')).rejects.toThrow(
        ERROR_MESSAGES.CLIENT_NOT_FOUND,
      );
      expect(errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        ERROR_MESSAGES.CLIENT_NOT_FOUND,
      );
    });
  });

  describe('findByEmail', () => {
    it('TC0001 - Should return customer by email', async () => {
      customerRepository.findByEmail.mockResolvedValue(mockCustomer);

      const result = await service.findByEmail(mockCustomer.email);

      expect(result).toEqual(mockCustomer);
      expect(customerRepository.findByEmail).toHaveBeenCalledWith(
        mockCustomer.email,
      );
    });

    it('TC0002 - Should throw error when customer not found', async () => {
      customerRepository.findByEmail.mockResolvedValue(null);

      await expect(service.findByEmail('notfound@example.com')).rejects.toThrow(
        ERROR_MESSAGES.CLIENT_NOT_FOUND,
      );
      expect(errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        ERROR_MESSAGES.CLIENT_NOT_FOUND,
      );
    });
  });

  describe('update', () => {
    const updateCustomerDto = {
      name: 'Nome Atualizado',
      phone: '11999999999',
    };

    beforeEach(() => {
      customerRepository.findById.mockResolvedValue(mockCustomer);
      customerRepository.update.mockResolvedValue({
        ...mockCustomer,
        ...updateCustomerDto,
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('TC0001 - Should update customer successfully', async () => {
      const result = await service.update(mockCustomer.id, updateCustomerDto);

      expect(result.name).toBe(updateCustomerDto.name);
      expect(customerRepository.update).toHaveBeenCalledWith(
        mockCustomer.id,
        expect.objectContaining({
          name: updateCustomerDto.name,
          phone: updateCustomerDto.phone,
        }),
      );
    });

    it('TC0002 - Should throw error when customer not found', async () => {
      customerRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', updateCustomerDto),
      ).rejects.toThrow(ERROR_MESSAGES.CLIENT_NOT_FOUND);
      expect(errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        ERROR_MESSAGES.CLIENT_NOT_FOUND,
      );
    });

    it('TC0003 - Should update email when new email is different', async () => {
      const dtoWithEmail = { ...updateCustomerDto, email: 'novo@email.com' };
      customerRepository.findByEmail.mockResolvedValue(null);

      await service.update(mockCustomer.id, dtoWithEmail);

      expect(customerRepository.findByEmail).toHaveBeenCalledWith(
        'novo@email.com',
      );
      expect(customerRepository.update).toHaveBeenCalled();
    });

    it('TC0004 - Should throw error when new email already exists', async () => {
      const dtoWithEmail = {
        ...updateCustomerDto,
        email: 'existente@email.com',
      };
      const existingCustomer = {
        ...mockCustomer,
        id: 'another-id',
        email: 'existente@email.com',
      };
      customerRepository.findByEmail.mockResolvedValue(existingCustomer);

      await expect(
        service.update(mockCustomer.id, dtoWithEmail),
      ).rejects.toThrow(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
      expect(errorHandler.handleConflictError).toHaveBeenCalledWith(
        ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
      );
    });

    it('TC0005 - Should not check email when it is the same', async () => {
      const dtoWithSameEmail = {
        ...updateCustomerDto,
        email: mockCustomer.email,
      };

      await service.update(mockCustomer.id, dtoWithSameEmail);

      expect(customerRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('TC0006 - Should update document when new document is different', async () => {
      const dtoWithDocument = { ...updateCustomerDto, document: '98765432100' };
      jest
        .spyOn(DocumentUtils, 'validateAndNormalize')
        .mockReturnValue('98765432100');
      customerRepository.findByDocument.mockResolvedValue(null);

      await service.update(mockCustomer.id, dtoWithDocument);

      expect(DocumentUtils.validateAndNormalize).toHaveBeenCalledWith(
        '98765432100',
      );
      expect(customerRepository.findByDocument).toHaveBeenCalledWith(
        '98765432100',
      );
      expect(customerRepository.update).toHaveBeenCalledWith(
        mockCustomer.id,
        expect.objectContaining({
          document: '98765432100',
        }),
      );
    });

    it('TC0007 - Should throw error when new document is invalid', async () => {
      const dtoWithDocument = { ...updateCustomerDto, document: 'invalid' };
      jest
        .spyOn(DocumentUtils, 'validateAndNormalize')
        .mockImplementation(() => {
          throw new Error('Invalid document');
        });

      await expect(
        service.update(mockCustomer.id, dtoWithDocument),
      ).rejects.toThrow(ERROR_MESSAGES.INVALID_DOCUMENT);
      expect(errorHandler.handleValueObjectError).toHaveBeenCalledWith(
        expect.any(Error),
        ERROR_MESSAGES.INVALID_DOCUMENT,
      );
    });

    it('TC0008 - Should throw error when new document already exists', async () => {
      const dtoWithDocument = { ...updateCustomerDto, document: '98765432100' };
      const existingCustomer = {
        ...mockCustomer,
        id: 'another-id',
        document: '98765432100',
      };
      jest
        .spyOn(DocumentUtils, 'validateAndNormalize')
        .mockReturnValue('98765432100');
      customerRepository.findByDocument.mockResolvedValue(existingCustomer);

      await expect(
        service.update(mockCustomer.id, dtoWithDocument),
      ).rejects.toThrow(ERROR_MESSAGES.DOCUMENT_ALREADY_EXISTS);
      expect(errorHandler.handleConflictError).toHaveBeenCalledWith(
        ERROR_MESSAGES.DOCUMENT_ALREADY_EXISTS,
      );
    });

    it('TC0009 - Should not check document when it is the same', async () => {
      const dtoWithSameDocument = {
        ...updateCustomerDto,
        document: mockCustomer.document,
      };
      jest
        .spyOn(DocumentUtils, 'validateAndNormalize')
        .mockReturnValue(mockCustomer.document);

      await service.update(mockCustomer.id, dtoWithSameDocument);

      expect(customerRepository.findByDocument).not.toHaveBeenCalled();
    });

    it('TC0010 - Should throw error when validating document for update fails', async () => {
      const dtoWithDocument = { ...updateCustomerDto, document: 'invalid' };
      customerRepository.findByDocument.mockResolvedValue(null);

      // First call succeeds (for checking if different), second call fails (for normalization)
      jest
        .spyOn(DocumentUtils, 'validateAndNormalize')
        .mockReturnValueOnce('invalid')
        .mockImplementationOnce(() => {
          throw new Error('Invalid document format');
        });

      await expect(
        service.update(mockCustomer.id, dtoWithDocument),
      ).rejects.toThrow(ERROR_MESSAGES.INVALID_DOCUMENT);
      expect(errorHandler.handleValueObjectError).toHaveBeenCalledWith(
        expect.any(Error),
        ERROR_MESSAGES.INVALID_DOCUMENT,
      );
    });

    it('TC0011 - Should set additionalInfo to null when not provided', async () => {
      const dtoWithoutInfo = { ...updateCustomerDto };

      await service.update(mockCustomer.id, dtoWithoutInfo);

      expect(customerRepository.update).toHaveBeenCalledWith(
        mockCustomer.id,
        expect.objectContaining({
          additionalInfo: null,
        }),
      );
    });

    it('TC0012 - Should update additionalInfo when provided', async () => {
      const dtoWithInfo = {
        ...updateCustomerDto,
        additionalInfo: 'Cliente Premium',
      };

      await service.update(mockCustomer.id, dtoWithInfo);

      expect(customerRepository.update).toHaveBeenCalledWith(
        mockCustomer.id,
        expect.objectContaining({
          additionalInfo: 'Cliente Premium',
        }),
      );
    });
  });

  describe('remove', () => {
    it('TC0001 - Should remove customer successfully', async () => {
      customerRepository.findById.mockResolvedValue(mockCustomer);
      customerRepository.findVehiclesByCustomerId.mockResolvedValue([]);

      await service.remove(mockCustomer.id);

      expect(customerRepository.delete).toHaveBeenCalledWith(mockCustomer.id);
    });

    it('TC0002 - Should throw error when customer not found', async () => {
      customerRepository.findById.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(
        ERROR_MESSAGES.CLIENT_NOT_FOUND,
      );
      expect(errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        ERROR_MESSAGES.CLIENT_NOT_FOUND,
      );
      expect(customerRepository.delete).not.toHaveBeenCalled();
    });

    it('TC0003 - Should throw error when customer has vehicles', async () => {
      customerRepository.findById.mockResolvedValue(mockCustomer);
      customerRepository.findVehiclesByCustomerId.mockResolvedValue([
        mockVehicle,
      ]);

      await expect(service.remove(mockCustomer.id)).rejects.toThrow(
        ERROR_MESSAGES.CLIENT_HAS_VEHICLES,
      );
      expect(errorHandler.handleConflictError).toHaveBeenCalledWith(
        ERROR_MESSAGES.CLIENT_HAS_VEHICLES,
      );
      expect(customerRepository.delete).not.toHaveBeenCalled();
    });

    it('TC0004 - Should check vehicles before deleting', async () => {
      customerRepository.findById.mockResolvedValue(mockCustomer);
      customerRepository.findVehiclesByCustomerId.mockResolvedValue([]);

      await service.remove(mockCustomer.id);

      expect(customerRepository.findVehiclesByCustomerId).toHaveBeenCalledWith(
        mockCustomer.id,
      );
      expect(customerRepository.delete).toHaveBeenCalledWith(mockCustomer.id);
    });
  });
});
