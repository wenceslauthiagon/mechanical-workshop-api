import { faker } from '@faker-js/faker/locale/pt_BR';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ServiceOrderStatus } from '@prisma/client';

import { PublicServiceOrderController } from '../../../../src/workshop/1-presentation/controllers/public-service-order.controller';
import { ServiceOrderService } from '../../../../src/workshop/2-application/services/service-order.service';

describe('PublicServiceOrderController', () => {
  let publicServiceOrderController: PublicServiceOrderController;
  let serviceOrderService: jest.Mocked<ServiceOrderService>;

  const mockOrderNumber = 'OS-2025-001';
  const mockDocument = '12345678901';
  const mockLicensePlate = 'ABC-1234';

  const mockServiceOrderData = {
    id: faker.string.uuid(),
    orderNumber: mockOrderNumber,
    customerId: faker.string.uuid(),
    vehicleId: faker.string.uuid(),
    description: faker.lorem.paragraph(),
    status: ServiceOrderStatus.EM_EXECUCAO,
    totalServicePrice: faker.number
      .float({ min: 100, max: 500, fractionDigits: 2 })
      .toFixed(2),
    totalPartsPrice: faker.number
      .float({ min: 50, max: 300, fractionDigits: 2 })
      .toFixed(2),
    totalPrice: faker.number
      .float({ min: 150, max: 800, fractionDigits: 2 })
      .toFixed(2),
    estimatedTimeHours: faker.number
      .float({ min: 1, max: 8, fractionDigits: 1 })
      .toFixed(1),
    estimatedCompletionDate: faker.date.future(),
    startedAt: faker.date.past(),
    completedAt: null,
    deliveredAt: null,
    approvedAt: faker.date.past(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    customer: {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      document: mockDocument,
      type: 'PESSOA_FISICA',
      email: faker.internet.email(),
      phone: faker.phone.number(),
    },
    vehicle: {
      id: faker.string.uuid(),
      licensePlate: mockLicensePlate,
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.date.past().getFullYear(),
      color: faker.vehicle.color(),
    },
    services: [],
    parts: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicServiceOrderController],
      providers: [
        {
          provide: ServiceOrderService,
          useValue: {
            findByOrderNumber: jest.fn(),
            findByCustomerDocument: jest.fn(),
            findByVehiclePlate: jest.fn(),
          },
        },
      ],
    }).compile();

    publicServiceOrderController = module.get<PublicServiceOrderController>(
      PublicServiceOrderController,
    );
    serviceOrderService = module.get(ServiceOrderService);
  });

  it('Should be defined', () => {
    expect(publicServiceOrderController).toBeDefined();
    expect(publicServiceOrderController).toBeInstanceOf(
      PublicServiceOrderController,
    );
    expect(serviceOrderService).toBeDefined();
  });

  it('Should instantiate controller with service dependency', () => {
    const mockService = {} as ServiceOrderService;
    const testController = new PublicServiceOrderController(mockService);
    expect(testController).toBeInstanceOf(PublicServiceOrderController);
  });

  describe('findByOrderNumber', () => {
    it('TC0001 - Should find service order by order number successfully', async () => {
      serviceOrderService.findByOrderNumber.mockResolvedValue(
        mockServiceOrderData,
      );

      const result =
        await publicServiceOrderController.findByOrderNumber(mockOrderNumber);

      expect(serviceOrderService.findByOrderNumber).toHaveBeenCalledWith(
        mockOrderNumber,
      );
      expect(result).toEqual(mockServiceOrderData);
      expect(result.orderNumber).toBe(mockOrderNumber);
      expect(result.status).toBe(ServiceOrderStatus.EM_EXECUCAO);
    });

    it('TC0002 - Should throw HttpException when order number not found', async () => {
      serviceOrderService.findByOrderNumber.mockRejectedValue(
        new Error('Ordem de serviço não encontrada'),
      );

      await expect(
        publicServiceOrderController.findByOrderNumber(mockOrderNumber),
      ).rejects.toThrow(
        new HttpException(
          'Ordem de serviço não encontrada',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(serviceOrderService.findByOrderNumber).toHaveBeenCalledWith(
        mockOrderNumber,
      );
    });

    it('TC0003 - Should handle invalid order number format', async () => {
      const invalidOrderNumber = 'INVALID-123';
      serviceOrderService.findByOrderNumber.mockRejectedValue(
        new Error('Formato de número inválido'),
      );

      await expect(
        publicServiceOrderController.findByOrderNumber(invalidOrderNumber),
      ).rejects.toThrow(
        new HttpException(
          'Ordem de serviço não encontrada',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(serviceOrderService.findByOrderNumber).toHaveBeenCalledWith(
        invalidOrderNumber,
      );
    });

    it('TC0004 - Should handle empty order number', async () => {
      const emptyOrderNumber = '';
      serviceOrderService.findByOrderNumber.mockRejectedValue(
        new Error('Número da ordem é obrigatório'),
      );

      await expect(
        publicServiceOrderController.findByOrderNumber(emptyOrderNumber),
      ).rejects.toThrow(
        new HttpException(
          'Ordem de serviço não encontrada',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(serviceOrderService.findByOrderNumber).toHaveBeenCalledWith(
        emptyOrderNumber,
      );
    });
  });

  describe('findByCustomerDocument', () => {
    it('TC0001 - Should find service orders by customer document successfully', async () => {
      const mockServiceOrders = [mockServiceOrderData];
      serviceOrderService.findByCustomerDocument.mockResolvedValue(
        mockServiceOrders,
      );

      const result =
        await publicServiceOrderController.findByCustomerDocument(mockDocument);

      expect(serviceOrderService.findByCustomerDocument).toHaveBeenCalledWith(
        mockDocument,
      );
      expect(result).toEqual(mockServiceOrders);
      expect(result).toHaveLength(1);
      expect(result[0].customer?.document).toBe(mockDocument);
    });

    it('TC0002 - Should return multiple service orders for customer', async () => {
      const secondServiceOrder = {
        ...mockServiceOrderData,
        id: faker.string.uuid(),
        orderNumber: 'OS-2025-002',
        status: ServiceOrderStatus.FINALIZADA,
      };
      const mockServiceOrders = [mockServiceOrderData, secondServiceOrder];
      serviceOrderService.findByCustomerDocument.mockResolvedValue(
        mockServiceOrders,
      );

      const result =
        await publicServiceOrderController.findByCustomerDocument(mockDocument);

      expect(serviceOrderService.findByCustomerDocument).toHaveBeenCalledWith(
        mockDocument,
      );
      expect(result).toHaveLength(2);
      expect(result[0].orderNumber).toBe(mockOrderNumber);
      expect(result[1].orderNumber).toBe('OS-2025-002');
    });

    it('TC0003 - Should throw HttpException when customer document not found', async () => {
      serviceOrderService.findByCustomerDocument.mockRejectedValue(
        new Error('Cliente não encontrado'),
      );

      await expect(
        publicServiceOrderController.findByCustomerDocument(mockDocument),
      ).rejects.toThrow(
        new HttpException(
          'Cliente não encontrado ou sem ordens de serviço',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(serviceOrderService.findByCustomerDocument).toHaveBeenCalledWith(
        mockDocument,
      );
    });

    it('TC0004 - Should handle invalid document format', async () => {
      const invalidDocument = '123';
      serviceOrderService.findByCustomerDocument.mockRejectedValue(
        new Error('Documento inválido'),
      );

      await expect(
        publicServiceOrderController.findByCustomerDocument(invalidDocument),
      ).rejects.toThrow(
        new HttpException(
          'Cliente não encontrado ou sem ordens de serviço',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(serviceOrderService.findByCustomerDocument).toHaveBeenCalledWith(
        invalidDocument,
      );
    });

    it('TC0005 - Should handle customer with no service orders', async () => {
      serviceOrderService.findByCustomerDocument.mockRejectedValue(
        new Error('Cliente sem ordens de serviço'),
      );

      await expect(
        publicServiceOrderController.findByCustomerDocument(mockDocument),
      ).rejects.toThrow(
        new HttpException(
          'Cliente não encontrado ou sem ordens de serviço',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(serviceOrderService.findByCustomerDocument).toHaveBeenCalledWith(
        mockDocument,
      );
    });
  });

  describe('findByVehiclePlate', () => {
    it('TC0001 - Should find service orders by vehicle plate successfully', async () => {
      const mockServiceOrders = [mockServiceOrderData];
      serviceOrderService.findByVehiclePlate.mockResolvedValue(
        mockServiceOrders,
      );

      const result =
        await publicServiceOrderController.findByVehiclePlate(mockLicensePlate);

      expect(serviceOrderService.findByVehiclePlate).toHaveBeenCalledWith(
        mockLicensePlate,
      );
      expect(result).toEqual(mockServiceOrders);
      expect(result).toHaveLength(1);
      expect(result[0].vehicle?.licensePlate).toBe(mockLicensePlate);
    });

    it('TC0002 - Should return multiple service orders for same vehicle', async () => {
      const secondServiceOrder = {
        ...mockServiceOrderData,
        id: faker.string.uuid(),
        orderNumber: 'OS-2025-003',
        status: ServiceOrderStatus.ENTREGUE,
        completedAt: faker.date.past(),
        deliveredAt: faker.date.recent(),
      };
      const mockServiceOrders = [mockServiceOrderData, secondServiceOrder];
      serviceOrderService.findByVehiclePlate.mockResolvedValue(
        mockServiceOrders,
      );

      const result =
        await publicServiceOrderController.findByVehiclePlate(mockLicensePlate);

      expect(serviceOrderService.findByVehiclePlate).toHaveBeenCalledWith(
        mockLicensePlate,
      );
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe(ServiceOrderStatus.EM_EXECUCAO);
      expect(result[1].status).toBe(ServiceOrderStatus.ENTREGUE);
    });

    it('TC0003 - Should throw HttpException when vehicle plate not found', async () => {
      serviceOrderService.findByVehiclePlate.mockRejectedValue(
        new Error('Veículo não encontrado'),
      );

      await expect(
        publicServiceOrderController.findByVehiclePlate(mockLicensePlate),
      ).rejects.toThrow(
        new HttpException(
          'Veículo não encontrado ou sem ordens de serviço',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(serviceOrderService.findByVehiclePlate).toHaveBeenCalledWith(
        mockLicensePlate,
      );
    });

    it('TC0004 - Should handle invalid license plate format', async () => {
      const invalidPlate = 'INVALID';
      serviceOrderService.findByVehiclePlate.mockRejectedValue(
        new Error('Placa inválida'),
      );

      await expect(
        publicServiceOrderController.findByVehiclePlate(invalidPlate),
      ).rejects.toThrow(
        new HttpException(
          'Veículo não encontrado ou sem ordens de serviço',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(serviceOrderService.findByVehiclePlate).toHaveBeenCalledWith(
        invalidPlate,
      );
    });

    it('TC0005 - Should handle vehicle with no service orders', async () => {
      serviceOrderService.findByVehiclePlate.mockRejectedValue(
        new Error('Veículo sem ordens de serviço'),
      );

      await expect(
        publicServiceOrderController.findByVehiclePlate(mockLicensePlate),
      ).rejects.toThrow(
        new HttpException(
          'Veículo não encontrado ou sem ordens de serviço',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(serviceOrderService.findByVehiclePlate).toHaveBeenCalledWith(
        mockLicensePlate,
      );
    });

    it('TC0006 - Should handle empty license plate', async () => {
      const emptyPlate = '';
      serviceOrderService.findByVehiclePlate.mockRejectedValue(
        new Error('Placa é obrigatória'),
      );

      await expect(
        publicServiceOrderController.findByVehiclePlate(emptyPlate),
      ).rejects.toThrow(
        new HttpException(
          'Veículo não encontrado ou sem ordens de serviço',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(serviceOrderService.findByVehiclePlate).toHaveBeenCalledWith(
        emptyPlate,
      );
    });
  });
});
