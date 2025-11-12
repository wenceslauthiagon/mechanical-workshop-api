import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { Decimal } from '@prisma/client/runtime/library';
import { ServiceService } from '../../../../src/workshop/2-application/services/service.service';
import { IServiceRepository } from '../../../../src/workshop/3-domain/repositories/service-repository.interface';
import { ErrorHandlerService } from '../../../../src/shared/services/error-handler.service';
import { ERROR_MESSAGES } from '../../../../src/shared/constants/messages.constants';

describe('ServiceService', () => {
  let service: ServiceService;
  let serviceRepository: jest.Mocked<IServiceRepository>;
  let errorHandler: jest.Mocked<ErrorHandlerService>;

  const createMockService = () => ({
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: new Decimal(faker.finance.amount({ min: 50, max: 500, dec: 2 })),
    category: faker.helpers.arrayElement([
      'Mecânica',
      'Elétrica',
      'Funilaria',
      'Pintura',
    ]),
    estimatedMinutes: faker.number.int({ min: 30, max: 480 }),
    isActive: true,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  });

  beforeEach(async () => {
    const mockServiceRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findByCategory: jest.fn(),
      update: jest.fn(),
    };

    const mockErrorHandler = {
      handleNotFoundError: jest.fn(),
      handleConflictError: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceService,
        { provide: 'IServiceRepository', useValue: mockServiceRepository },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
      ],
    }).compile();

    service = module.get<ServiceService>(ServiceService);
    serviceRepository = module.get('IServiceRepository');
    errorHandler = module.get(ErrorHandlerService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('TC0001 - Should create service successfully', async () => {
      const createDto = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.finance.amount({ min: 50, max: 500, dec: 2 })),
        category: 'Mecânica',
        estimatedMinutes: faker.number.int({ min: 30, max: 480 }),
        isActive: true,
      };

      const mockService = createMockService();
      serviceRepository.findByName.mockResolvedValue(null);
      serviceRepository.create.mockResolvedValue(mockService);

      const result = await service.create(createDto);

      expect(serviceRepository.findByName).toHaveBeenCalledWith(createDto.name);
      expect(serviceRepository.create).toHaveBeenCalledWith({
        name: createDto.name,
        description: createDto.description,
        price: new Decimal(createDto.price),
        category: createDto.category,
        estimatedMinutes: createDto.estimatedMinutes,
        isActive: true,
      });
      expect(result).toEqual(mockService);
    });

    it('TC0002 - Should create service with default isActive true', async () => {
      const createDto = {
        name: faker.commerce.productName(),
        price: Number(faker.finance.amount({ min: 50, max: 500, dec: 2 })),
        category: 'Mecânica',
        estimatedMinutes: faker.number.int({ min: 30, max: 480 }),
      };

      const mockService = createMockService();
      serviceRepository.findByName.mockResolvedValue(null);
      serviceRepository.create.mockResolvedValue(mockService);

      await service.create(createDto);

      expect(serviceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
        }),
      );
    });

    it('TC0003 - Should throw error when service name already exists', async () => {
      const createDto = {
        name: faker.commerce.productName(),
        price: Number(faker.finance.amount({ min: 50, max: 500, dec: 2 })),
        category: 'Mecânica',
        estimatedMinutes: faker.number.int({ min: 30, max: 480 }),
      };

      const existingService = createMockService();
      serviceRepository.findByName.mockResolvedValue(existingService);
      errorHandler.handleConflictError.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.SERVICE_NAME_ALREADY_EXISTS);
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ERROR_MESSAGES.SERVICE_NAME_ALREADY_EXISTS,
      );

      expect(errorHandler.handleConflictError).toHaveBeenCalledWith(
        ERROR_MESSAGES.SERVICE_NAME_ALREADY_EXISTS,
      );
    });

    it('TC0004 - Should create service with null description', async () => {
      const createDto = {
        name: faker.commerce.productName(),
        price: Number(faker.finance.amount({ min: 50, max: 500, dec: 2 })),
        category: 'Mecânica',
        estimatedMinutes: faker.number.int({ min: 30, max: 480 }),
      };

      const mockService = createMockService();
      serviceRepository.findByName.mockResolvedValue(null);
      serviceRepository.create.mockResolvedValue(mockService);

      await service.create(createDto);

      expect(serviceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: null,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('TC0001 - Should return all services without filters', async () => {
      const mockServices = [createMockService(), createMockService()];
      serviceRepository.findAll.mockResolvedValue(mockServices);

      const result = await service.findAll();

      expect(serviceRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockServices);
    });

    it('TC0002 - Should return services filtered by category', async () => {
      const category = 'Mecânica';
      const mockServices = [createMockService()];
      serviceRepository.findAll.mockResolvedValue(mockServices);

      const result = await service.findAll({ category });

      expect(serviceRepository.findAll).toHaveBeenCalledWith({ category });
      expect(result).toEqual(mockServices);
    });

    it('TC0003 - Should return active services only', async () => {
      const mockServices = [createMockService()];
      serviceRepository.findAll.mockResolvedValue(mockServices);

      const result = await service.findAll({ active: true });

      expect(serviceRepository.findAll).toHaveBeenCalledWith({ active: true });
      expect(result).toEqual(mockServices);
    });
  });

  describe('findAllPaginated', () => {
    it('TC0001 - Should return paginated services without filters', async () => {
      const paginationDto = { page: 1, size: 10, skip: 0, take: 10 };
      const mockServices = [createMockService(), createMockService()];
      serviceRepository.findMany.mockResolvedValue(mockServices);
      serviceRepository.count.mockResolvedValue(2);

      const result = await service.findAllPaginated(paginationDto);

      expect(result.data).toHaveLength(2);
      expect(result.pagination.totalRecords).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
      expect(serviceRepository.findMany).toHaveBeenCalledWith(0, 10, undefined);
      expect(serviceRepository.count).toHaveBeenCalledWith(undefined);
    });

    it('TC0002 - Should return paginated services with filters', async () => {
      const paginationDto = { page: 1, size: 10, skip: 0, take: 10 };
      const filters = { category: 'Mecânica', active: true };
      const mockServices = [createMockService()];
      serviceRepository.findMany.mockResolvedValue(mockServices);
      serviceRepository.count.mockResolvedValue(1);

      const result = await service.findAllPaginated(paginationDto, filters);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.totalRecords).toBe(1);
      expect(serviceRepository.findMany).toHaveBeenCalledWith(0, 10, filters);
      expect(serviceRepository.count).toHaveBeenCalledWith(filters);
    });
  });

  describe('findById', () => {
    it('TC0001 - Should return service by id', async () => {
      const mockService = createMockService();
      serviceRepository.findById.mockResolvedValue(mockService);

      const result = await service.findById(mockService.id);

      expect(serviceRepository.findById).toHaveBeenCalledWith(mockService.id);
      expect(result).toEqual(mockService);
    });

    it('TC0002 - Should throw error when service not found', async () => {
      const serviceId = faker.string.uuid();
      serviceRepository.findById.mockResolvedValue(null);
      errorHandler.handleNotFoundError.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.SERVICE_NOT_FOUND);
      });

      await expect(service.findById(serviceId)).rejects.toThrow(
        ERROR_MESSAGES.SERVICE_NOT_FOUND,
      );

      expect(errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        ERROR_MESSAGES.SERVICE_NOT_FOUND,
      );
    });
  });

  describe('findByCategory', () => {
    it('TC0001 - Should return services by category', async () => {
      const category = 'Mecânica';
      const mockServices = [createMockService(), createMockService()];
      serviceRepository.findByCategory.mockResolvedValue(mockServices);

      const result = await service.findByCategory(category);

      expect(serviceRepository.findByCategory).toHaveBeenCalledWith(category);
      expect(result).toEqual(mockServices);
    });
  });

  describe('update', () => {
    it('TC0001 - Should update service successfully', async () => {
      const serviceId = faker.string.uuid();
      const updateDto = {
        name: faker.commerce.productName(),
        price: Number(faker.finance.amount({ min: 50, max: 500, dec: 2 })),
      };

      const existingService = createMockService();
      const updatedService = createMockService();
      serviceRepository.findById.mockResolvedValue(existingService);
      serviceRepository.update.mockResolvedValue(updatedService);

      const result = await service.update(serviceId, updateDto);

      expect(serviceRepository.findById).toHaveBeenCalledWith(serviceId);
      expect(serviceRepository.update).toHaveBeenCalledWith(serviceId, {
        name: updateDto.name,
        description: null,
        price: new Decimal(updateDto.price),
        category: undefined,
        estimatedMinutes: undefined,
        isActive: undefined,
      });
      expect(result).toEqual(updatedService);
    });

    it('TC0002 - Should throw error when service not found', async () => {
      const serviceId = faker.string.uuid();
      const updateDto = { name: faker.commerce.productName() };

      serviceRepository.findById.mockResolvedValue(null);
      errorHandler.handleNotFoundError.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.SERVICE_NOT_FOUND);
      });

      await expect(service.update(serviceId, updateDto)).rejects.toThrow(
        ERROR_MESSAGES.SERVICE_NOT_FOUND,
      );

      expect(errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        ERROR_MESSAGES.SERVICE_NOT_FOUND,
      );
    });

    it('TC0003 - Should throw error when new service name already exists', async () => {
      const serviceId = faker.string.uuid();
      const newName = faker.commerce.productName();
      const updateDto = { name: newName };

      const existingService = createMockService();
      const conflictService = {
        ...createMockService(),
        id: faker.string.uuid(),
      };
      serviceRepository.findById.mockResolvedValue(existingService);
      serviceRepository.findByName.mockResolvedValue(conflictService);
      errorHandler.handleConflictError.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.SERVICE_NAME_ALREADY_EXISTS);
      });

      await expect(service.update(serviceId, updateDto)).rejects.toThrow(
        ERROR_MESSAGES.SERVICE_NAME_ALREADY_EXISTS,
      );

      expect(errorHandler.handleConflictError).toHaveBeenCalledWith(
        ERROR_MESSAGES.SERVICE_NAME_ALREADY_EXISTS,
      );
    });

    it('TC0004 - Should update service with same name', async () => {
      const serviceId = faker.string.uuid();
      const existingService = createMockService();
      const updateDto = { name: existingService.name, price: 100.0 };

      serviceRepository.findById.mockResolvedValue(existingService);
      serviceRepository.update.mockResolvedValue(existingService);

      await service.update(serviceId, updateDto);

      expect(serviceRepository.findByName).not.toHaveBeenCalled();
    });

    it('TC0005 - Should update service without price field', async () => {
      const serviceId = faker.string.uuid();
      const updateDto = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        category: faker.commerce.department(),
      };

      const existingService = createMockService();
      const updatedService = createMockService();
      serviceRepository.findById.mockResolvedValue(existingService);
      serviceRepository.update.mockResolvedValue(updatedService);

      const result = await service.update(serviceId, updateDto);

      expect(serviceRepository.update).toHaveBeenCalledWith(serviceId, {
        name: updateDto.name,
        description: updateDto.description,
        price: undefined,
        category: updateDto.category,
        estimatedMinutes: undefined,
        isActive: undefined,
      });
      expect(result).toEqual(updatedService);
    });
  });

  describe('remove', () => {
    it('TC0001 - Should soft delete service successfully', async () => {
      const serviceId = faker.string.uuid();
      const existingService = createMockService();
      const deactivatedService = { ...existingService, isActive: false };

      serviceRepository.findById.mockResolvedValue(existingService);
      serviceRepository.update.mockResolvedValue(deactivatedService);

      const result = await service.remove(serviceId);

      expect(serviceRepository.findById).toHaveBeenCalledWith(serviceId);
      expect(serviceRepository.update).toHaveBeenCalledWith(serviceId, {
        isActive: false,
      });
      expect(result.isActive).toBe(false);
    });

    it('TC0002 - Should throw error when service not found', async () => {
      const serviceId = faker.string.uuid();
      serviceRepository.findById.mockResolvedValue(null);
      errorHandler.handleNotFoundError.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.SERVICE_NOT_FOUND);
      });

      await expect(service.remove(serviceId)).rejects.toThrow(
        ERROR_MESSAGES.SERVICE_NOT_FOUND,
      );

      expect(errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        ERROR_MESSAGES.SERVICE_NOT_FOUND,
      );
    });
  });
});
