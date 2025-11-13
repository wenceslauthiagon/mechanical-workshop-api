import { faker } from '@faker-js/faker/locale/pt_BR';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';

import { VehicleController } from '../../../../src/workshop/1-presentation/controllers/vehicle.controller';
import { VehicleService } from '../../../../src/workshop/2-application/services/vehicle.service';
import { CreateVehicleDto } from '../../../../src/workshop/1-presentation/dtos/vehicle/create-vehicle.dto';
import { UpdateVehicleDto } from '../../../../src/workshop/1-presentation/dtos/vehicle/update-vehicle.dto';
import { VehicleResponseDto } from '../../../../src/workshop/1-presentation/dtos/vehicle/vehicle-response.dto';

describe('VehicleController', () => {
  let vehicleController: VehicleController;
  let vehicleService: jest.Mocked<VehicleService>;

  const mockVehicleId = uuidv4();
  const mockCustomerId = uuidv4();
  const mockLicensePlate = 'ABC-1234';

  const mockVehicleData: VehicleResponseDto = {
    id: mockVehicleId,
    licensePlate: mockLicensePlate,
    brand: faker.vehicle.manufacturer(),
    model: faker.vehicle.model(),
    year: faker.date.past().getFullYear(),
    color: faker.vehicle.color(),
    customerId: mockCustomerId,
    customer: {
      id: mockCustomerId,
      name: faker.person.fullName(),
      document: faker.string.numeric(11),
      email: faker.internet.email(),
      phone: faker.phone.number(),
    },
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const mockCreateVehicleDto: CreateVehicleDto = {
    licensePlate: 'XYZ-5678',
    brand: faker.vehicle.manufacturer(),
    model: faker.vehicle.model(),
    year: faker.date.past().getFullYear(),
    color: faker.vehicle.color(),
    customerId: mockCustomerId,
  };

  const mockUpdateVehicleDto: UpdateVehicleDto = {
    brand: faker.vehicle.manufacturer(),
    model: faker.vehicle.model(),
    year: faker.date.past().getFullYear(),
    color: faker.vehicle.color(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [
        {
          provide: VehicleService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findAllPaginated: jest.fn(),
            findById: jest.fn(),
            findByCustomerId: jest.fn(),
            findByLicensePlate: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    vehicleController = module.get<VehicleController>(VehicleController);
    vehicleService = module.get(VehicleService);
  });

  it('Should be defined', () => {
    expect(vehicleController).toBeDefined();
    expect(vehicleController).toBeInstanceOf(VehicleController);
  });

  it('Should instantiate with service dependency', () => {
    const controller = new VehicleController(vehicleService);
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('TC0001 - Should create a vehicle successfully', async () => {
      const createdVehicle = { ...mockVehicleData, ...mockCreateVehicleDto };
      vehicleService.create.mockResolvedValue(createdVehicle);

      const result = await vehicleController.create(mockCreateVehicleDto);

      expect(vehicleService.create).toHaveBeenCalledWith(mockCreateVehicleDto);
      expect(result).toEqual(createdVehicle);
    });

    it('TC0002 - Should throw error when creating vehicle fails', async () => {
      const mockError = new Error('Falha ao criar veículo');
      vehicleService.create.mockRejectedValue(mockError);

      await expect(
        vehicleController.create(mockCreateVehicleDto),
      ).rejects.toThrow(mockError);
      expect(vehicleService.create).toHaveBeenCalledWith(mockCreateVehicleDto);
    });

    it('TC0003 - Should handle duplicate license plate error', async () => {
      const mockError = new Error('Placa já cadastrada');
      vehicleService.create.mockRejectedValue(mockError);

      await expect(
        vehicleController.create(mockCreateVehicleDto),
      ).rejects.toThrow(mockError);
      expect(vehicleService.create).toHaveBeenCalledWith(mockCreateVehicleDto);
    });
  });

  describe('findAll', () => {
    it('TC0001 - Should return all vehicles successfully', async () => {
      const mockVehicles = [mockVehicleData];
      vehicleService.findAll.mockResolvedValue(mockVehicles);

      const result = await vehicleController.findAll();

      expect(vehicleService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockVehicles);
    });

    it('TC0001a - Should return paginated vehicles', async () => {
      const paginationDto = { page: 1, size: 10, skip: 0, take: 10 };
      const mockPaginatedResponse = {
        data: [mockVehicleData],
        pagination: { page: 1, size: 10, totalPages: 1, totalRecords: 1 },
      };
      vehicleService.findAllPaginated.mockResolvedValue(mockPaginatedResponse);

      const result = await vehicleController.findAllPaginated(paginationDto);

      expect(vehicleService.findAllPaginated).toHaveBeenCalledWith(
        paginationDto,
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('TC0002 - Should return empty array when no vehicles found', async () => {
      vehicleService.findAll.mockResolvedValue([]);

      const result = await vehicleController.findAll();

      expect(vehicleService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('TC0003 - Should throw error when findAll fails', async () => {
      const mockError = new Error('Falha ao listar veículos');
      vehicleService.findAll.mockRejectedValue(mockError);

      await expect(vehicleController.findAll()).rejects.toThrow(mockError);
      expect(vehicleService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('TC0001 - Should find vehicle by ID successfully', async () => {
      vehicleService.findById.mockResolvedValue(mockVehicleData);

      const result = await vehicleController.findOne(mockVehicleId);

      expect(vehicleService.findById).toHaveBeenCalledWith(mockVehicleId);
      expect(result).toEqual(mockVehicleData);
    });

    it('TC0002 - Should throw error when vehicle not found by ID', async () => {
      const mockError = new Error('Veículo não encontrado');
      vehicleService.findById.mockRejectedValue(mockError);

      await expect(vehicleController.findOne(mockVehicleId)).rejects.toThrow(
        mockError,
      );
      expect(vehicleService.findById).toHaveBeenCalledWith(mockVehicleId);
    });

    it('TC0003 - Should handle invalid UUID format', async () => {
      const invalidId = 'invalid-uuid';
      const mockError = new Error('ID inválido');
      vehicleService.findById.mockRejectedValue(mockError);

      await expect(vehicleController.findOne(invalidId)).rejects.toThrow(
        mockError,
      );
      expect(vehicleService.findById).toHaveBeenCalledWith(invalidId);
    });
  });

  describe('findByCustomer', () => {
    it('TC0001 - Should find vehicles by customer successfully', async () => {
      const mockVehicles = [mockVehicleData];
      vehicleService.findByCustomerId.mockResolvedValue(mockVehicles);

      const result = await vehicleController.findByCustomer(mockCustomerId);

      expect(vehicleService.findByCustomerId).toHaveBeenCalledWith(
        mockCustomerId,
      );
      expect(result).toEqual(mockVehicles);
    });

    it('TC0002 - Should return empty array when customer has no vehicles', async () => {
      vehicleService.findByCustomerId.mockResolvedValue([]);

      const result = await vehicleController.findByCustomer(mockCustomerId);

      expect(vehicleService.findByCustomerId).toHaveBeenCalledWith(
        mockCustomerId,
      );
      expect(result).toEqual([]);
    });

    it('TC0003 - Should throw error when customer not found', async () => {
      const mockError = new Error('Cliente não encontrado');
      vehicleService.findByCustomerId.mockRejectedValue(mockError);

      await expect(
        vehicleController.findByCustomer(mockCustomerId),
      ).rejects.toThrow(mockError);
      expect(vehicleService.findByCustomerId).toHaveBeenCalledWith(
        mockCustomerId,
      );
    });
  });

  describe('findByPlate', () => {
    it('TC0001 - Should find vehicle by license plate successfully', async () => {
      vehicleService.findByLicensePlate.mockResolvedValue(mockVehicleData);

      const result = await vehicleController.findByPlate(mockLicensePlate);

      expect(vehicleService.findByLicensePlate).toHaveBeenCalledWith(
        mockLicensePlate,
      );
      expect(result).toEqual(mockVehicleData);
    });

    it('TC0002 - Should throw error when vehicle not found by plate', async () => {
      const mockError = new Error('Veículo não encontrado');
      vehicleService.findByLicensePlate.mockRejectedValue(mockError);

      await expect(
        vehicleController.findByPlate(mockLicensePlate),
      ).rejects.toThrow(mockError);
      expect(vehicleService.findByLicensePlate).toHaveBeenCalledWith(
        mockLicensePlate,
      );
    });

    it('TC0003 - Should handle invalid license plate format', async () => {
      const invalidPlate = 'invalid-plate';
      const mockError = new Error('Placa inválida');
      vehicleService.findByLicensePlate.mockRejectedValue(mockError);

      await expect(vehicleController.findByPlate(invalidPlate)).rejects.toThrow(
        mockError,
      );
      expect(vehicleService.findByLicensePlate).toHaveBeenCalledWith(
        invalidPlate,
      );
    });
  });

  describe('update', () => {
    it('TC0001 - Should update vehicle successfully', async () => {
      const updatedVehicle = { ...mockVehicleData, ...mockUpdateVehicleDto };
      vehicleService.update.mockResolvedValue(updatedVehicle);

      const result = await vehicleController.update(
        mockVehicleId,
        mockUpdateVehicleDto,
      );

      expect(vehicleService.update).toHaveBeenCalledWith(
        mockVehicleId,
        mockUpdateVehicleDto,
      );
      expect(result).toEqual(updatedVehicle);
    });

    it('TC0002 - Should throw error when vehicle not found for update', async () => {
      const mockError = new Error('Veículo não encontrado');
      vehicleService.update.mockRejectedValue(mockError);

      await expect(
        vehicleController.update(mockVehicleId, mockUpdateVehicleDto),
      ).rejects.toThrow(mockError);
      expect(vehicleService.update).toHaveBeenCalledWith(
        mockVehicleId,
        mockUpdateVehicleDto,
      );
    });

    it('TC0003 - Should handle duplicate license plate error during update', async () => {
      const updateWithPlate = {
        ...mockUpdateVehicleDto,
        licensePlate: 'DEF-9999',
      };
      const mockError = new Error('Placa já cadastrada');
      vehicleService.update.mockRejectedValue(mockError);

      await expect(
        vehicleController.update(mockVehicleId, updateWithPlate),
      ).rejects.toThrow(mockError);
      expect(vehicleService.update).toHaveBeenCalledWith(
        mockVehicleId,
        updateWithPlate,
      );
    });
  });

  describe('remove', () => {
    it('TC0001 - Should remove vehicle successfully', async () => {
      vehicleService.remove.mockResolvedValue();

      await vehicleController.remove(mockVehicleId);

      expect(vehicleService.remove).toHaveBeenCalledWith(mockVehicleId);
    });

    it('TC0002 - Should throw error when vehicle not found for removal', async () => {
      const mockError = new Error('Veículo não encontrado');
      vehicleService.remove.mockRejectedValue(mockError);

      await expect(vehicleController.remove(mockVehicleId)).rejects.toThrow(
        mockError,
      );
      expect(vehicleService.remove).toHaveBeenCalledWith(mockVehicleId);
    });

    it('TC0003 - Should handle conflict when vehicle has service orders', async () => {
      const mockError = new Error(
        'Veículo possui ordens de serviço vinculadas',
      );
      vehicleService.remove.mockRejectedValue(mockError);

      await expect(vehicleController.remove(mockVehicleId)).rejects.toThrow(
        mockError,
      );
      expect(vehicleService.remove).toHaveBeenCalledWith(mockVehicleId);
    });
  });
});
