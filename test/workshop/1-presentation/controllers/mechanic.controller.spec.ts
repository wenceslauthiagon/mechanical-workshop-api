import { faker } from '@faker-js/faker/locale/pt_BR';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';

import { MechanicController } from '../../../../src/workshop/1-presentation/controllers/mechanic.controller';
import { MechanicService } from '../../../../src/workshop/2-application/services/mechanic.service';
import { CreateMechanicDto } from '../../../../src/workshop/1-presentation/dtos/mechanic/create-mechanic.dto';
import { UpdateMechanicDto } from '../../../../src/workshop/1-presentation/dtos/mechanic/update-mechanic.dto';
import { MechanicResponseDto } from '../../../../src/workshop/1-presentation/dtos/mechanic/mechanic-response.dto';
import { SERVICE_ORDER_CONSTANTS } from '../../../../src/shared/constants/mechanic.constants';

describe('MechanicController', () => {
  let controller: MechanicController;
  let mechanicService: jest.Mocked<MechanicService>;

  const mockMechanicId = uuidv4();
  const mockServiceOrderId = uuidv4();

  const mockMechanic = {
    id: mockMechanicId,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    specialties: ['Motor', 'Freios'],
    experienceYears: faker.number.int({ min: 1, max: 20 }),
    isActive: true,
    isAvailable: true,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const mockCreateMechanicDto: CreateMechanicDto = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    specialties: ['Suspensão', 'Transmissão'],
    experienceYears: faker.number.int({ min: 1, max: 15 }),
  };

  const mockUpdateMechanicDto: UpdateMechanicDto = {
    name: faker.person.fullName(),
    phone: faker.phone.number(),
    experienceYears: faker.number.int({ min: 5, max: 25 }),
  };

  const mockWorkload = {
    mechanicId: mockMechanicId,
    activeOrders: 3,
    completedThisMonth: 12,
    averageCompletionTime: 4.5,
    currentCapacity: 75,
  };

  beforeEach(async () => {
    const mockMechanicService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findAvailable: jest.fn(),
      findBySpecialty: jest.fn(),
      findById: jest.fn(),
      getWorkload: jest.fn(),
      update: jest.fn(),
      toggleAvailability: jest.fn(),
      assignToServiceOrder: jest.fn(),
      findBestMechanicForService: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MechanicController],
      providers: [
        {
          provide: MechanicService,
          useValue: mockMechanicService,
        },
      ],
    }).compile();

    controller = module.get<MechanicController>(MechanicController);
    mechanicService = module.get<jest.Mocked<MechanicService>>(MechanicService);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(MechanicController);
    expect(mechanicService).toBeDefined();
  });

  it('Should instantiate controller with service dependency', () => {
    const mockService = {} as MechanicService;
    const testController = new MechanicController(mockService);
    expect(testController).toBeInstanceOf(MechanicController);
  });

  describe('create', () => {
    it('TC0001 - Should create a new mechanic successfully', async () => {
      mechanicService.create.mockResolvedValue(mockMechanic);

      const result = await controller.create(mockCreateMechanicDto);

      expect(mechanicService.create).toHaveBeenCalledWith(
        mockCreateMechanicDto,
      );
      expect(result).toBeInstanceOf(MechanicResponseDto);
      expect(result.id).toBe(mockMechanicId);
    });

    it('TC0002 - Should throw error when creation fails', async () => {
      const error = new Error('Creation failed');
      mechanicService.create.mockRejectedValue(error);

      await expect(controller.create(mockCreateMechanicDto)).rejects.toThrow(
        error,
      );
      expect(mechanicService.create).toHaveBeenCalledWith(
        mockCreateMechanicDto,
      );
    });
  });

  describe('findAll', () => {
    it('TC0001 - Should return list of all mechanics', async () => {
      const mockMechanics = [mockMechanic, { ...mockMechanic, id: uuidv4() }];
      mechanicService.findAll.mockResolvedValue(mockMechanics);

      const result = await controller.findAll();

      expect(mechanicService.findAll).toHaveBeenCalledWith();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(MechanicResponseDto);
    });

    it('TC0002 - Should return empty array when no mechanics found', async () => {
      mechanicService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(mechanicService.findAll).toHaveBeenCalledWith();
      expect(result).toHaveLength(0);
    });
  });

  describe('findAllPaginated', () => {
    it('TC0001 - Should return paginated mechanics', async () => {
      const mockMechanics = [mockMechanic, { ...mockMechanic, id: uuidv4() }];
      const paginationDto = { page: 0, size: 10 };
      const mockPaginatedResult = {
        data: mockMechanics,
        pagination: { page: 0, totalPages: 1, totalRecords: 2 },
      };

      mechanicService.findAllPaginated.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAllPaginated(paginationDto as any);

      expect(mechanicService.findAllPaginated).toHaveBeenCalledWith(
        paginationDto,
      );
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(MechanicResponseDto);
      expect(result.pagination.totalRecords).toBe(2);
    });

    it('TC0002 - Should return empty paginated result', async () => {
      const paginationDto = { page: 0, size: 10 };
      const mockPaginatedResult = {
        data: [],
        pagination: { page: 0, totalPages: 0, totalRecords: 0 },
      };

      mechanicService.findAllPaginated.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAllPaginated(paginationDto as any);

      expect(mechanicService.findAllPaginated).toHaveBeenCalledWith(
        paginationDto,
      );
      expect(result.data).toHaveLength(0);
      expect(result.pagination.totalRecords).toBe(0);
    });
  });

  describe('findAvailable', () => {
    it('TC0001 - Should return list of available mechanics', async () => {
      const availableMechanics = [mockMechanic];
      mechanicService.findAvailable.mockResolvedValue(availableMechanics);

      const result = await controller.findAvailable();

      expect(mechanicService.findAvailable).toHaveBeenCalledWith();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(MechanicResponseDto);
    });

    it('TC0002 - Should throw error when service fails', async () => {
      const error = new Error('Service error');
      mechanicService.findAvailable.mockRejectedValue(error);

      await expect(controller.findAvailable()).rejects.toThrow(error);
    });
  });

  describe('findBySpecialty', () => {
    it('TC0001 - Should return mechanics filtered by specialty', async () => {
      const specialty = 'Motor';
      mechanicService.findBySpecialty.mockResolvedValue([mockMechanic]);

      const result = await controller.findBySpecialty(specialty);

      expect(mechanicService.findBySpecialty).toHaveBeenCalledWith(specialty);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(MechanicResponseDto);
    });
  });

  describe('findOne', () => {
    it('TC0001 - Should return mechanic by ID', async () => {
      mechanicService.findById.mockResolvedValue(mockMechanic);

      const result = await controller.findOne(mockMechanicId);

      expect(mechanicService.findById).toHaveBeenCalledWith(mockMechanicId);
      expect(result).toBeInstanceOf(MechanicResponseDto);
      expect(result.id).toBe(mockMechanicId);
    });

    it('TC0002 - Should throw error when mechanic not found', async () => {
      const error = new Error('Mechanic not found');
      mechanicService.findById.mockRejectedValue(error);

      await expect(controller.findOne('invalid-id')).rejects.toThrow(error);
      expect(mechanicService.findById).toHaveBeenCalledWith('invalid-id');
    });
  });

  describe('getStats', () => {
    it('TC0001 - Should return mechanic stats', async () => {
      mechanicService.findById.mockResolvedValue(mockMechanic);

      const result = await controller.getStats(mockMechanicId);

      expect(mechanicService.findById).toHaveBeenCalledWith(mockMechanicId);
      expect(result).toBeInstanceOf(MechanicResponseDto);
    });
  });

  describe('getWorkload', () => {
    it('TC0001 - Should return mechanic workload information', async () => {
      mechanicService.getWorkload.mockResolvedValue(mockWorkload);

      const result = await controller.getWorkload(mockMechanicId);

      expect(mechanicService.getWorkload).toHaveBeenCalledWith(mockMechanicId);
      expect(result).toBe(mockWorkload);
    });
  });

  describe('update', () => {
    it('TC0001 - Should update mechanic successfully', async () => {
      const updatedMechanic = { ...mockMechanic, ...mockUpdateMechanicDto };
      mechanicService.update.mockResolvedValue(updatedMechanic);

      const result = await controller.update(
        mockMechanicId,
        mockUpdateMechanicDto,
      );

      expect(mechanicService.update).toHaveBeenCalledWith(
        mockMechanicId,
        mockUpdateMechanicDto,
      );
      expect(result).toBeInstanceOf(MechanicResponseDto);
    });

    it('TC0002 - Should throw error when update fails', async () => {
      const error = new Error('Update failed');
      mechanicService.update.mockRejectedValue(error);

      await expect(
        controller.update(mockMechanicId, mockUpdateMechanicDto),
      ).rejects.toThrow(error);
      expect(mechanicService.update).toHaveBeenCalledWith(
        mockMechanicId,
        mockUpdateMechanicDto,
      );
    });
  });

  describe('toggleAvailability', () => {
    it('TC0001 - Should toggle mechanic availability', async () => {
      const toggledMechanic = { ...mockMechanic, isAvailable: false };
      mechanicService.toggleAvailability.mockResolvedValue(toggledMechanic);

      const result = await controller.toggleAvailability(mockMechanicId);

      expect(mechanicService.toggleAvailability).toHaveBeenCalledWith(
        mockMechanicId,
      );
      expect(result).toBeInstanceOf(MechanicResponseDto);
    });
  });

  describe('assignToServiceOrder', () => {
    it('TC0001 - Should assign mechanic to service order', async () => {
      mechanicService.assignToServiceOrder.mockResolvedValue(undefined);

      const result = await controller.assignToServiceOrder(
        mockMechanicId,
        mockServiceOrderId,
      );

      expect(mechanicService.assignToServiceOrder).toHaveBeenCalledWith(
        mockMechanicId,
        mockServiceOrderId,
      );
      expect(result.message).toBe(
        SERVICE_ORDER_CONSTANTS.MESSAGES.MECHANIC_ASSIGNED,
      );
    });

    it('TC0002 - Should throw error when assignment fails', async () => {
      const error = new Error('Assignment failed');
      mechanicService.assignToServiceOrder.mockRejectedValue(error);

      await expect(
        controller.assignToServiceOrder(mockMechanicId, mockServiceOrderId),
      ).rejects.toThrow(error);
      expect(mechanicService.assignToServiceOrder).toHaveBeenCalledWith(
        mockMechanicId,
        mockServiceOrderId,
      );
    });
  });

  describe('findBestMechanicForService', () => {
    it('TC0001 - Should return best mechanic for given specialties', async () => {
      const specialties = 'Motor,Freios';
      mechanicService.findBestMechanicForService.mockResolvedValue(
        mockMechanic,
      );

      const result = await controller.findBestMechanicForService(specialties);

      expect(mechanicService.findBestMechanicForService).toHaveBeenCalledWith([
        'Motor',
        'Freios',
      ]);
      expect(result).toBeInstanceOf(MechanicResponseDto);
    });

    it('TC0002 - Should return null when no suitable mechanic found', async () => {
      const specialties = 'Specialty1,Specialty2';
      mechanicService.findBestMechanicForService.mockResolvedValue(null);

      const result = await controller.findBestMechanicForService(specialties);

      expect(mechanicService.findBestMechanicForService).toHaveBeenCalledWith([
        'Specialty1',
        'Specialty2',
      ]);
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('TC0001 - Should delete mechanic successfully', async () => {
      mechanicService.delete.mockResolvedValue(undefined);

      await controller.remove(mockMechanicId);

      expect(mechanicService.delete).toHaveBeenCalledWith(mockMechanicId);
    });

    it('TC0002 - Should throw error when deletion fails', async () => {
      const error = new Error('Deletion failed');
      mechanicService.delete.mockRejectedValue(error);

      await expect(controller.remove(mockMechanicId)).rejects.toThrow(error);
      expect(mechanicService.delete).toHaveBeenCalledWith(mockMechanicId);
    });
  });
});
