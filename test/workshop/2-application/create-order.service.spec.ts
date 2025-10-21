import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { CustomerType } from '@prisma/client';
import { CreateOrderService } from '../../../src/workshop/2-application/create-order.service';
import { ErrorHandlerService } from '../../../src/shared/services/error-handler.service';
import { CreateCustomerDto } from '../../../src/workshop/1-presentation/dtos/customer/create-customer.dto';
import { UpdateCustomerDto } from '../../../src/workshop/1-presentation/dtos/customer/update-customer.dto';
import { ERROR_MESSAGES } from '../../../src/shared/constants/messages.constants';

const mockCustomer = {
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  address: faker.location.streetAddress(),
  type: CustomerType.PESSOA_FISICA,
  document: faker.string.numeric(11),
  additionalInfo: faker.lorem.sentence(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
};

describe('CreateOrderService', () => {
  let service: CreateOrderService;
  let customerRepository: any;
  let errorHandler: any;

  beforeEach(async () => {
    customerRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByDocument: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    errorHandler = {
      handleConflictError: jest.fn().mockImplementation((msg) => {
        throw new Error(msg);
      }),
      handleNotFoundError: jest.fn().mockImplementation((msg) => {
        throw new Error(msg);
      }),
      generateException: jest.fn().mockImplementation((msg) => {
        throw new Error(msg);
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderService,
        { provide: 'ICustomerRepository', useValue: customerRepository },
        { provide: ErrorHandlerService, useValue: errorHandler },
      ],
    }).compile();
    service = module.get<CreateOrderService>(CreateOrderService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateCustomerDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      type: CustomerType.PESSOA_FISICA,
      document: faker.string.numeric(11),
      additionalInfo: faker.lorem.sentence(),
    };

    it('TC0001 - Should create customer successfully', async () => {
      customerRepository.findByEmail.mockResolvedValue(null);
      customerRepository.findByDocument.mockResolvedValue(null);
      customerRepository.create.mockResolvedValue(mockCustomer);
      const result = await service.create(createDto);
      expect(result).toEqual(mockCustomer);
      expect(customerRepository.create).toHaveBeenCalledWith({
        ...createDto,
        additionalInfo: createDto.additionalInfo,
      });
    });

    it('TC0002 - Should throw error if email already exists', async () => {
      customerRepository.findByEmail.mockResolvedValue(mockCustomer);
      await expect(service.create(createDto)).rejects.toThrow(
        ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
      );
    });

    it('TC0003 - Should throw error if document already exists', async () => {
      customerRepository.findByEmail.mockResolvedValue(null);
      customerRepository.findByDocument.mockResolvedValue(mockCustomer);
      await expect(service.create(createDto)).rejects.toThrow(
        ERROR_MESSAGES.DOCUMENT_ALREADY_EXISTS,
      );
    });

    it('TC0004 - Should throw error if repository throws', async () => {
      customerRepository.findByEmail.mockResolvedValue(null);
      customerRepository.findByDocument.mockResolvedValue(null);
      customerRepository.create.mockRejectedValue(new Error('DB error'));
      await expect(service.create(createDto)).rejects.toThrow(
        ERROR_MESSAGES.CLIENT_CREATE_ERROR,
      );
      expect(errorHandler.generateException).toHaveBeenCalled();
    });

    it('TC0005 - Should handle create with null additionalInfo', async () => {
      const dtoWithoutInfo = { ...createDto, additionalInfo: undefined };
      customerRepository.findByEmail.mockResolvedValue(null);
      customerRepository.findByDocument.mockResolvedValue(null);
      customerRepository.create.mockResolvedValue(mockCustomer);
      const result = await service.create(dtoWithoutInfo);
      expect(result).toEqual(mockCustomer);
      expect(customerRepository.create).toHaveBeenCalledWith({
        ...dtoWithoutInfo,
        additionalInfo: null,
      });
    });
  });

  describe('findAll', () => {
    it('TC0001 - Should return all customers', async () => {
      customerRepository.findAll.mockResolvedValue([mockCustomer]);
      const result = await service.findAll();
      expect(result).toEqual([mockCustomer]);
    });
  });

  describe('findOne', () => {
    it('TC0001 - Should return customer by id', async () => {
      customerRepository.findById.mockResolvedValue(mockCustomer);
      const result = await service.findOne(mockCustomer.id);
      expect(result).toEqual(mockCustomer);
    });
    it('TC0002 - Should throw error if not found', async () => {
      customerRepository.findById.mockResolvedValue(null);
      await expect(service.findOne(mockCustomer.id)).rejects.toThrow(
        ERROR_MESSAGES.CLIENT_NOT_FOUND,
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateCustomerDto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      additionalInfo: faker.lorem.sentence(),
    };
    it('TC0001 - Should update customer successfully', async () => {
      customerRepository.findById.mockResolvedValue(mockCustomer);
      customerRepository.findByEmail.mockResolvedValue(null);
      customerRepository.findByDocument.mockResolvedValue(null);
      customerRepository.update.mockResolvedValue({
        ...mockCustomer,
        ...updateDto,
      });
      const result = await service.update(mockCustomer.id, updateDto);
      expect(result).toEqual({ ...mockCustomer, ...updateDto });
    });
    it('TC0002 - Should throw error if customer not found', async () => {
      customerRepository.findById.mockResolvedValue(null);
      await expect(service.update(mockCustomer.id, updateDto)).rejects.toThrow(
        ERROR_MESSAGES.CLIENT_NOT_FOUND,
      );
    });
    it('TC0003 - Should throw error if email already exists', async () => {
      customerRepository.findById.mockResolvedValue(mockCustomer);
      customerRepository.findByEmail.mockResolvedValue({
        ...mockCustomer,
        id: 'other-id',
      });
      await expect(
        service.update(mockCustomer.id, {
          ...updateDto,
          email: 'other@email.com',
        }),
      ).rejects.toThrow(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    });
    it('TC0004 - Should throw error if document already exists', async () => {
      customerRepository.findById.mockResolvedValue(mockCustomer);
      customerRepository.findByEmail.mockResolvedValue(null);
      customerRepository.findByDocument.mockResolvedValue({
        ...mockCustomer,
        id: 'other-id',
      });
      await expect(
        service.update(mockCustomer.id, {
          ...updateDto,
          document: '99999999999',
        }),
      ).rejects.toThrow(ERROR_MESSAGES.DOCUMENT_ALREADY_EXISTS);
    });
    it('TC0005 - Should throw error if repository throws', async () => {
      customerRepository.findById.mockResolvedValue(mockCustomer);
      customerRepository.findByEmail.mockResolvedValue(null);
      customerRepository.findByDocument.mockResolvedValue(null);
      customerRepository.update.mockRejectedValue(new Error('DB error'));
      await expect(service.update(mockCustomer.id, updateDto)).rejects.toThrow(
        ERROR_MESSAGES.CLIENT_UPDATE_ERROR,
      );
      expect(errorHandler.generateException).toHaveBeenCalled();
    });

    it('TC0006 - Should handle update with null additionalInfo', async () => {
      const dtoWithoutInfo = { ...updateDto, additionalInfo: undefined };
      customerRepository.findById.mockResolvedValue(mockCustomer);
      customerRepository.findByEmail.mockResolvedValue(null);
      customerRepository.findByDocument.mockResolvedValue(null);
      customerRepository.update.mockResolvedValue({
        ...mockCustomer,
        ...dtoWithoutInfo,
      });
      const result = await service.update(mockCustomer.id, dtoWithoutInfo);
      expect(result).toBeDefined();
      expect(customerRepository.update).toHaveBeenCalledWith(mockCustomer.id, {
        ...dtoWithoutInfo,
        additionalInfo: null,
      });
    });

    it('TC0007 - Should allow updating with same email', async () => {
      customerRepository.findById.mockResolvedValue(mockCustomer);
      const sameEmailDto = { ...updateDto, email: mockCustomer.email };
      customerRepository.update.mockResolvedValue({
        ...mockCustomer,
        ...sameEmailDto,
      });
      const result = await service.update(mockCustomer.id, sameEmailDto);
      expect(result).toBeDefined();
      expect(customerRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('TC0008 - Should allow updating with same document', async () => {
      customerRepository.findById.mockResolvedValue(mockCustomer);
      const sameDocDto = { ...updateDto, document: mockCustomer.document };
      customerRepository.update.mockResolvedValue({
        ...mockCustomer,
        ...sameDocDto,
      });
      const result = await service.update(mockCustomer.id, sameDocDto);
      expect(result).toBeDefined();
      expect(customerRepository.findByDocument).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('TC0001 - Should remove customer successfully', async () => {
      customerRepository.findById.mockResolvedValue(mockCustomer);
      customerRepository.delete.mockResolvedValue(undefined);
      await expect(service.remove(mockCustomer.id)).resolves.toBeUndefined();
    });
    it('TC0002 - Should throw error if customer not found', async () => {
      customerRepository.findById.mockResolvedValue(null);
      await expect(service.remove(mockCustomer.id)).rejects.toThrow(
        ERROR_MESSAGES.CLIENT_NOT_FOUND,
      );
    });
    it('TC0003 - Should throw error if repository throws', async () => {
      customerRepository.findById.mockResolvedValue(mockCustomer);
      customerRepository.delete.mockRejectedValue(new Error('DB error'));
      await expect(service.remove(mockCustomer.id)).rejects.toThrow(
        ERROR_MESSAGES.CLIENT_DELETE_ERROR,
      );
      expect(errorHandler.generateException).toHaveBeenCalled();
    });
  });
});
