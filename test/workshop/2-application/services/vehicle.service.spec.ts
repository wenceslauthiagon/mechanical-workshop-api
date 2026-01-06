import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { VehicleService } from '../../../../src/workshop/2-application/services/vehicle.service';
import { IVehicleRepository } from '../../../../src/workshop/3-domain/repositories/vehicle-repository.interface';
import { ICustomerRepository } from '../../../../src/workshop/3-domain/repositories/customer-repository.interface';
import { ErrorHandlerService } from '../../../../src/shared/services/error-handler.service';
import { ERROR_MESSAGES } from '../../../../src/shared/constants/messages.constants';
import { CustomerType } from '../../../../src/shared/enums/customer-type.enum';

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
    plate: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`,
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
    vehicleRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findById: jest.fn(),
      findByPlate: jest.fn(),
      findByCustomerId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      hasServiceOrders: jest.fn(),
    } as any;

    customerRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    errorHandler = {
      handleNotFoundError: jest.fn().mockImplementation((msg) => {
        throw new Error(msg);
      }),
      handleConflictError: jest.fn().mockImplementation((msg) => {
        throw new Error(msg);
      }),
      generateException: jest.fn().mockImplementation((message) => {
        throw new Error(message);
      }),
      handleError: jest.fn().mockImplementation((err) => {
        throw err;
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        {
          provide: 'IVehicleRepository',
          useValue: vehicleRepository,
        },
        {
          provide: 'ICustomerRepository',
          useValue: customerRepository,
        },
        {
          provide: ErrorHandlerService,
          useValue: errorHandler,
        },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
  });

  describe('create', () => {
    it('TC0001 - Should create vehicle successfully', async () => {
      const mockCustomer = createMockCustomer();
      const createDto = {
        customerId: mockCustomer.id,
        plate: 'ABC-1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        color: 'Preto',
      };
      const mockVehicle = createMockVehicle();
      customerRepository.findById.mockResolvedValue(mockCustomer);
      vehicleRepository.findByPlate.mockResolvedValue(null);
      vehicleRepository.create.mockResolvedValue(mockVehicle);

      const result = await service.create(createDto);

      expect(customerRepository.findById).toHaveBeenCalledWith(mockCustomer.id);
      expect(vehicleRepository.findByPlate).toHaveBeenCalledWith(createDto.plate);
      expect(vehicleRepository.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('TC0002 - Should throw error when customer not found', async () => {
      const createDto = {
        customerId: faker.string.uuid(),
        plate: 'ABC-1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
      };
      customerRepository.findById.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        ERROR_MESSAGES.CLIENT_NOT_FOUND,
      );
    });

    it('TC0003 - Should throw error for duplicate plate', async () => {
      const mockCustomer = createMockCustomer();
      const existingVehicle = createMockVehicle();
      const createDto = {
        customerId: mockCustomer.id,
        plate: 'ABC-1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
      };
      customerRepository.findById.mockResolvedValue(mockCustomer);
      vehicleRepository.findByPlate.mockResolvedValue(existingVehicle);

      await expect(service.create(createDto)).rejects.toThrow(
        ERROR_MESSAGES.LICENSE_PLATE_ALREADY_EXISTS,
      );
    });
  });

  describe('findAll', () => {
    it('TC0001 - Should return all vehicles', async () => {
      const mockVehicles = [createMockVehicle(), createMockVehicle()];
      const mockCustomer = createMockCustomer();
      vehicleRepository.findAll.mockResolvedValue(mockVehicles);
      customerRepository.findById.mockResolvedValue(mockCustomer);

      const result = await service.findAll();

      expect(vehicleRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });

  describe('findAllPaginated', () => {
    it('TC0001 - Should return paginated vehicles', async () => {
      const paginationDto = { page: 0, size: 10, skip: 0, take: 10 };
      const mockVehicles = [createMockVehicle(), createMockVehicle()];
      const mockCustomer = createMockCustomer();
      vehicleRepository.findMany.mockResolvedValue(mockVehicles);
      vehicleRepository.count.mockResolvedValue(2);
      customerRepository.findById.mockResolvedValue(mockCustomer);

      const result = await service.findAllPaginated(paginationDto);

      expect(vehicleRepository.findMany).toHaveBeenCalledWith(0, 10);
      expect(vehicleRepository.count).toHaveBeenCalled();
      expect(result.data).toHaveLength(2);
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
      expect(result.customerId).toBe(mockVehicle.customerId);
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
      const mockVehicles = [
        { ...createMockVehicle(), customerId },
        { ...createMockVehicle(), customerId },
      ];
      const mockCustomer = createMockCustomer();
      vehicleRepository.findByCustomerId.mockResolvedValue(mockVehicles);
      customerRepository.findById.mockResolvedValue(mockCustomer);

      const result = await service.findByCustomerId(customerId);

      expect(vehicleRepository.findByCustomerId).toHaveBeenCalledWith(
        customerId,
      );
      expect(result).toHaveLength(2);
      expect(result[0].customerId).toBe(customerId);
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
      expect(result.plate).toBe(mockVehicle.licensePlate);
      expect(result.customerId).toBe(mockVehicle.customerId);
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
      const updateDto = { plate: newPlate };

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

