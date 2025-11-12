import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { CustomerType } from '@prisma/client';
import { VehicleService } from '../../../../src/workshop/2-application/services/vehicle.service';
import { IVehicleRepository } from '../../../../src/workshop/3-domain/repositories/vehicle-repository.interface';
import { ICustomerRepository } from '../../../../src/workshop/3-domain/repositories/customer-repository.interface';
import { ErrorHandlerService } from '../../../../src/shared/services/error-handler.service';
import { ERROR_MESSAGES } from '../../../../src/shared/constants/messages.constants';

describe('VehicleService', () => {
  let service: VehicleService;
  let vehicleRepository: jest.Mocked<IVehicleRepository>;
  let customerRepository: jest.Mocked<ICustomerRepository>;
  let errorHandler: jest.Mocked<ErrorHandlerService>;

  const createMockCustomer = () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: `11${faker.string.numeric(9)}`,
    address: faker.location.streetAddress(),
    document: faker.string.numeric(11),
    type: CustomerType.PESSOA_FISICA,
    additionalInfo: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  });

  const createMockVehicle = () => ({
    id: faker.string.uuid(),
    licensePlate: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`,
    customerId: faker.string.uuid(),
    brand: faker.vehicle.manufacturer(),
    model: faker.vehicle.model(),
    year: faker.number.int({ min: 2000, max: 2025 }),
    color: faker.color.human(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  });

  beforeEach(async () => {
    const mockVehicleRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findById: jest.fn(),
      findByCustomerId: jest.fn(),
      findByPlate: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      hasServiceOrders: jest.fn(),
    };

    const mockCustomerRepository = {
      findById: jest.fn(),
    };

    const mockErrorHandler = {
      handleNotFoundError: jest.fn(),
      handleConflictError: jest.fn(),
      generateException: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        { provide: 'IVehicleRepository', useValue: mockVehicleRepository },
        { provide: 'ICustomerRepository', useValue: mockCustomerRepository },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
    vehicleRepository = module.get('IVehicleRepository');
    customerRepository = module.get('ICustomerRepository');
    errorHandler = module.get(ErrorHandlerService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('TC0001 - Should create vehicle successfully', async () => {
      const createDto = {
        licensePlate: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`,
        customerId: faker.string.uuid(),
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        year: faker.number.int({ min: 2000, max: 2025 }),
        color: faker.color.human(),
      };

      const mockCustomer = createMockCustomer();
      const mockVehicle = { ...createDto, id: faker.string.uuid() };
      customerRepository.findById.mockResolvedValue(mockCustomer);
      vehicleRepository.findByPlate.mockResolvedValue(null);
      vehicleRepository.create.mockResolvedValue(mockVehicle as any);

      const result = await service.create(createDto);

      expect(customerRepository.findById).toHaveBeenCalledWith(
        createDto.customerId,
      );
      expect(vehicleRepository.findByPlate).toHaveBeenCalledWith(
        createDto.licensePlate,
      );
      expect(vehicleRepository.create).toHaveBeenCalledWith(createDto);
      expect(result.customer).toBeDefined();
      expect(result.customer?.id).toBe(mockCustomer.id);
    });

    it('TC0002 - Should throw error when customer not found', async () => {
      const createDto = {
        licensePlate: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`,
        customerId: faker.string.uuid(),
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        year: faker.number.int({ min: 2000, max: 2025 }),
        color: faker.color.human(),
      };

      customerRepository.findById.mockResolvedValue(null);
      errorHandler.generateException.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.CLIENT_NOT_FOUND);
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ERROR_MESSAGES.CLIENT_NOT_FOUND,
      );

      expect(errorHandler.generateException).toHaveBeenCalledWith(
        ERROR_MESSAGES.CLIENT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    });

    it('TC0003 - Should throw error when license plate already exists', async () => {
      const createDto = {
        licensePlate: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`,
        customerId: faker.string.uuid(),
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        year: faker.number.int({ min: 2000, max: 2025 }),
        color: faker.color.human(),
      };

      const mockCustomer = createMockCustomer();
      const existingVehicle = createMockVehicle();
      customerRepository.findById.mockResolvedValue(mockCustomer);
      vehicleRepository.findByPlate.mockResolvedValue(existingVehicle);
      errorHandler.generateException.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.LICENSE_PLATE_ALREADY_EXISTS);
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ERROR_MESSAGES.LICENSE_PLATE_ALREADY_EXISTS,
      );

      expect(errorHandler.generateException).toHaveBeenCalledWith(
        ERROR_MESSAGES.LICENSE_PLATE_ALREADY_EXISTS,
        HttpStatus.CONFLICT,
      );
    });
  });

  describe('findAll', () => {
    it('TC0001 - Should return all vehicles with customer data', async () => {
      const mockVehicles = [createMockVehicle(), createMockVehicle()];
      const mockCustomer = createMockCustomer();
      vehicleRepository.findAll.mockResolvedValue(mockVehicles);
      customerRepository.findById.mockResolvedValue(mockCustomer);

      const result = await service.findAll();

      expect(vehicleRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].customer).toBeDefined();
    });

    it('TC0002 - Should return vehicles with undefined customer when customer not found', async () => {
      const mockVehicles = [createMockVehicle()];
      vehicleRepository.findAll.mockResolvedValue(mockVehicles);
      customerRepository.findById.mockResolvedValue(null);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].customer).toBeUndefined();
    });
  });

  describe('findAllPaginated', () => {
    it('TC0001 - Should return paginated vehicles with customer data', async () => {
      const paginationDto = { page: 1, size: 10, skip: 0, take: 10 };
      const mockVehicles = [createMockVehicle(), createMockVehicle()];
      const mockCustomer = createMockCustomer();
      vehicleRepository.findMany.mockResolvedValue(mockVehicles);
      vehicleRepository.count.mockResolvedValue(2);
      customerRepository.findById.mockResolvedValue(mockCustomer);

      const result = await service.findAllPaginated(paginationDto);

      expect(result.data).toHaveLength(2);
      expect(result.pagination.totalRecords).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.data[0].customer).toBeDefined();
      expect(vehicleRepository.findMany).toHaveBeenCalledWith(0, 10);
      expect(vehicleRepository.count).toHaveBeenCalled();
    });

    it('TC0002 - Should return empty paginated result', async () => {
      const paginationDto = { page: 1, size: 10, skip: 0, take: 10 };
      vehicleRepository.findMany.mockResolvedValue([]);
      vehicleRepository.count.mockResolvedValue(0);

      const result = await service.findAllPaginated(paginationDto);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.totalRecords).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });

  describe('findById', () => {
    it('TC0001 - Should return vehicle by id with customer data', async () => {
      const mockVehicle = createMockVehicle();
      const mockCustomer = createMockCustomer();
      vehicleRepository.findById.mockResolvedValue(mockVehicle);
      customerRepository.findById.mockResolvedValue(mockCustomer);

      const result = await service.findById(mockVehicle.id);

      expect(vehicleRepository.findById).toHaveBeenCalledWith(mockVehicle.id);
      expect(result.id).toBe(mockVehicle.id);
      expect(result.customer?.id).toBe(mockCustomer.id);
    });

    it('TC0002 - Should throw error when vehicle not found', async () => {
      const vehicleId = faker.string.uuid();
      vehicleRepository.findById.mockResolvedValue(null);
      errorHandler.handleNotFoundError.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.VEHICLE_NOT_FOUND);
      });

      await expect(service.findById(vehicleId)).rejects.toThrow(
        ERROR_MESSAGES.VEHICLE_NOT_FOUND,
      );

      expect(errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        ERROR_MESSAGES.VEHICLE_NOT_FOUND,
      );
    });
  });

  describe('findByCustomerId', () => {
    it('TC0001 - Should return vehicles by customer id', async () => {
      const customerId = faker.string.uuid();
      const mockVehicles = [createMockVehicle(), createMockVehicle()];
      const mockCustomer = createMockCustomer();
      vehicleRepository.findByCustomerId.mockResolvedValue(mockVehicles);
      customerRepository.findById.mockResolvedValue(mockCustomer);

      const result = await service.findByCustomerId(customerId);

      expect(vehicleRepository.findByCustomerId).toHaveBeenCalledWith(
        customerId,
      );
      expect(result).toHaveLength(2);
      expect(result[0].customer?.id).toBe(mockCustomer.id);
    });
  });

  describe('findByLicensePlate', () => {
    it('TC0001 - Should return vehicle by license plate', async () => {
      const mockVehicle = createMockVehicle();
      const mockCustomer = createMockCustomer();
      vehicleRepository.findByPlate.mockResolvedValue(mockVehicle);
      customerRepository.findById.mockResolvedValue(mockCustomer);

      const result = await service.findByLicensePlate(mockVehicle.licensePlate);

      expect(vehicleRepository.findByPlate).toHaveBeenCalledWith(
        mockVehicle.licensePlate,
      );
      expect(result.licensePlate).toBe(mockVehicle.licensePlate);
      expect(result.customer?.id).toBe(mockCustomer.id);
    });

    it('TC0002 - Should throw error when vehicle not found', async () => {
      const licensePlate = `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`;
      vehicleRepository.findByPlate.mockResolvedValue(null);
      errorHandler.handleNotFoundError.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.VEHICLE_NOT_FOUND);
      });

      await expect(service.findByLicensePlate(licensePlate)).rejects.toThrow(
        ERROR_MESSAGES.VEHICLE_NOT_FOUND,
      );

      expect(errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        ERROR_MESSAGES.VEHICLE_NOT_FOUND,
      );
    });
  });

  describe('update', () => {
    it('TC0001 - Should update vehicle successfully', async () => {
      const vehicleId = faker.string.uuid();
      const updateDto = {
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
      };

      const mockVehicle = createMockVehicle();
      const mockCustomer = createMockCustomer();
      const updatedVehicle = { ...mockVehicle, ...updateDto };
      vehicleRepository.findById.mockResolvedValue(mockVehicle);
      vehicleRepository.update.mockResolvedValue(updatedVehicle);
      customerRepository.findById.mockResolvedValue(mockCustomer);

      const result = await service.update(vehicleId, updateDto);

      expect(vehicleRepository.findById).toHaveBeenCalledWith(vehicleId);
      expect(vehicleRepository.update).toHaveBeenCalledWith(
        vehicleId,
        updateDto,
      );
      expect(result.brand).toBe(updateDto.brand);
    });

    it('TC0002 - Should throw error when vehicle not found', async () => {
      const vehicleId = faker.string.uuid();
      const updateDto = { brand: faker.vehicle.manufacturer() };

      vehicleRepository.findById.mockResolvedValue(null);
      errorHandler.handleNotFoundError.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.VEHICLE_NOT_FOUND);
      });

      await expect(service.update(vehicleId, updateDto)).rejects.toThrow(
        ERROR_MESSAGES.VEHICLE_NOT_FOUND,
      );

      expect(errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        ERROR_MESSAGES.VEHICLE_NOT_FOUND,
      );
    });

    it('TC0003 - Should throw error when new customer not found', async () => {
      const vehicleId = faker.string.uuid();
      const newCustomerId = faker.string.uuid();
      const updateDto = { customerId: newCustomerId };

      const mockVehicle = createMockVehicle();
      vehicleRepository.findById.mockResolvedValue(mockVehicle);
      customerRepository.findById.mockResolvedValue(null);
      errorHandler.handleNotFoundError.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.CLIENT_NOT_FOUND);
      });

      await expect(service.update(vehicleId, updateDto)).rejects.toThrow(
        ERROR_MESSAGES.CLIENT_NOT_FOUND,
      );

      expect(errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        ERROR_MESSAGES.CLIENT_NOT_FOUND,
      );
    });

    it('TC0004 - Should throw error when new license plate already exists', async () => {
      const vehicleId = faker.string.uuid();
      const newPlate = `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`;
      const updateDto = { licensePlate: newPlate };

      const mockVehicle = createMockVehicle();
      const conflictVehicle = createMockVehicle();
      vehicleRepository.findById.mockResolvedValue(mockVehicle);
      vehicleRepository.findByPlate.mockResolvedValue(conflictVehicle);
      errorHandler.handleConflictError.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.LICENSE_PLATE_ALREADY_EXISTS);
      });

      await expect(service.update(vehicleId, updateDto)).rejects.toThrow(
        ERROR_MESSAGES.LICENSE_PLATE_ALREADY_EXISTS,
      );

      expect(errorHandler.handleConflictError).toHaveBeenCalledWith(
        ERROR_MESSAGES.LICENSE_PLATE_ALREADY_EXISTS,
      );
    });
  });

  describe('remove', () => {
    it('TC0001 - Should remove vehicle successfully', async () => {
      const vehicleId = faker.string.uuid();
      const mockVehicle = createMockVehicle();
      vehicleRepository.findById.mockResolvedValue(mockVehicle);
      vehicleRepository.hasServiceOrders.mockResolvedValue(false);
      vehicleRepository.delete.mockResolvedValue(undefined);

      await service.remove(vehicleId);

      expect(vehicleRepository.findById).toHaveBeenCalledWith(vehicleId);
      expect(vehicleRepository.hasServiceOrders).toHaveBeenCalledWith(
        vehicleId,
      );
      expect(vehicleRepository.delete).toHaveBeenCalledWith(vehicleId);
    });

    it('TC0002 - Should throw error when vehicle not found', async () => {
      const vehicleId = faker.string.uuid();
      vehicleRepository.findById.mockResolvedValue(null);
      errorHandler.handleNotFoundError.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.VEHICLE_NOT_FOUND);
      });

      await expect(service.remove(vehicleId)).rejects.toThrow(
        ERROR_MESSAGES.VEHICLE_NOT_FOUND,
      );

      expect(errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        ERROR_MESSAGES.VEHICLE_NOT_FOUND,
      );
    });

    it('TC0003 - Should throw error when vehicle has service orders', async () => {
      const vehicleId = faker.string.uuid();
      const mockVehicle = createMockVehicle();
      vehicleRepository.findById.mockResolvedValue(mockVehicle);
      vehicleRepository.hasServiceOrders.mockResolvedValue(true);
      errorHandler.handleConflictError.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.VEHICLE_HAS_SERVICE_ORDERS);
      });

      await expect(service.remove(vehicleId)).rejects.toThrow(
        ERROR_MESSAGES.VEHICLE_HAS_SERVICE_ORDERS,
      );

      expect(errorHandler.handleConflictError).toHaveBeenCalledWith(
        ERROR_MESSAGES.VEHICLE_HAS_SERVICE_ORDERS,
      );
    });
  });
});
