import { faker } from '@faker-js/faker/locale/pt_BR';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { CustomerType } from '@prisma/client';

import { CustomerController } from '../../../../src/workshop/1-presentation/controllers/customer.controller';
import { CustomerService } from '../../../../src/workshop/2-application/services/customer.service';
import { CreateCustomerDto } from '../../../../src/workshop/1-presentation/dtos/customer/create-customer.dto';
import { UpdateCustomerDto } from '../../../../src/workshop/1-presentation/dtos/customer/update-customer.dto';
import { CustomerResponseDto } from '../../../../src/workshop/1-presentation/dtos/customer/customer-response.dto';

describe('CustomerController', () => {
  let customerController: CustomerController;
  let customerService: jest.Mocked<CustomerService>;

  const mockCustomerId = uuidv4();
  const mockDocument = '12345678901';

  const mockCustomerData = {
    id: mockCustomerId,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    type: CustomerType.PESSOA_FISICA,
    document: mockDocument,
    additionalInfo: faker.lorem.sentence(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    vehicles: [
      {
        id: uuidv4(),
        licensePlate: 'ABC-1234',
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        year: faker.date.past().getFullYear(),
        color: faker.vehicle.color(),
      },
    ],
  };

  const mockCreateCustomerDto: CreateCustomerDto = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    type: CustomerType.PESSOA_FISICA,
    document: '98765432100',
    additionalInfo: faker.lorem.sentence(),
  };

  const mockUpdateCustomerDto: UpdateCustomerDto = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    additionalInfo: faker.lorem.sentence(),
  };

  const mockCustomerResponseDto: CustomerResponseDto = {
    id: mockCustomerData.id,
    name: mockCustomerData.name,
    email: mockCustomerData.email,
    phone: mockCustomerData.phone,
    address: mockCustomerData.address,
    type: mockCustomerData.type,
    document: mockCustomerData.document,
    additionalInfo: mockCustomerData.additionalInfo,
    createdAt: mockCustomerData.createdAt,
    updatedAt: mockCustomerData.updatedAt,
    vehicles: mockCustomerData.vehicles,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CustomerService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findAllPaginated: jest.fn(),
            findByDocument: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    customerController = module.get<CustomerController>(CustomerController);
    customerService = module.get(CustomerService);
  });

  it('Should be defined', () => {
    expect(customerController).toBeDefined();
    expect(customerController).toBeInstanceOf(CustomerController);
    expect(customerService).toBeDefined();
  });

  it('Should instantiate controller with service dependency', () => {
    const mockService = {} as CustomerService;
    const testController = new CustomerController(mockService);
    expect(testController).toBeInstanceOf(CustomerController);
  });

  describe('create', () => {
    it('TC0001 - Should create a customer successfully', async () => {
      customerService.create.mockResolvedValue(mockCustomerData);

      const result = await customerController.create(mockCreateCustomerDto);

      expect(customerService.create).toHaveBeenCalledWith(
        mockCreateCustomerDto,
      );
      expect(result).toEqual(mockCustomerResponseDto);
    });

    it('TC0002 - Should throw error when creating customer fails', async () => {
      const mockError = new Error('Falha ao criar cliente');
      customerService.create.mockRejectedValue(mockError);

      await expect(
        customerController.create(mockCreateCustomerDto),
      ).rejects.toThrow(mockError);
      expect(customerService.create).toHaveBeenCalledWith(
        mockCreateCustomerDto,
      );
    });

    it('TC0003 - Should handle invalid customer data', async () => {
      const invalidData = { ...mockCreateCustomerDto, email: 'invalid-email' };
      const mockError = new Error('Email inválido');
      customerService.create.mockRejectedValue(mockError);

      await expect(customerController.create(invalidData)).rejects.toThrow(
        mockError,
      );
      expect(customerService.create).toHaveBeenCalledWith(invalidData);
    });
  });

  describe('findAll', () => {
    it('TC0001 - Should return all customers successfully', async () => {
      const mockCustomers = [mockCustomerData];
      customerService.findAll.mockResolvedValue(mockCustomers);

      const result = await customerController.findAll();

      expect(customerService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockCustomerResponseDto]);
    });

    it('TC0002 - Should return empty array when no customers found', async () => {
      customerService.findAll.mockResolvedValue([]);

      const result = await customerController.findAll();

      expect(customerService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('TC0003 - Should throw error when findAll fails', async () => {
      const mockError = new Error('Falha ao listar clientes');
      customerService.findAll.mockRejectedValue(mockError);

      await expect(customerController.findAll()).rejects.toThrow(mockError);
      expect(customerService.findAll).toHaveBeenCalled();
    });
  });

  describe('findAllPaginated', () => {
    it('TC0001 - Should return paginated customers', async () => {
      const mockCustomers = [mockCustomerData];
      const paginationDto = { page: 0, size: 10 };
      const mockPaginatedResult = {
        data: mockCustomers,
        pagination: { page: 0, totalPages: 1, totalRecords: 1 },
      };

      customerService.findAllPaginated.mockResolvedValue(mockPaginatedResult);

      const result = await customerController.findAllPaginated(
        paginationDto as any,
      );

      expect(customerService.findAllPaginated).toHaveBeenCalledWith(
        paginationDto,
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(mockCustomerResponseDto);
      expect(result.pagination.totalRecords).toBe(1);
    });

    it('TC0002 - Should return empty paginated result', async () => {
      const paginationDto = { page: 0, size: 10 };
      const mockPaginatedResult = {
        data: [],
        pagination: { page: 0, totalPages: 0, totalRecords: 0 },
      };

      customerService.findAllPaginated.mockResolvedValue(mockPaginatedResult);

      const result = await customerController.findAllPaginated(
        paginationDto as any,
      );

      expect(customerService.findAllPaginated).toHaveBeenCalledWith(
        paginationDto,
      );
      expect(result.data).toHaveLength(0);
      expect(result.pagination.totalRecords).toBe(0);
    });
  });

  describe('findByDocument', () => {
    it('TC0001 - Should find customer by document successfully', async () => {
      customerService.findByDocument.mockResolvedValue(mockCustomerData);

      const result = await customerController.findByDocument(mockDocument);

      expect(customerService.findByDocument).toHaveBeenCalledWith(mockDocument);
      expect(result).toEqual(mockCustomerResponseDto);
    });

    it('TC0002 - Should throw error when customer not found by document', async () => {
      const mockError = new Error('Cliente não encontrado');
      customerService.findByDocument.mockRejectedValue(mockError);

      await expect(
        customerController.findByDocument(mockDocument),
      ).rejects.toThrow(mockError);
      expect(customerService.findByDocument).toHaveBeenCalledWith(mockDocument);
    });

    it('TC0003 - Should handle invalid document format', async () => {
      const invalidDocument = 'invalid-doc';
      const mockError = new Error('Documento inválido');
      customerService.findByDocument.mockRejectedValue(mockError);

      await expect(
        customerController.findByDocument(invalidDocument),
      ).rejects.toThrow(mockError);
      expect(customerService.findByDocument).toHaveBeenCalledWith(
        invalidDocument,
      );
    });
  });

  describe('findOne', () => {
    it('TC0001 - Should find customer by ID successfully', async () => {
      customerService.findById.mockResolvedValue(mockCustomerData);

      const result = await customerController.findOne(mockCustomerId);

      expect(customerService.findById).toHaveBeenCalledWith(mockCustomerId);
      expect(result).toEqual(mockCustomerResponseDto);
    });

    it('TC0002 - Should throw error when customer not found by ID', async () => {
      const mockError = new Error('Cliente não encontrado');
      customerService.findById.mockRejectedValue(mockError);

      await expect(customerController.findOne(mockCustomerId)).rejects.toThrow(
        mockError,
      );
      expect(customerService.findById).toHaveBeenCalledWith(mockCustomerId);
    });

    it('TC0003 - Should handle invalid UUID format', async () => {
      const invalidId = 'invalid-uuid';
      const mockError = new Error('ID inválido');
      customerService.findById.mockRejectedValue(mockError);

      await expect(customerController.findOne(invalidId)).rejects.toThrow(
        mockError,
      );
      expect(customerService.findById).toHaveBeenCalledWith(invalidId);
    });
  });

  describe('update', () => {
    it('TC0001 - Should update customer successfully', async () => {
      const updatedCustomer = { ...mockCustomerData, ...mockUpdateCustomerDto };
      customerService.update.mockResolvedValue(updatedCustomer);

      const result = await customerController.update(
        mockCustomerId,
        mockUpdateCustomerDto,
      );

      expect(customerService.update).toHaveBeenCalledWith(
        mockCustomerId,
        mockUpdateCustomerDto,
      );
      expect(result).toEqual({
        ...mockCustomerResponseDto,
        ...mockUpdateCustomerDto,
      });
    });

    it('TC0002 - Should throw error when customer not found for update', async () => {
      const mockError = new Error('Cliente não encontrado');
      customerService.update.mockRejectedValue(mockError);

      await expect(
        customerController.update(mockCustomerId, mockUpdateCustomerDto),
      ).rejects.toThrow(mockError);
      expect(customerService.update).toHaveBeenCalledWith(
        mockCustomerId,
        mockUpdateCustomerDto,
      );
    });

    it('TC0003 - Should handle duplicate email error during update', async () => {
      const mockError = new Error('Email já cadastrado');
      customerService.update.mockRejectedValue(mockError);

      await expect(
        customerController.update(mockCustomerId, mockUpdateCustomerDto),
      ).rejects.toThrow(mockError);
      expect(customerService.update).toHaveBeenCalledWith(
        mockCustomerId,
        mockUpdateCustomerDto,
      );
    });
  });

  describe('remove', () => {
    it('TC0001 - Should remove customer successfully', async () => {
      customerService.remove.mockResolvedValue();

      await customerController.remove(mockCustomerId);

      expect(customerService.remove).toHaveBeenCalledWith(mockCustomerId);
    });

    it('TC0002 - Should throw error when customer not found for removal', async () => {
      const mockError = new Error('Cliente não encontrado');
      customerService.remove.mockRejectedValue(mockError);

      await expect(customerController.remove(mockCustomerId)).rejects.toThrow(
        mockError,
      );
      expect(customerService.remove).toHaveBeenCalledWith(mockCustomerId);
    });

    it('TC0003 - Should handle conflict when customer has vehicles', async () => {
      const mockError = new Error('Cliente possui veículos cadastrados');
      customerService.remove.mockRejectedValue(mockError);

      await expect(customerController.remove(mockCustomerId)).rejects.toThrow(
        mockError,
      );
      expect(customerService.remove).toHaveBeenCalledWith(mockCustomerId);
    });
  });

  describe('mapToResponseDto', () => {
    it('TC0001 - Should map customer data to response DTO correctly', async () => {
      customerService.findById.mockResolvedValue(mockCustomerData);

      const result = await customerController.findOne(mockCustomerId);

      expect(result).toEqual(mockCustomerResponseDto);
      expect(result.vehicles).toHaveLength(1);
      expect(result.vehicles?.[0]).toEqual(mockCustomerData.vehicles[0]);
    });

    it('TC0002 - Should handle customer without vehicles', async () => {
      const customerWithoutVehicles = {
        ...mockCustomerData,
        vehicles: undefined,
      };
      customerService.findById.mockResolvedValue(customerWithoutVehicles);

      const result = await customerController.findOne(mockCustomerId);

      expect(result.vehicles).toBeUndefined();
    });

    it('TC0003 - Should throw error when customer not found', async () => {
      const error = new Error('Customer not found');
      customerService.findById.mockRejectedValue(error);

      await expect(customerController.findOne('invalid-id')).rejects.toThrow(
        error,
      );
    });
  });
});
