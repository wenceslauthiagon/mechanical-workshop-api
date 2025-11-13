import { faker } from '@faker-js/faker/locale/pt_BR';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { Decimal } from '@prisma/client/runtime/library';

import { PartController } from '../../../../src/workshop/1-presentation/controllers/part.controller';
import { PartService } from '../../../../src/workshop/2-application/services/part.service';
import { CreatePartDto } from '../../../../src/workshop/1-presentation/dtos/part/create-part.dto';
import { UpdatePartDto } from '../../../../src/workshop/1-presentation/dtos/part/update-part.dto';

describe('PartController', () => {
  let partController: PartController;
  let partService: jest.Mocked<PartService>;

  const mockPartId = uuidv4();
  const mockPartNumber = 'FL500S';
  const mockSupplier = 'AutoPeças Brasil Ltda';

  const mockPartData = {
    id: mockPartId,
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(),
    partNumber: mockPartNumber,
    price: new Decimal(
      faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
    ),
    stock: faker.number.int({ min: 0, max: 200 }),
    minStock: faker.number.int({ min: 5, max: 20 }),
    supplier: mockSupplier,
    isActive: true,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const mockCreatePartDto: CreatePartDto = {
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(),
    partNumber: mockPartNumber,
    price: faker.number
      .float({ min: 10, max: 500, fractionDigits: 2 })
      .toFixed(2),
    stock: faker.number.int({ min: 0, max: 200 }),
    minStock: faker.number.int({ min: 5, max: 20 }),
    supplier: mockSupplier,
  };

  const mockUpdatePartDto: UpdatePartDto = {
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(),
    price: faker.number
      .float({ min: 10, max: 500, fractionDigits: 2 })
      .toFixed(2),
    stock: faker.number.int({ min: 0, max: 200 }),
    minStock: faker.number.int({ min: 5, max: 20 }),
    supplier: faker.company.name(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartController],
      providers: [
        {
          provide: PartService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findAllPaginated: jest.fn(),
            findLowStock: jest.fn(),
            findBySupplier: jest.fn(),
            findById: jest.fn(),
            findByPartNumber: jest.fn(),
            update: jest.fn(),
            updateStock: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    partController = module.get<PartController>(PartController);
    partService = module.get(PartService);
  });

  it('Should be defined', () => {
    expect(partController).toBeDefined();
    expect(partController).toBeInstanceOf(PartController);
    expect(partService).toBeDefined();
  });

  it('Should instantiate controller with service dependency', () => {
    const mockService = {} as PartService;
    const testController = new PartController(mockService);
    expect(testController).toBeInstanceOf(PartController);
  });

  describe('create', () => {
    it('TC0001 - Should create a part successfully', async () => {
      const createdPart = {
        ...mockPartData,
        name: mockCreatePartDto.name,
        description: mockCreatePartDto.description || null,
        partNumber: mockCreatePartDto.partNumber || null,
        price: new Decimal(mockCreatePartDto.price),
        stock: mockCreatePartDto.stock,
        minStock: mockCreatePartDto.minStock,
        supplier: mockCreatePartDto.supplier || null,
      };
      partService.create.mockResolvedValue(createdPart);

      const result = await partController.create(mockCreatePartDto);

      expect(partService.create).toHaveBeenCalledWith(mockCreatePartDto);
      expect(result).toEqual({
        id: createdPart.id,
        name: createdPart.name,
        description: createdPart.description,
        partNumber: createdPart.partNumber,
        price: createdPart.price.toString(),
        stock: createdPart.stock,
        minStock: createdPart.minStock,
        supplier: createdPart.supplier,
        isActive: createdPart.isActive,
        createdAt: createdPart.createdAt,
        updatedAt: createdPart.updatedAt,
      });
    });

    it('TC0002 - Should throw error when creating part fails', async () => {
      const mockError = new Error('Falha ao criar peça');
      partService.create.mockRejectedValue(mockError);

      await expect(partController.create(mockCreatePartDto)).rejects.toThrow(
        mockError,
      );
      expect(partService.create).toHaveBeenCalledWith(mockCreatePartDto);
    });

    it('TC0003 - Should handle duplicate part number error', async () => {
      const mockError = new Error('Número da peça já existe');
      partService.create.mockRejectedValue(mockError);

      await expect(partController.create(mockCreatePartDto)).rejects.toThrow(
        mockError,
      );
      expect(partService.create).toHaveBeenCalledWith(mockCreatePartDto);
    });
  });

  describe('findAll', () => {
    it('TC0001 - Should return all parts without filters', async () => {
      const mockParts = [mockPartData];
      partService.findAll.mockResolvedValue(mockParts);

      const result = await partController.findAll();

      expect(partService.findAll).toHaveBeenCalledWith({});
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockPartData.id);
      expect(result[0].price).toBe(mockPartData.price.toString());
    });

    it('TC0002 - Should return parts filtered by supplier', async () => {
      const mockParts = [mockPartData];
      partService.findAll.mockResolvedValue(mockParts);

      const result = await partController.findAll(mockSupplier);

      expect(partService.findAll).toHaveBeenCalledWith({
        supplier: mockSupplier,
      });
      expect(result).toHaveLength(1);
      expect(result[0].supplier).toBe(mockSupplier);
    });

    it('TC0003 - Should return parts filtered by active status', async () => {
      const mockParts = [mockPartData];
      partService.findAll.mockResolvedValue(mockParts);

      const result = await partController.findAll(undefined, true);

      expect(partService.findAll).toHaveBeenCalledWith({ active: true });
      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(true);
    });

    it('TC0004 - Should return parts filtered by low stock', async () => {
      const mockParts = [mockPartData];
      partService.findAll.mockResolvedValue(mockParts);

      const result = await partController.findAll(undefined, undefined, true);

      expect(partService.findAll).toHaveBeenCalledWith({ lowStock: true });
      expect(result).toHaveLength(1);
    });

    it('TC0005 - Should return parts with all filters', async () => {
      const mockParts = [mockPartData];
      partService.findAll.mockResolvedValue(mockParts);

      const result = await partController.findAll(mockSupplier, true, true);

      expect(partService.findAll).toHaveBeenCalledWith({
        supplier: mockSupplier,
        active: true,
        lowStock: true,
      });
      expect(result).toHaveLength(1);
    });

    it('TC0006 - Should throw error when findAll fails', async () => {
      const mockError = new Error('Falha ao listar peças');
      partService.findAll.mockRejectedValue(mockError);

      await expect(partController.findAll()).rejects.toThrow(mockError);
      expect(partService.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findAllPaginated', () => {
    it('TC0001 - Should return paginated parts without filters', async () => {
      const mockParts = [mockPartData];
      const paginationDto = { page: 0, size: 10 };
      const mockPaginatedResult = {
        data: mockParts,
        pagination: { page: 0, totalPages: 1, totalRecords: 1 },
      };

      partService.findAllPaginated.mockResolvedValue(mockPaginatedResult);

      const result = await partController.findAllPaginated(
        paginationDto as any,
      );

      expect(partService.findAllPaginated).toHaveBeenCalledWith(
        paginationDto,
        {},
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(mockPartData.id);
      expect(result.pagination.totalRecords).toBe(1);
    });

    it('TC0002 - Should return paginated parts with supplier filter', async () => {
      const mockParts = [mockPartData];
      const paginationDto = { page: 0, size: 10 };
      const mockPaginatedResult = {
        data: mockParts,
        pagination: { page: 0, totalPages: 1, totalRecords: 1 },
      };

      partService.findAllPaginated.mockResolvedValue(mockPaginatedResult);

      const result = await partController.findAllPaginated(
        paginationDto as any,
        mockSupplier,
      );

      expect(partService.findAllPaginated).toHaveBeenCalledWith(paginationDto, {
        supplier: mockSupplier,
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].supplier).toBe(mockSupplier);
    });

    it('TC0003 - Should return paginated parts with active filter', async () => {
      const mockParts = [mockPartData];
      const paginationDto = { page: 0, size: 10 };
      const mockPaginatedResult = {
        data: mockParts,
        pagination: { page: 0, totalPages: 1, totalRecords: 1 },
      };

      partService.findAllPaginated.mockResolvedValue(mockPaginatedResult);

      const result = await partController.findAllPaginated(
        paginationDto as any,
        undefined,
        true,
      );

      expect(partService.findAllPaginated).toHaveBeenCalledWith(paginationDto, {
        active: true,
      });
      expect(result.data).toHaveLength(1);
    });

    it('TC0004 - Should return paginated parts with lowStock filter', async () => {
      const mockParts = [mockPartData];
      const paginationDto = { page: 0, size: 10 };
      const mockPaginatedResult = {
        data: mockParts,
        pagination: { page: 0, totalPages: 1, totalRecords: 1 },
      };

      partService.findAllPaginated.mockResolvedValue(mockPaginatedResult);

      const result = await partController.findAllPaginated(
        paginationDto as any,
        undefined,
        undefined,
        true,
      );

      expect(partService.findAllPaginated).toHaveBeenCalledWith(paginationDto, {
        lowStock: true,
      });
      expect(result.data).toHaveLength(1);
    });

    it('TC0005 - Should return empty paginated result when no parts found', async () => {
      const paginationDto = { page: 0, size: 10 };
      const mockPaginatedResult = {
        data: [],
        pagination: { page: 0, totalPages: 0, totalRecords: 0 },
      };

      partService.findAllPaginated.mockResolvedValue(mockPaginatedResult);

      const result = await partController.findAllPaginated(
        paginationDto as any,
      );

      expect(partService.findAllPaginated).toHaveBeenCalledWith(
        paginationDto,
        {},
      );
      expect(result.data).toHaveLength(0);
      expect(result.pagination.totalRecords).toBe(0);
    });
  });

  describe('findLowStock', () => {
    it('TC0001 - Should return parts with low stock', async () => {
      const lowStockPart = { ...mockPartData, stock: 2 };
      const mockParts = [lowStockPart];
      partService.findLowStock.mockResolvedValue(mockParts);

      const result = await partController.findLowStock();

      expect(partService.findLowStock).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].stock).toBe(2);
    });

    it('TC0002 - Should return empty array when no low stock parts', async () => {
      partService.findLowStock.mockResolvedValue([]);

      const result = await partController.findLowStock();

      expect(partService.findLowStock).toHaveBeenCalled();
      expect(result).toHaveLength(0);
    });

    it('TC0003 - Should throw error when findLowStock fails', async () => {
      const mockError = new Error('Falha ao buscar peças com estoque baixo');
      partService.findLowStock.mockRejectedValue(mockError);

      await expect(partController.findLowStock()).rejects.toThrow(mockError);
      expect(partService.findLowStock).toHaveBeenCalled();
    });
  });

  describe('findBySupplier', () => {
    it('TC0001 - Should find parts by supplier successfully', async () => {
      const mockParts = [mockPartData];
      partService.findBySupplier.mockResolvedValue(mockParts);

      const result = await partController.findBySupplier(mockSupplier);

      expect(partService.findBySupplier).toHaveBeenCalledWith(mockSupplier);
      expect(result).toHaveLength(1);
      expect(result[0].supplier).toBe(mockSupplier);
    });

    it('TC0002 - Should return empty array when no parts found for supplier', async () => {
      partService.findBySupplier.mockResolvedValue([]);

      const result = await partController.findBySupplier(mockSupplier);

      expect(partService.findBySupplier).toHaveBeenCalledWith(mockSupplier);
      expect(result).toHaveLength(0);
    });

    it('TC0003 - Should throw error when supplier not found', async () => {
      const mockError = new Error('Fornecedor não encontrado');
      partService.findBySupplier.mockRejectedValue(mockError);

      await expect(partController.findBySupplier(mockSupplier)).rejects.toThrow(
        mockError,
      );
      expect(partService.findBySupplier).toHaveBeenCalledWith(mockSupplier);
    });
  });

  describe('findOne', () => {
    it('TC0001 - Should find part by ID successfully', async () => {
      partService.findById.mockResolvedValue(mockPartData);

      const result = await partController.findOne(mockPartId);

      expect(partService.findById).toHaveBeenCalledWith(mockPartId);
      expect(result.id).toBe(mockPartId);
      expect(result.price).toBe(mockPartData.price.toString());
    });

    it('TC0002 - Should throw error when part not found by ID', async () => {
      const mockError = new Error('Peça não encontrada');
      partService.findById.mockRejectedValue(mockError);

      await expect(partController.findOne(mockPartId)).rejects.toThrow(
        mockError,
      );
      expect(partService.findById).toHaveBeenCalledWith(mockPartId);
    });

    it('TC0003 - Should handle invalid UUID format', async () => {
      const invalidId = 'invalid-uuid';
      // This would be caught by ParseUUIDPipe in real scenario
      const mockError = new Error('UUID inválido');
      partService.findById.mockRejectedValue(mockError);

      await expect(partController.findOne(invalidId)).rejects.toThrow(
        mockError,
      );
      expect(partService.findById).toHaveBeenCalledWith(invalidId);
    });
  });

  describe('findByPartNumber', () => {
    it('TC0001 - Should find part by part number successfully', async () => {
      partService.findByPartNumber.mockResolvedValue(mockPartData);

      const result = await partController.findByPartNumber(mockPartNumber);

      expect(partService.findByPartNumber).toHaveBeenCalledWith(mockPartNumber);
      expect(result.partNumber).toBe(mockPartNumber);
      expect(result.price).toBe(mockPartData.price.toString());
    });

    it('TC0002 - Should throw error when part not found by part number', async () => {
      const mockError = new Error('Peça não encontrada');
      partService.findByPartNumber.mockRejectedValue(mockError);

      await expect(
        partController.findByPartNumber(mockPartNumber),
      ).rejects.toThrow(mockError);
      expect(partService.findByPartNumber).toHaveBeenCalledWith(mockPartNumber);
    });

    it('TC0003 - Should handle invalid part number', async () => {
      const invalidPartNumber = '';
      const mockError = new Error('Número da peça inválido');
      partService.findByPartNumber.mockRejectedValue(mockError);

      await expect(
        partController.findByPartNumber(invalidPartNumber),
      ).rejects.toThrow(mockError);
      expect(partService.findByPartNumber).toHaveBeenCalledWith(
        invalidPartNumber,
      );
    });
  });

  describe('update', () => {
    it('TC0001 - Should update part successfully', async () => {
      const updatedPart = {
        ...mockPartData,
        name: mockUpdatePartDto.name || mockPartData.name,
        description: mockUpdatePartDto.description || null,
        price: mockUpdatePartDto.price
          ? new Decimal(mockUpdatePartDto.price)
          : mockPartData.price,
        stock: mockUpdatePartDto.stock || mockPartData.stock,
        minStock: mockUpdatePartDto.minStock || mockPartData.minStock,
        supplier: mockUpdatePartDto.supplier || mockPartData.supplier,
      };
      partService.update.mockResolvedValue(updatedPart);

      const result = await partController.update(mockPartId, mockUpdatePartDto);

      expect(partService.update).toHaveBeenCalledWith(
        mockPartId,
        mockUpdatePartDto,
      );
      expect(result.id).toBe(mockPartId);
      expect(result.price).toBe(updatedPart.price.toString());
    });

    it('TC0002 - Should throw error when part not found for update', async () => {
      const mockError = new Error('Peça não encontrada');
      partService.update.mockRejectedValue(mockError);

      await expect(
        partController.update(mockPartId, mockUpdatePartDto),
      ).rejects.toThrow(mockError);
      expect(partService.update).toHaveBeenCalledWith(
        mockPartId,
        mockUpdatePartDto,
      );
    });

    it('TC0003 - Should handle duplicate part number during update', async () => {
      const mockError = new Error('Número da peça já existe');
      partService.update.mockRejectedValue(mockError);

      await expect(
        partController.update(mockPartId, mockUpdatePartDto),
      ).rejects.toThrow(mockError);
      expect(partService.update).toHaveBeenCalledWith(
        mockPartId,
        mockUpdatePartDto,
      );
    });
  });

  describe('updateStock', () => {
    it('TC0001 - Should update stock successfully (add)', async () => {
      const quantity = 50;
      const updatedPart = {
        ...mockPartData,
        stock: mockPartData.stock + quantity,
      };
      partService.updateStock.mockResolvedValue(updatedPart);

      const result = await partController.updateStock(mockPartId, quantity);

      expect(partService.updateStock).toHaveBeenCalledWith(
        mockPartId,
        quantity,
      );
      expect(result.stock).toBe(mockPartData.stock + quantity);
    });

    it('TC0002 - Should update stock successfully (remove)', async () => {
      const quantity = -10;
      const updatedPart = {
        ...mockPartData,
        stock: mockPartData.stock + quantity,
      };
      partService.updateStock.mockResolvedValue(updatedPart);

      const result = await partController.updateStock(mockPartId, quantity);

      expect(partService.updateStock).toHaveBeenCalledWith(
        mockPartId,
        quantity,
      );
      expect(result.stock).toBe(mockPartData.stock + quantity);
    });

    it('TC0003 - Should throw error when part not found for stock update', async () => {
      const quantity = 50;
      const mockError = new Error('Peça não encontrada');
      partService.updateStock.mockRejectedValue(mockError);

      await expect(
        partController.updateStock(mockPartId, quantity),
      ).rejects.toThrow(mockError);
      expect(partService.updateStock).toHaveBeenCalledWith(
        mockPartId,
        quantity,
      );
    });

    it('TC0004 - Should handle insufficient stock error', async () => {
      const quantity = -1000;
      const mockError = new Error('Estoque insuficiente');
      partService.updateStock.mockRejectedValue(mockError);

      await expect(
        partController.updateStock(mockPartId, quantity),
      ).rejects.toThrow(mockError);
      expect(partService.updateStock).toHaveBeenCalledWith(
        mockPartId,
        quantity,
      );
    });
  });

  describe('remove', () => {
    it('TC0001 - Should remove part successfully', async () => {
      const removedPart = { ...mockPartData, isActive: false };
      partService.remove.mockResolvedValue(removedPart);

      const result = await partController.remove(mockPartId);

      expect(partService.remove).toHaveBeenCalledWith(mockPartId);
      expect(result.id).toBe(mockPartId);
      expect(result.isActive).toBe(false);
    });

    it('TC0002 - Should throw error when part not found for removal', async () => {
      const mockError = new Error('Peça não encontrada');
      partService.remove.mockRejectedValue(mockError);

      await expect(partController.remove(mockPartId)).rejects.toThrow(
        mockError,
      );
      expect(partService.remove).toHaveBeenCalledWith(mockPartId);
    });

    it('TC0003 - Should handle part already inactive', async () => {
      const mockError = new Error('Peça já está inativa');
      partService.remove.mockRejectedValue(mockError);

      await expect(partController.remove(mockPartId)).rejects.toThrow(
        mockError,
      );
      expect(partService.remove).toHaveBeenCalledWith(mockPartId);
    });
  });
});
