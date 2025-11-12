import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { Decimal } from '@prisma/client/runtime/library';
import { PartService } from '../../../../src/workshop/2-application/services/part.service';
import { IPartRepository } from '../../../../src/workshop/3-domain/repositories/part-repository.interface';
import { ErrorHandlerService } from '../../../../src/shared/services/error-handler.service';
import { ERROR_MESSAGES } from '../../../../src/shared/constants/messages.constants';

describe('PartService', () => {
  let service: PartService;
  let partRepository: jest.Mocked<IPartRepository>;
  let errorHandler: jest.Mocked<ErrorHandlerService>;

  const createMockPart = () => ({
    id: faker.string.uuid(),
    partNumber: faker.string.alphanumeric(10).toUpperCase(),
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    supplier: faker.company.name(),
    price: new Decimal(faker.finance.amount({ min: 10, max: 500, dec: 2 })),
    stock: faker.number.int({ min: 0, max: 100 }),
    minStock: faker.number.int({ min: 5, max: 20 }),
    isActive: true,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  });

  beforeEach(async () => {
    const mockPartRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByPartNumber: jest.fn(),
      findBySupplier: jest.fn(),
      findLowStock: jest.fn(),
      update: jest.fn(),
      updateStock: jest.fn(),
      remove: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    };

    const mockErrorHandler = {
      handleError: jest.fn(),
      handleNotFoundError: jest.fn(),
      handleConflictError: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartService,
        { provide: 'IPartRepository', useValue: mockPartRepository },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
      ],
    }).compile();

    service = module.get<PartService>(PartService);
    partRepository = module.get('IPartRepository');
    errorHandler = module.get(ErrorHandlerService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('TC0001 - Should create a new part successfully', async () => {
      const createDto = {
        partNumber: faker.string.alphanumeric(10).toUpperCase(),
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        supplier: faker.company.name(),
        price: faker.finance.amount({ min: 10, max: 500, dec: 2 }),
        stock: faker.number.int({ min: 10, max: 100 }),
        minStock: faker.number.int({ min: 5, max: 20 }),
      };

      const mockPart = createMockPart();
      partRepository.findByPartNumber.mockResolvedValue(null);
      partRepository.create.mockResolvedValue(mockPart);

      const result = await service.create(createDto);

      expect(partRepository.findByPartNumber).toHaveBeenCalledWith(
        createDto.partNumber,
      );
      expect(partRepository.create).toHaveBeenCalledWith({
        name: createDto.name,
        description: createDto.description,
        partNumber: createDto.partNumber,
        price: new Decimal(createDto.price),
        stock: createDto.stock,
        minStock: createDto.minStock,
        supplier: createDto.supplier,
        isActive: true,
      });
      expect(result).toEqual(mockPart);
    });

    it('TC0002 - Should throw error when partNumber already exists', async () => {
      const createDto = {
        partNumber: faker.string.alphanumeric(10).toUpperCase(),
        name: faker.commerce.productName(),
        supplier: faker.company.name(),
        price: faker.finance.amount({ min: 10, max: 500, dec: 2 }),
        stock: faker.number.int({ min: 10, max: 100 }),
        minStock: faker.number.int({ min: 5, max: 20 }),
      };

      const existingPart = createMockPart();
      partRepository.findByPartNumber.mockResolvedValue(existingPart);
      errorHandler.handleConflictError.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.PART_NUMBER_ALREADY_EXISTS);
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ERROR_MESSAGES.PART_NUMBER_ALREADY_EXISTS,
      );

      expect(errorHandler.handleConflictError).toHaveBeenCalledWith(
        ERROR_MESSAGES.PART_NUMBER_ALREADY_EXISTS,
      );
    });

    it('TC0003 - Should create part with optional fields', async () => {
      const createDto = {
        name: faker.commerce.productName(),
        price: faker.finance.amount({ min: 10, max: 500, dec: 2 }),
        stock: faker.number.int({ min: 10, max: 100 }),
        minStock: faker.number.int({ min: 5, max: 20 }),
      };

      const mockPart = createMockPart();
      partRepository.create.mockResolvedValue(mockPart);

      const result = await service.create(createDto);

      expect(partRepository.create).toHaveBeenCalledWith({
        name: createDto.name,
        description: null,
        partNumber: null,
        price: new Decimal(createDto.price),
        stock: createDto.stock,
        minStock: createDto.minStock,
        supplier: null,
        isActive: true,
      });
      expect(result).toEqual(mockPart);
    });
  });

  describe('findAll', () => {
    it('TC0001 - Should return all parts without filters', async () => {
      const mockParts = [createMockPart(), createMockPart()];
      partRepository.findAll.mockResolvedValue(mockParts);

      const result = await service.findAll();

      expect(partRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockParts);
    });

    it('TC0002 - Should return parts filtered by supplier', async () => {
      const supplier = faker.company.name();
      const mockParts = [createMockPart()];
      partRepository.findAll.mockResolvedValue(mockParts);

      const result = await service.findAll({ supplier });

      expect(partRepository.findAll).toHaveBeenCalledWith({ supplier });
      expect(result).toEqual(mockParts);
    });

    it('TC0003 - Should return active parts only', async () => {
      const mockParts = [createMockPart()];
      partRepository.findAll.mockResolvedValue(mockParts);

      const result = await service.findAll({ active: true });

      expect(partRepository.findAll).toHaveBeenCalledWith({ active: true });
      expect(result).toEqual(mockParts);
    });

    it('TC0004 - Should return low stock parts', async () => {
      const mockParts = [createMockPart()];
      partRepository.findAll.mockResolvedValue(mockParts);

      const result = await service.findAll({ lowStock: true });

      expect(partRepository.findAll).toHaveBeenCalledWith({ lowStock: true });
      expect(result).toEqual(mockParts);
    });

    it('TC0005 - Should return parts with multiple filters', async () => {
      const filters = {
        supplier: faker.company.name(),
        active: true,
        lowStock: false,
      };
      const mockParts = [createMockPart()];
      partRepository.findAll.mockResolvedValue(mockParts);

      const result = await service.findAll(filters);

      expect(partRepository.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockParts);
    });
  });

  describe('findAllPaginated', () => {
    it('TC0001 - Should return paginated parts without filters', async () => {
      const mockParts = [createMockPart()];
      const paginationDto = { page: 0, size: 10, skip: 0, take: 10 };
      partRepository.findMany.mockResolvedValue(mockParts);
      partRepository.count.mockResolvedValue(1);

      const result = await service.findAllPaginated(paginationDto, {});

      expect(partRepository.findMany).toHaveBeenCalledWith(0, 10, {});
      expect(partRepository.count).toHaveBeenCalledWith({});
      expect(result.data).toEqual(mockParts);
      expect(result.pagination.totalRecords).toBe(1);
    });

    it('TC0002 - Should return paginated parts with filters', async () => {
      const mockParts = [createMockPart()];
      const paginationDto = { page: 0, size: 10, skip: 0, take: 10 };
      const filters = { supplier: 'Test', active: true };
      partRepository.findMany.mockResolvedValue(mockParts);
      partRepository.count.mockResolvedValue(1);

      const result = await service.findAllPaginated(paginationDto, filters);

      expect(partRepository.findMany).toHaveBeenCalledWith(0, 10, filters);
      expect(partRepository.count).toHaveBeenCalledWith(filters);
      expect(result.data).toEqual(mockParts);
    });
  });

  describe('findById', () => {
    it('TC0001 - Should return a part by id', async () => {
      const mockPart = createMockPart();
      partRepository.findById.mockResolvedValue(mockPart);

      const result = await service.findById(mockPart.id);

      expect(partRepository.findById).toHaveBeenCalledWith(mockPart.id);
      expect(result).toEqual(mockPart);
    });

    it('TC0002 - Should throw error when part not found', async () => {
      const partId = faker.string.uuid();
      partRepository.findById.mockResolvedValue(null);
      errorHandler.handleNotFoundError.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.PART_NOT_FOUND);
      });

      await expect(service.findById(partId)).rejects.toThrow(
        ERROR_MESSAGES.PART_NOT_FOUND,
      );

      expect(errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        ERROR_MESSAGES.PART_NOT_FOUND,
      );
    });
  });

  describe('findByPartNumber', () => {
    it('TC0001 - Should return a part by part number', async () => {
      const mockPart = createMockPart();
      partRepository.findByPartNumber.mockResolvedValue(mockPart);

      const result = await service.findByPartNumber(mockPart.partNumber);

      expect(partRepository.findByPartNumber).toHaveBeenCalledWith(
        mockPart.partNumber,
      );
      expect(result).toEqual(mockPart);
    });

    it('TC0002 - Should throw error when part not found', async () => {
      const partNumber = faker.string.alphanumeric(10).toUpperCase();
      partRepository.findByPartNumber.mockResolvedValue(null);
      errorHandler.handleNotFoundError.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.PART_NOT_FOUND);
      });

      await expect(service.findByPartNumber(partNumber)).rejects.toThrow(
        ERROR_MESSAGES.PART_NOT_FOUND,
      );

      expect(errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        ERROR_MESSAGES.PART_NOT_FOUND,
      );
    });
  });

  describe('findBySupplier', () => {
    it('TC0001 - Should return parts by supplier', async () => {
      const supplier = faker.company.name();
      const mockParts = [createMockPart(), createMockPart()];
      partRepository.findBySupplier.mockResolvedValue(mockParts);

      const result = await service.findBySupplier(supplier);

      expect(partRepository.findBySupplier).toHaveBeenCalledWith(supplier);
      expect(result).toEqual(mockParts);
    });
  });

  describe('findLowStock', () => {
    it('TC0001 - Should return parts with low stock', async () => {
      const mockParts = [createMockPart(), createMockPart()];
      partRepository.findLowStock.mockResolvedValue(mockParts);

      const result = await service.findLowStock();

      expect(partRepository.findLowStock).toHaveBeenCalled();
      expect(result).toEqual(mockParts);
    });
  });

  describe('update', () => {
    it('TC0001 - Should update part successfully', async () => {
      const partId = faker.string.uuid();
      const updateDto = {
        name: faker.commerce.productName(),
        price: faker.finance.amount({ min: 10, max: 500, dec: 2 }),
      };

      const existingPart = createMockPart();
      const updatedPart = createMockPart();
      partRepository.findById.mockResolvedValue(existingPart);
      partRepository.update.mockResolvedValue(updatedPart);

      const result = await service.update(partId, updateDto);

      expect(partRepository.findById).toHaveBeenCalledWith(partId);
      expect(partRepository.update).toHaveBeenCalledWith(partId, {
        name: updateDto.name,
        price: new Decimal(updateDto.price),
      });
      expect(result).toEqual(updatedPart);
    });

    it('TC0002 - Should throw error when part not found', async () => {
      const partId = faker.string.uuid();
      const updateDto = { name: faker.commerce.productName() };

      partRepository.findById.mockResolvedValue(null);
      errorHandler.handleNotFoundError.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.PART_NOT_FOUND);
      });

      await expect(service.update(partId, updateDto)).rejects.toThrow(
        ERROR_MESSAGES.PART_NOT_FOUND,
      );

      expect(errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        ERROR_MESSAGES.PART_NOT_FOUND,
      );
    });

    it('TC0003 - Should throw error when partNumber already exists', async () => {
      const partId = faker.string.uuid();
      const updateDto = {
        partNumber: faker.string.alphanumeric(10).toUpperCase(),
      };

      const existingPart = createMockPart();
      const conflictPart = { ...createMockPart(), id: faker.string.uuid() };
      partRepository.findById.mockResolvedValue(existingPart);
      partRepository.findByPartNumber.mockResolvedValue(conflictPart);
      errorHandler.handleConflictError.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.PART_NUMBER_ALREADY_EXISTS);
      });

      await expect(service.update(partId, updateDto)).rejects.toThrow(
        ERROR_MESSAGES.PART_NUMBER_ALREADY_EXISTS,
      );

      expect(errorHandler.handleConflictError).toHaveBeenCalledWith(
        ERROR_MESSAGES.PART_NUMBER_ALREADY_EXISTS,
      );
    });

    it('TC0004 - Should update partNumber when new one is available', async () => {
      const partId = faker.string.uuid();
      const updateDto = {
        partNumber: faker.string.alphanumeric(10).toUpperCase(),
      };

      const existingPart = createMockPart();
      const updatedPart = { ...existingPart, ...updateDto };
      partRepository.findById.mockResolvedValue(existingPart);
      partRepository.findByPartNumber.mockResolvedValue(null);
      partRepository.update.mockResolvedValue(updatedPart);

      const result = await service.update(partId, updateDto);

      expect(partRepository.findByPartNumber).toHaveBeenCalledWith(
        updateDto.partNumber,
      );
      expect(result).toEqual(updatedPart);
    });

    it('TC0005 - Should update only provided fields', async () => {
      const partId = faker.string.uuid();
      const updateDto = {
        description: faker.commerce.productDescription(),
      };

      const existingPart = createMockPart();
      const updatedPart = { ...existingPart, ...updateDto };
      partRepository.findById.mockResolvedValue(existingPart);
      partRepository.update.mockResolvedValue(updatedPart);

      const result = await service.update(partId, updateDto);

      expect(partRepository.update).toHaveBeenCalledWith(partId, {
        description: updateDto.description,
      });
      expect(result).toEqual(updatedPart);
    });

    it('TC0006 - Should convert price to Decimal when provided', async () => {
      const partId = faker.string.uuid();
      const updateDto = {
        price: faker.finance.amount({ min: 10, max: 500, dec: 2 }),
      };

      const existingPart = createMockPart();
      const updatedPart = { ...existingPart };
      partRepository.findById.mockResolvedValue(existingPart);
      partRepository.update.mockResolvedValue(updatedPart);

      await service.update(partId, updateDto);

      expect(partRepository.update).toHaveBeenCalledWith(partId, {
        price: new Decimal(updateDto.price),
      });
    });

    it('TC0007 - Should update multiple fields including price', async () => {
      const partId = faker.string.uuid();
      const updateDto = {
        name: faker.commerce.productName(),
        supplier: faker.company.name(),
        price: faker.finance.amount({ min: 10, max: 500, dec: 2 }),
        minStock: faker.number.int({ min: 5, max: 20 }),
      };

      const existingPart = createMockPart();
      const updatedPart = createMockPart();
      partRepository.findById.mockResolvedValue(existingPart);
      partRepository.update.mockResolvedValue(updatedPart);

      const result = await service.update(partId, updateDto);

      expect(partRepository.update).toHaveBeenCalledWith(partId, {
        name: updateDto.name,
        supplier: updateDto.supplier,
        price: new Decimal(updateDto.price),
        minStock: updateDto.minStock,
      });
      expect(result).toEqual(updatedPart);
    });

    it('TC0008 - Should update stock field when provided', async () => {
      const partId = faker.string.uuid();
      const updateDto = {
        stock: faker.number.int({ min: 10, max: 100 }),
      };

      const existingPart = createMockPart();
      const updatedPart = createMockPart();
      partRepository.findById.mockResolvedValue(existingPart);
      partRepository.update.mockResolvedValue(updatedPart);

      const result = await service.update(partId, updateDto);

      expect(partRepository.update).toHaveBeenCalledWith(partId, {
        stock: updateDto.stock,
      });
      expect(result).toEqual(updatedPart);
    });
  });

  describe('updateStock', () => {
    it('TC0001 - Should update stock successfully with positive quantity', async () => {
      const partId = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 50 });

      const existingPart = createMockPart();
      const updatedPart = createMockPart();
      partRepository.findById.mockResolvedValue(existingPart);
      partRepository.update.mockResolvedValue(updatedPart);

      const result = await service.updateStock(partId, quantity);

      expect(partRepository.findById).toHaveBeenCalledWith(partId);
      expect(partRepository.update).toHaveBeenCalledWith(partId, {
        stock: existingPart.stock + quantity,
      });
      expect(result).toEqual(updatedPart);
    });

    it('TC0002 - Should update stock successfully with negative quantity', async () => {
      const partId = faker.string.uuid();
      const quantity = -5;

      const existingPart = { ...createMockPart(), stock: 20 };
      const updatedPart = createMockPart();
      partRepository.findById.mockResolvedValue(existingPart);
      partRepository.update.mockResolvedValue(updatedPart);

      const result = await service.updateStock(partId, quantity);

      expect(partRepository.update).toHaveBeenCalledWith(partId, {
        stock: 15,
      });
      expect(result).toEqual(updatedPart);
    });

    it('TC0003 - Should throw error when part not found', async () => {
      const partId = faker.string.uuid();
      const quantity = faker.number.int({ min: 1, max: 50 });

      partRepository.findById.mockResolvedValue(null);
      errorHandler.handleNotFoundError.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.PART_NOT_FOUND);
      });

      await expect(service.updateStock(partId, quantity)).rejects.toThrow(
        ERROR_MESSAGES.PART_NOT_FOUND,
      );

      expect(errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        ERROR_MESSAGES.PART_NOT_FOUND,
      );
    });

    it('TC0004 - Should throw error when resulting stock would be negative', async () => {
      const partId = faker.string.uuid();
      const quantity = -50;

      const existingPart = { ...createMockPart(), stock: 10 };
      partRepository.findById.mockResolvedValue(existingPart);
      errorHandler.handleConflictError.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.INSUFFICIENT_STOCK);
      });

      await expect(service.updateStock(partId, quantity)).rejects.toThrow(
        ERROR_MESSAGES.INSUFFICIENT_STOCK,
      );

      expect(errorHandler.handleConflictError).toHaveBeenCalledWith(
        ERROR_MESSAGES.INSUFFICIENT_STOCK,
      );
    });
  });

  describe('remove', () => {
    it('TC0001 - Should soft delete part successfully', async () => {
      const partId = faker.string.uuid();
      const existingPart = createMockPart();
      const deactivatedPart = { ...existingPart, isActive: false };

      partRepository.findById.mockResolvedValue(existingPart);
      partRepository.update.mockResolvedValue(deactivatedPart);

      await service.remove(partId);

      expect(partRepository.findById).toHaveBeenCalledWith(partId);
      expect(partRepository.update).toHaveBeenCalledWith(partId, {
        isActive: false,
      });
    });

    it('TC0002 - Should throw error when part not found', async () => {
      const partId = faker.string.uuid();
      partRepository.findById.mockResolvedValue(null);
      errorHandler.handleNotFoundError.mockImplementation(() => {
        throw new Error(ERROR_MESSAGES.PART_NOT_FOUND);
      });

      await expect(service.remove(partId)).rejects.toThrow(
        ERROR_MESSAGES.PART_NOT_FOUND,
      );

      expect(errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        ERROR_MESSAGES.PART_NOT_FOUND,
      );
    });
  });
});
