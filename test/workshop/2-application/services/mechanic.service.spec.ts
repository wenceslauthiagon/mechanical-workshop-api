import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { MechanicService } from '../../../../src/workshop/2-application/services/mechanic.service';
import { ErrorHandlerService } from '../../../../src/shared/services/error-handler.service';
import { MECHANIC_CONSTANTS } from '../../../../src/shared/constants/mechanic.constants';

describe('MechanicService', () => {
  let service: MechanicService;
  let mechanicRepository: any;
  let errorHandler: any;

  const mockMechanic = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    specialties: ['Motor', 'Freios'],
    isAvailable: true,
    hireDate: faker.date.past(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    _count: {
      serviceOrders: 5,
    },
  };

  const mockMechanic2 = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    specialties: ['Motor', 'Freios'],
    isAvailable: true,
    hireDate: faker.date.past(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    _count: {
      serviceOrders: 3,
    },
  };

  const createMechanicDto = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    specialties: ['Motor', 'Transmissão'],
    hireDate: new Date(),
  };

  const mockWorkload = {
    activeOrders: 2,
    completedThisMonth: 10,
    averageCompletionTime: 48,
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAvailable: jest.fn(),
      findBySpecialty: jest.fn(),
      update: jest.fn(),
      toggleAvailability: jest.fn(),
      delete: jest.fn(),
      getWorkload: jest.fn(),
      assignToServiceOrder: jest.fn(),
      markAsUnavailable: jest.fn(),
      releaseFromServiceOrder: jest.fn(),
    };

    const mockErrorHandler = {
      handleError: jest.fn().mockImplementation((error) => {
        throw error;
      }),
      handleNotFoundError: jest.fn().mockImplementation((message) => {
        throw new Error(message);
      }),
      handleConflictError: jest.fn().mockImplementation((message) => {
        throw new Error(message);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MechanicService,
        { provide: 'IMechanicRepository', useValue: mockRepository },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
      ],
    }).compile();

    service = module.get<MechanicService>(MechanicService);
    mechanicRepository = module.get('IMechanicRepository');
    errorHandler = module.get(ErrorHandlerService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      mechanicRepository.findByEmail.mockResolvedValue(null);
      mechanicRepository.create.mockResolvedValue(mockMechanic);
      mechanicRepository.findById.mockResolvedValue(mockMechanic);
    });

    it('TC0001 - Should create mechanic successfully', async () => {
      const result = await service.create(createMechanicDto);

      expect(result).toEqual(mockMechanic);
      expect(mechanicRepository.findByEmail).toHaveBeenCalledWith(
        createMechanicDto.email,
      );
      expect(mechanicRepository.create).toHaveBeenCalledWith(createMechanicDto);
      expect(mechanicRepository.findById).toHaveBeenCalledWith(mockMechanic.id);
    });

    it('TC0002 - Should throw error when email already exists', async () => {
      mechanicRepository.findByEmail.mockResolvedValue(mockMechanic);

      await expect(service.create(createMechanicDto)).rejects.toThrow(
        MECHANIC_CONSTANTS.MESSAGES.EMAIL_ALREADY_EXISTS,
      );
      expect(errorHandler.handleConflictError).toHaveBeenCalledWith(
        MECHANIC_CONSTANTS.MESSAGES.EMAIL_ALREADY_EXISTS,
      );
    });

    it('TC0003 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      mechanicRepository.create.mockRejectedValue(error);

      await expect(service.create(createMechanicDto)).rejects.toThrow(
        'DB error',
      );
      expect(errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('findAll', () => {
    it('TC0001 - Should return all mechanics', async () => {
      const mechanics = [mockMechanic, mockMechanic2];
      mechanicRepository.findAll.mockResolvedValue(mechanics);

      const result = await service.findAll();

      expect(result).toEqual(mechanics);
      expect(mechanicRepository.findAll).toHaveBeenCalled();
    });

    it('TC0002 - Should return empty array when no mechanics exist', async () => {
      mechanicRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('TC0003 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      mechanicRepository.findAll.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow('DB error');
      expect(errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('findAllPaginated', () => {
    it('TC0001 - Should return paginated mechanics', async () => {
      const mechanics = [mockMechanic];
      const paginationDto = { page: 0, size: 10, skip: 0, take: 10 };
      mechanicRepository.findMany.mockResolvedValue(mechanics);
      mechanicRepository.count.mockResolvedValue(1);

      const result = await service.findAllPaginated(paginationDto);

      expect(mechanicRepository.findMany).toHaveBeenCalledWith(0, 10);
      expect(mechanicRepository.count).toHaveBeenCalled();
      expect(result.data).toEqual(mechanics);
      expect(result.pagination.totalRecords).toBe(1);
    });

    it('TC0002 - Should handle errors', async () => {
      const paginationDto = { page: 0, size: 10, skip: 0, take: 10 };
      const error = new Error('DB error');
      mechanicRepository.findMany.mockRejectedValue(error);

      await expect(service.findAllPaginated(paginationDto)).rejects.toThrow(
        'DB error',
      );
    });
  });

  describe('findById', () => {
    it('TC0001 - Should return mechanic by id', async () => {
      mechanicRepository.findById.mockResolvedValue(mockMechanic);

      const result = await service.findById(mockMechanic.id);

      expect(result).toEqual(mockMechanic);
      expect(mechanicRepository.findById).toHaveBeenCalledWith(mockMechanic.id);
    });

    it('TC0002 - Should throw error when mechanic not found', async () => {
      mechanicRepository.findById.mockResolvedValue(null);

      await expect(service.findById('invalid-id')).rejects.toThrow(
        MECHANIC_CONSTANTS.MESSAGES.NOT_FOUND,
      );
      expect(errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        MECHANIC_CONSTANTS.MESSAGES.NOT_FOUND,
      );
    });

    it('TC0003 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      mechanicRepository.findById.mockRejectedValue(error);

      await expect(service.findById(mockMechanic.id)).rejects.toThrow(
        'DB error',
      );
      expect(errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('findAvailable', () => {
    it('TC0001 - Should return available mechanics', async () => {
      const availableMechanics = [mockMechanic, mockMechanic2];
      mechanicRepository.findAvailable.mockResolvedValue(availableMechanics);

      const result = await service.findAvailable();

      expect(result).toEqual(availableMechanics);
      expect(mechanicRepository.findAvailable).toHaveBeenCalled();
    });

    it('TC0002 - Should return empty array when no mechanics are available', async () => {
      mechanicRepository.findAvailable.mockResolvedValue([]);

      const result = await service.findAvailable();

      expect(result).toEqual([]);
    });

    it('TC0003 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      mechanicRepository.findAvailable.mockRejectedValue(error);

      await expect(service.findAvailable()).rejects.toThrow('DB error');
      expect(errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('findBySpecialty', () => {
    it('TC0001 - Should return mechanics by specialty', async () => {
      const specialty = 'Motor';
      const mechanics = [mockMechanic];
      mechanicRepository.findBySpecialty.mockResolvedValue(mechanics);

      const result = await service.findBySpecialty(specialty);

      expect(result).toEqual(mechanics);
      expect(mechanicRepository.findBySpecialty).toHaveBeenCalledWith(
        specialty,
      );
    });

    it('TC0002 - Should return empty array when no mechanics have the specialty', async () => {
      mechanicRepository.findBySpecialty.mockResolvedValue([]);

      const result = await service.findBySpecialty('Elétrica');

      expect(result).toEqual([]);
    });

    it('TC0003 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      mechanicRepository.findBySpecialty.mockRejectedValue(error);

      await expect(service.findBySpecialty('Motor')).rejects.toThrow(
        'DB error',
      );
      expect(errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Nome Atualizado',
      phone: '11999999999',
    };

    beforeEach(() => {
      mechanicRepository.findById.mockResolvedValue(mockMechanic);
      mechanicRepository.update.mockResolvedValue({
        ...mockMechanic,
        ...updateDto,
      });
    });

    it('TC0001 - Should update mechanic successfully', async () => {
      const updatedMechanic = { ...mockMechanic, ...updateDto };
      mechanicRepository.findById
        .mockResolvedValueOnce(mockMechanic)
        .mockResolvedValueOnce(updatedMechanic);

      const result = await service.update(mockMechanic.id, updateDto);

      expect(result).toEqual(updatedMechanic);
      expect(mechanicRepository.update).toHaveBeenCalledWith(
        mockMechanic.id,
        updateDto,
      );
    });

    it('TC0002 - Should throw error when mechanic not found', async () => {
      mechanicRepository.findById.mockResolvedValue(null);

      await expect(service.update('invalid-id', updateDto)).rejects.toThrow(
        MECHANIC_CONSTANTS.MESSAGES.NOT_FOUND,
      );
      expect(errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        MECHANIC_CONSTANTS.MESSAGES.NOT_FOUND,
      );
    });

    it('TC0003 - Should update email when new email is different', async () => {
      const dtoWithEmail = { ...updateDto, email: 'novo@email.com' };
      mechanicRepository.findByEmail.mockResolvedValue(null);

      await service.update(mockMechanic.id, dtoWithEmail);

      expect(mechanicRepository.findByEmail).toHaveBeenCalledWith(
        'novo@email.com',
      );
      expect(mechanicRepository.update).toHaveBeenCalled();
    });

    it('TC0004 - Should throw error when new email already exists', async () => {
      const dtoWithEmail = { ...updateDto, email: 'existente@email.com' };
      const existingMechanic = {
        ...mockMechanic,
        id: 'another-id',
        email: 'existente@email.com',
      };
      mechanicRepository.findByEmail.mockResolvedValue(existingMechanic);

      await expect(
        service.update(mockMechanic.id, dtoWithEmail),
      ).rejects.toThrow(MECHANIC_CONSTANTS.MESSAGES.EMAIL_ALREADY_EXISTS);
      expect(errorHandler.handleConflictError).toHaveBeenCalledWith(
        MECHANIC_CONSTANTS.MESSAGES.EMAIL_ALREADY_EXISTS,
      );
    });

    it('TC0005 - Should not throw error when email belongs to same mechanic', async () => {
      const dtoWithEmail = { ...updateDto, email: 'email@test.com' };
      const existingMechanic = {
        ...mockMechanic,
        email: 'email@test.com',
      };
      mechanicRepository.findByEmail.mockResolvedValue(existingMechanic);
      mechanicRepository.findById
        .mockResolvedValueOnce(mockMechanic)
        .mockResolvedValueOnce({ ...mockMechanic, ...dtoWithEmail });

      const result = await service.update(mockMechanic.id, dtoWithEmail);

      expect(result).toBeDefined();
      expect(mechanicRepository.update).toHaveBeenCalled();
    });

    it('TC0006 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      mechanicRepository.update.mockRejectedValue(error);

      await expect(service.update(mockMechanic.id, updateDto)).rejects.toThrow(
        'DB error',
      );
      expect(errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('toggleAvailability', () => {
    it('TC0001 - Should toggle mechanic availability', async () => {
      const unavailableMechanic = { ...mockMechanic, isAvailable: false };
      mechanicRepository.findById
        .mockResolvedValueOnce(mockMechanic)
        .mockResolvedValueOnce(unavailableMechanic);
      mechanicRepository.toggleAvailability.mockResolvedValue(
        unavailableMechanic,
      );

      const result = await service.toggleAvailability(mockMechanic.id);

      expect(result).toEqual(unavailableMechanic);
      expect(mechanicRepository.toggleAvailability).toHaveBeenCalledWith(
        mockMechanic.id,
      );
    });

    it('TC0002 - Should throw error when mechanic not found', async () => {
      mechanicRepository.findById.mockResolvedValue(null);

      await expect(service.toggleAvailability('invalid-id')).rejects.toThrow(
        MECHANIC_CONSTANTS.MESSAGES.NOT_FOUND,
      );
    });

    it('TC0003 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      mechanicRepository.findById.mockResolvedValue(mockMechanic);
      mechanicRepository.toggleAvailability.mockRejectedValue(error);

      await expect(service.toggleAvailability(mockMechanic.id)).rejects.toThrow(
        'DB error',
      );
      expect(errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('delete', () => {
    it('TC0001 - Should delete mechanic successfully', async () => {
      mechanicRepository.findById.mockResolvedValue(mockMechanic);
      mechanicRepository.delete.mockResolvedValue(undefined);

      await service.delete(mockMechanic.id);

      expect(mechanicRepository.delete).toHaveBeenCalledWith(mockMechanic.id);
    });

    it('TC0002 - Should throw error when mechanic not found', async () => {
      mechanicRepository.findById.mockResolvedValue(null);

      await expect(service.delete('invalid-id')).rejects.toThrow(
        MECHANIC_CONSTANTS.MESSAGES.NOT_FOUND,
      );
      expect(mechanicRepository.delete).not.toHaveBeenCalled();
    });

    it('TC0003 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      mechanicRepository.findById.mockResolvedValue(mockMechanic);
      mechanicRepository.delete.mockRejectedValue(error);

      await expect(service.delete(mockMechanic.id)).rejects.toThrow('DB error');
      expect(errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('getWorkload', () => {
    it('TC0001 - Should return mechanic workload', async () => {
      mechanicRepository.findById.mockResolvedValue(mockMechanic);
      mechanicRepository.getWorkload.mockResolvedValue(mockWorkload);

      const result = await service.getWorkload(mockMechanic.id);

      expect(result).toEqual(mockWorkload);
      expect(mechanicRepository.getWorkload).toHaveBeenCalledWith(
        mockMechanic.id,
      );
    });

    it('TC0002 - Should throw error when mechanic not found', async () => {
      mechanicRepository.findById.mockResolvedValue(null);

      await expect(service.getWorkload('invalid-id')).rejects.toThrow(
        MECHANIC_CONSTANTS.MESSAGES.NOT_FOUND,
      );
      expect(mechanicRepository.getWorkload).not.toHaveBeenCalled();
    });

    it('TC0003 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      mechanicRepository.findById.mockResolvedValue(mockMechanic);
      mechanicRepository.getWorkload.mockRejectedValue(error);

      await expect(service.getWorkload(mockMechanic.id)).rejects.toThrow(
        'DB error',
      );
      expect(errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('assignToServiceOrder', () => {
    const serviceOrderId = faker.string.uuid();

    it('TC0001 - Should assign mechanic to service order', async () => {
      mechanicRepository.findById.mockResolvedValue(mockMechanic);
      mechanicRepository.assignToServiceOrder.mockResolvedValue(undefined);

      await service.assignToServiceOrder(mockMechanic.id, serviceOrderId);

      expect(mechanicRepository.assignToServiceOrder).toHaveBeenCalledWith(
        mockMechanic.id,
        serviceOrderId,
      );
    });

    it('TC0002 - Should throw error when mechanic not found', async () => {
      mechanicRepository.findById.mockResolvedValue(null);

      await expect(
        service.assignToServiceOrder('invalid-id', serviceOrderId),
      ).rejects.toThrow(MECHANIC_CONSTANTS.MESSAGES.NOT_FOUND);
      expect(mechanicRepository.assignToServiceOrder).not.toHaveBeenCalled();
    });

    it('TC0003 - Should throw error when mechanic is not available', async () => {
      const unavailableMechanic = { ...mockMechanic, isAvailable: false };
      mechanicRepository.findById.mockResolvedValue(unavailableMechanic);

      await expect(
        service.assignToServiceOrder(mockMechanic.id, serviceOrderId),
      ).rejects.toThrow(MECHANIC_CONSTANTS.MESSAGES.NOT_AVAILABLE);
      expect(errorHandler.handleConflictError).toHaveBeenCalledWith(
        MECHANIC_CONSTANTS.MESSAGES.NOT_AVAILABLE,
      );
      expect(mechanicRepository.assignToServiceOrder).not.toHaveBeenCalled();
    });

    it('TC0004 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      mechanicRepository.findById.mockResolvedValue(mockMechanic);
      mechanicRepository.assignToServiceOrder.mockRejectedValue(error);

      await expect(
        service.assignToServiceOrder(mockMechanic.id, serviceOrderId),
      ).rejects.toThrow('DB error');
      expect(errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('markAsUnavailable', () => {
    it('TC0001 - Should mark mechanic as unavailable', async () => {
      mechanicRepository.findById.mockResolvedValue(mockMechanic);
      mechanicRepository.markAsUnavailable.mockResolvedValue(undefined);

      await service.markAsUnavailable(mockMechanic.id);

      expect(mechanicRepository.markAsUnavailable).toHaveBeenCalledWith(
        mockMechanic.id,
      );
    });

    it('TC0002 - Should throw error when mechanic not found', async () => {
      mechanicRepository.findById.mockResolvedValue(null);

      await expect(service.markAsUnavailable('invalid-id')).rejects.toThrow(
        MECHANIC_CONSTANTS.MESSAGES.NOT_FOUND,
      );
      expect(mechanicRepository.markAsUnavailable).not.toHaveBeenCalled();
    });

    it('TC0003 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      mechanicRepository.findById.mockResolvedValue(mockMechanic);
      mechanicRepository.markAsUnavailable.mockRejectedValue(error);

      await expect(service.markAsUnavailable(mockMechanic.id)).rejects.toThrow(
        'DB error',
      );
      expect(errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('releaseFromServiceOrder', () => {
    it('TC0001 - Should release mechanic from service order', async () => {
      mechanicRepository.findById.mockResolvedValue(mockMechanic);
      mechanicRepository.releaseFromServiceOrder.mockResolvedValue(undefined);

      await service.releaseFromServiceOrder(mockMechanic.id);

      expect(mechanicRepository.releaseFromServiceOrder).toHaveBeenCalledWith(
        mockMechanic.id,
      );
    });

    it('TC0002 - Should throw error when mechanic not found', async () => {
      mechanicRepository.findById.mockResolvedValue(null);

      await expect(
        service.releaseFromServiceOrder('invalid-id'),
      ).rejects.toThrow(MECHANIC_CONSTANTS.MESSAGES.NOT_FOUND);
      expect(mechanicRepository.releaseFromServiceOrder).not.toHaveBeenCalled();
    });

    it('TC0003 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      mechanicRepository.findById.mockResolvedValue(mockMechanic);
      mechanicRepository.releaseFromServiceOrder.mockRejectedValue(error);

      await expect(
        service.releaseFromServiceOrder(mockMechanic.id),
      ).rejects.toThrow('DB error');
      expect(errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('findBestMechanicForService', () => {
    const requiredSpecialties = ['Motor', 'Freios'];

    beforeEach(() => {
      mechanicRepository.findAll.mockResolvedValue([
        mockMechanic,
        mockMechanic2,
      ]);
    });

    it('TC0001 - Should return mechanic with lowest workload', async () => {
      mechanicRepository.getWorkload
        .mockResolvedValueOnce({
          activeOrders: 5,
          completedThisMonth: 10,
          averageCompletionTime: 48,
        })
        .mockResolvedValueOnce({
          activeOrders: 3,
          completedThisMonth: 8,
          averageCompletionTime: 36,
        });

      const result =
        await service.findBestMechanicForService(requiredSpecialties);

      expect(result).toBeDefined();
      expect(result?.specialties).toContain('Motor');
      expect(result?.specialties).toContain('Freios');
      expect(result?.isAvailable).toBe(true);
      expect(mechanicRepository.getWorkload).toHaveBeenCalledTimes(2);
    });

    it('TC0002 - Should return null when no mechanics have required specialties', async () => {
      mechanicRepository.findAll.mockResolvedValue([
        { ...mockMechanic, specialties: ['Suspensão'] },
        { ...mockMechanic2, specialties: ['Elétrica'] },
      ]);

      const result =
        await service.findBestMechanicForService(requiredSpecialties);

      expect(result).toBeNull();
      expect(mechanicRepository.getWorkload).not.toHaveBeenCalled();
    });

    it('TC0003 - Should return null when no mechanics are available', async () => {
      mechanicRepository.findAll.mockResolvedValue([
        { ...mockMechanic, isAvailable: false },
        { ...mockMechanic2, isAvailable: false },
      ]);

      const result =
        await service.findBestMechanicForService(requiredSpecialties);

      expect(result).toBeNull();
      expect(mechanicRepository.getWorkload).not.toHaveBeenCalled();
    });

    it('TC0004 - Should filter unavailable mechanics', async () => {
      mechanicRepository.findAll.mockResolvedValue([
        mockMechanic,
        { ...mockMechanic2, isAvailable: false },
      ]);
      mechanicRepository.getWorkload.mockResolvedValue({
        activeOrders: 2,
        completedThisMonth: 5,
        averageCompletionTime: 24,
      });

      const result =
        await service.findBestMechanicForService(requiredSpecialties);

      expect(result).toBeDefined();
      expect(result?.id).toBe(mockMechanic.id);
      expect(mechanicRepository.getWorkload).toHaveBeenCalledTimes(1);
    });

    it('TC0005 - Should filter mechanics without all required specialties', async () => {
      mechanicRepository.findAll.mockResolvedValue([
        { ...mockMechanic, specialties: ['Motor'] },
        { ...mockMechanic2, specialties: ['Motor', 'Freios'] },
      ]);
      mechanicRepository.getWorkload.mockResolvedValue({
        activeOrders: 1,
        completedThisMonth: 4,
        averageCompletionTime: 12,
      });

      const result =
        await service.findBestMechanicForService(requiredSpecialties);

      expect(result).toBeDefined();
      expect(result?.id).toBe(mockMechanic2.id);
      expect(mechanicRepository.getWorkload).toHaveBeenCalledTimes(1);
    });

    it('TC0006 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      mechanicRepository.findAll.mockRejectedValue(error);

      await expect(
        service.findBestMechanicForService(requiredSpecialties),
      ).rejects.toThrow('DB error');
      expect(errorHandler.handleError).toHaveBeenCalledWith(error);
    });

    it('TC0007 - Should return mechanic when only one matches all criteria', async () => {
      mechanicRepository.findAll.mockResolvedValue([mockMechanic]);
      mechanicRepository.getWorkload.mockResolvedValue({
        activeOrders: 1,
        completedThisMonth: 5,
        averageCompletionTime: 24,
      });

      const result =
        await service.findBestMechanicForService(requiredSpecialties);

      expect(result).toBeDefined();
      expect(result?.id).toBe(mockMechanic.id);
    });
  });
});
