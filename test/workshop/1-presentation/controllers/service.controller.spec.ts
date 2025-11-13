import { faker } from '@faker-js/faker/locale/pt_BR';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { Decimal } from '@prisma/client/runtime/library';

import { ServiceController } from '../../../../src/workshop/1-presentation/controllers/service.controller';
import { ServiceService } from '../../../../src/workshop/2-application/services/service.service';
import { CreateServiceDto } from '../../../../src/workshop/1-presentation/dtos/service/create-service.dto';
import { UpdateServiceDto } from '../../../../src/workshop/1-presentation/dtos/service/update-service.dto';

describe('ServiceController', () => {
  let serviceController: ServiceController;
  let serviceService: jest.Mocked<ServiceService>;

  const mockServiceId = uuidv4();
  const mockCategory = 'Manutenção Preventiva';

  const mockServiceData = {
    id: mockServiceId,
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(),
    price: new Decimal(
      faker.number.float({ min: 50, max: 500, fractionDigits: 2 }),
    ),
    category: mockCategory,
    estimatedMinutes: faker.number.int({ min: 30, max: 240 }),
    isActive: true,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const mockCreateServiceDto: CreateServiceDto = {
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(),
    price: faker.number.float({ min: 50, max: 500, fractionDigits: 2 }),
    category: mockCategory,
    estimatedMinutes: faker.number.int({ min: 30, max: 240 }),
  };

  const mockUpdateServiceDto: UpdateServiceDto = {
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(),
    price: faker.number.float({ min: 50, max: 500, fractionDigits: 2 }),
    estimatedMinutes: faker.number.int({ min: 30, max: 240 }),
    category: faker.commerce.department(),
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceController],
      providers: [
        {
          provide: ServiceService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findAllPaginated: jest.fn(),
            findById: jest.fn(),
            findByCategory: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    serviceController = module.get<ServiceController>(ServiceController);
    serviceService = module.get(ServiceService);
  });

  it('Should be defined', () => {
    expect(serviceController).toBeDefined();
    expect(serviceController).toBeInstanceOf(ServiceController);
  });

  it('Should instantiate with service dependency', () => {
    const controller = new ServiceController(serviceService);
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('TC0001 - Should create a service successfully', async () => {
      const createdService = {
        ...mockServiceData,
        name: mockCreateServiceDto.name,
        description: mockCreateServiceDto.description || null,
        price: new Decimal(mockCreateServiceDto.price),
        category: mockCreateServiceDto.category,
        estimatedMinutes: mockCreateServiceDto.estimatedMinutes,
      };
      serviceService.create.mockResolvedValue(createdService);

      const result = await serviceController.create(mockCreateServiceDto);

      expect(serviceService.create).toHaveBeenCalledWith(mockCreateServiceDto);
      expect(result).toEqual(createdService);
    });

    it('TC0002 - Should throw error when creating service fails', async () => {
      const mockError = new Error('Falha ao criar serviço');
      serviceService.create.mockRejectedValue(mockError);

      await expect(
        serviceController.create(mockCreateServiceDto),
      ).rejects.toThrow(mockError);
      expect(serviceService.create).toHaveBeenCalledWith(mockCreateServiceDto);
    });

    it('TC0003 - Should handle duplicate service name error', async () => {
      const mockError = new Error('Serviço já cadastrado');
      serviceService.create.mockRejectedValue(mockError);

      await expect(
        serviceController.create(mockCreateServiceDto),
      ).rejects.toThrow(mockError);
      expect(serviceService.create).toHaveBeenCalledWith(mockCreateServiceDto);
    });
  });

  describe('findAll', () => {
    it('TC0001 - Should return all services without filters', async () => {
      const mockServices = [mockServiceData];
      serviceService.findAll.mockResolvedValue(mockServices);

      const result = await serviceController.findAll();

      expect(serviceService.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(mockServices);
    });

    it('TC0001a - Should return paginated services', async () => {
      const paginationDto = { page: 1, size: 10, skip: 0, take: 10 };
      const mockPaginatedResponse = {
        data: [mockServiceData],
        pagination: { page: 1, size: 10, totalPages: 1, totalRecords: 1 },
      };
      serviceService.findAllPaginated.mockResolvedValue(mockPaginatedResponse);

      const result = await serviceController.findAllPaginated(paginationDto);

      expect(serviceService.findAllPaginated).toHaveBeenCalledWith(
        paginationDto,
        {
          category: undefined,
          active: undefined,
        },
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('TC0002 - Should return services filtered by category', async () => {
      const mockServices = [mockServiceData];
      serviceService.findAll.mockResolvedValue(mockServices);

      const result = await serviceController.findAll(mockCategory);

      expect(serviceService.findAll).toHaveBeenCalledWith({
        category: mockCategory,
      });
      expect(result).toEqual(mockServices);
    });

    it('TC0003 - Should return services filtered by active status', async () => {
      const mockServices = [mockServiceData];
      serviceService.findAll.mockResolvedValue(mockServices);

      const result = await serviceController.findAll(undefined, true);

      expect(serviceService.findAll).toHaveBeenCalledWith({ active: true });
      expect(result).toEqual(mockServices);
    });

    it('TC0004 - Should return services with both filters', async () => {
      const mockServices = [mockServiceData];
      serviceService.findAll.mockResolvedValue(mockServices);

      const result = await serviceController.findAll(mockCategory, true);

      expect(serviceService.findAll).toHaveBeenCalledWith({
        category: mockCategory,
        active: true,
      });
      expect(result).toEqual(mockServices);
    });

    it('TC0005 - Should throw error when findAll fails', async () => {
      const mockError = new Error('Falha ao listar serviços');
      serviceService.findAll.mockRejectedValue(mockError);

      await expect(serviceController.findAll()).rejects.toThrow(mockError);
      expect(serviceService.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('TC0001 - Should find service by ID successfully', async () => {
      serviceService.findById.mockResolvedValue(mockServiceData);

      const result = await serviceController.findOne(mockServiceId);

      expect(serviceService.findById).toHaveBeenCalledWith(mockServiceId);
      expect(result).toEqual(mockServiceData);
    });

    it('TC0002 - Should throw error when service not found by ID', async () => {
      const mockError = new Error('Serviço não encontrado');
      serviceService.findById.mockRejectedValue(mockError);

      await expect(serviceController.findOne(mockServiceId)).rejects.toThrow(
        mockError,
      );
      expect(serviceService.findById).toHaveBeenCalledWith(mockServiceId);
    });

    it('TC0003 - Should handle invalid UUID format', async () => {
      const invalidId = 'invalid-uuid';
      const mockError = new Error('ID inválido');
      serviceService.findById.mockRejectedValue(mockError);

      await expect(serviceController.findOne(invalidId)).rejects.toThrow(
        mockError,
      );
      expect(serviceService.findById).toHaveBeenCalledWith(invalidId);
    });
  });

  describe('findByCategory', () => {
    it('TC0001 - Should find services by category successfully', async () => {
      const mockServices = [mockServiceData];
      serviceService.findByCategory.mockResolvedValue(mockServices);

      const result = await serviceController.findByCategory(mockCategory);

      expect(serviceService.findByCategory).toHaveBeenCalledWith(mockCategory);
      expect(result).toEqual(mockServices);
    });

    it('TC0002 - Should return empty array when no services found in category', async () => {
      serviceService.findByCategory.mockResolvedValue([]);

      const result = await serviceController.findByCategory(mockCategory);

      expect(serviceService.findByCategory).toHaveBeenCalledWith(mockCategory);
      expect(result).toEqual([]);
    });

    it('TC0003 - Should handle invalid category', async () => {
      const invalidCategory = 'invalid-category';
      const mockError = new Error('Categoria não encontrada');
      serviceService.findByCategory.mockRejectedValue(mockError);

      await expect(
        serviceController.findByCategory(invalidCategory),
      ).rejects.toThrow(mockError);
      expect(serviceService.findByCategory).toHaveBeenCalledWith(
        invalidCategory,
      );
    });
  });

  describe('update', () => {
    it('TC0001 - Should update service successfully', async () => {
      const updatedService = {
        ...mockServiceData,
        name: mockUpdateServiceDto.name || mockServiceData.name,
        description: mockUpdateServiceDto.description || null,
        price: mockUpdateServiceDto.price
          ? new Decimal(mockUpdateServiceDto.price)
          : mockServiceData.price,
        estimatedMinutes:
          mockUpdateServiceDto.estimatedMinutes ||
          mockServiceData.estimatedMinutes,
      };
      serviceService.update.mockResolvedValue(updatedService);

      const result = await serviceController.update(
        mockServiceId,
        mockUpdateServiceDto,
      );

      expect(serviceService.update).toHaveBeenCalledWith(
        mockServiceId,
        mockUpdateServiceDto,
      );
      expect(result).toEqual(updatedService);
    });

    it('TC0002 - Should throw error when service not found for update', async () => {
      const mockError = new Error('Serviço não encontrado');
      serviceService.update.mockRejectedValue(mockError);

      await expect(
        serviceController.update(mockServiceId, mockUpdateServiceDto),
      ).rejects.toThrow(mockError);
      expect(serviceService.update).toHaveBeenCalledWith(
        mockServiceId,
        mockUpdateServiceDto,
      );
    });

    it('TC0003 - Should handle duplicate service name error during update', async () => {
      const mockError = new Error('Nome do serviço já existe');
      serviceService.update.mockRejectedValue(mockError);

      await expect(
        serviceController.update(mockServiceId, mockUpdateServiceDto),
      ).rejects.toThrow(mockError);
      expect(serviceService.update).toHaveBeenCalledWith(
        mockServiceId,
        mockUpdateServiceDto,
      );
    });
  });

  describe('remove', () => {
    it('TC0001 - Should remove service successfully', async () => {
      const removedService = { ...mockServiceData, isActive: false };
      serviceService.remove.mockResolvedValue(removedService);

      const result = await serviceController.remove(mockServiceId);

      expect(serviceService.remove).toHaveBeenCalledWith(mockServiceId);
      expect(result).toEqual(removedService);
    });

    it('TC0002 - Should throw error when service not found for removal', async () => {
      const mockError = new Error('Serviço não encontrado');
      serviceService.remove.mockRejectedValue(mockError);

      await expect(serviceController.remove(mockServiceId)).rejects.toThrow(
        mockError,
      );
      expect(serviceService.remove).toHaveBeenCalledWith(mockServiceId);
    });

    it('TC0003 - Should handle service already inactive', async () => {
      const mockError = new Error('Serviço já está inativo');
      serviceService.remove.mockRejectedValue(mockError);

      await expect(serviceController.remove(mockServiceId)).rejects.toThrow(
        mockError,
      );
      expect(serviceService.remove).toHaveBeenCalledWith(mockServiceId);
    });
  });
});
