import { ServiceOrderStatus } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/pt_BR';

import {
  ServiceOrderAggregate,
  ServiceOrderItem,
  PartOrderItem,
} from '../../../../src/workshop/3-domain/aggregates/service-order.aggregate';
import { Money } from '../../../../src/workshop/3-domain/value-objects';

describe('ServiceOrderAggregate', () => {
  const mockServiceItem: ServiceOrderItem = {
    serviceId: faker.string.uuid(),
    serviceName: faker.commerce.productName(),
    quantity: 1,
    unitPrice: new Money(100),
    totalPrice: new Money(100),
  };

  const mockPartItem: PartOrderItem = {
    partId: faker.string.uuid(),
    partName: faker.commerce.productName(),
    quantity: 2,
    unitPrice: new Money(50),
    totalPrice: new Money(100),
  };

  describe('create', () => {
    it('TC0001 - Should create a service order', () => {
      const id = faker.string.uuid();
      const orderNumber = `OS-${faker.number.int({ min: 1000, max: 9999 })}`;

      const serviceOrder = ServiceOrderAggregate.create(
        id,
        orderNumber,
        faker.string.uuid(),
        faker.string.uuid(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      );

      expect(serviceOrder.id).toBe(id);
      expect(serviceOrder.status).toBe(ServiceOrderStatus.RECEBIDA);
      expect(serviceOrder.statusHistory).toHaveLength(1);
      expect(serviceOrder.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('fromDatabase', () => {
    it('TC0001 - Should create from database with services and parts', () => {
      const data = {
        id: faker.string.uuid(),
        orderNumber: 'OS-1234',
        customerId: faker.string.uuid(),
        vehicleId: faker.string.uuid(),
        status: ServiceOrderStatus.EM_EXECUCAO,
        description: faker.lorem.sentence(),
        reportedIssue: faker.lorem.sentence(),
        diagnosticNotes: null,
        estimatedTimeHours: null,
        estimatedCompletionDate: null,
        createdAt: new Date(),
        startedAt: null,
        completedAt: null,
        deliveredAt: null,
        updatedAt: null,
        services: [
          {
            serviceId: faker.string.uuid(),
            service: { name: 'Troca de óleo' },
            quantity: 1,
            price: 100,
            totalPrice: 100,
          },
        ],
        parts: [
          {
            partId: faker.string.uuid(),
            part: { name: 'Filtro de óleo' },
            quantity: 1,
            price: 50,
            totalPrice: 50,
          },
        ],
        statusHistory: [
          {
            status: ServiceOrderStatus.RECEBIDA,
            createdAt: new Date(),
            notes: 'Criada',
          },
        ],
      };

      const serviceOrder = ServiceOrderAggregate.fromDatabase(data);

      expect(serviceOrder.services).toHaveLength(1);
      expect(serviceOrder.parts).toHaveLength(1);
      expect(serviceOrder.statusHistory).toHaveLength(1);
    });

    it('TC0002 - Should handle null services, parts and statusHistory', () => {
      const data = {
        id: faker.string.uuid(),
        orderNumber: 'OS-1234',
        customerId: faker.string.uuid(),
        vehicleId: faker.string.uuid(),
        status: ServiceOrderStatus.RECEBIDA,
        description: faker.lorem.sentence(),
        reportedIssue: faker.lorem.sentence(),
        diagnosticNotes: null,
        estimatedTimeHours: null,
        estimatedCompletionDate: null,
        createdAt: new Date(),
        startedAt: null,
        completedAt: null,
        deliveredAt: null,
        updatedAt: null,
        services: null,
        parts: null,
        statusHistory: null,
      };

      const serviceOrder = ServiceOrderAggregate.fromDatabase(data);

      expect(serviceOrder.services).toEqual([]);
      expect(serviceOrder.parts).toEqual([]);
      expect(serviceOrder.statusHistory).toEqual([]);
    });
  });

  describe('totalServicePrice', () => {
    it('TC0001 - Should calculate total from multiple services', () => {
      const so = ServiceOrderAggregate.create(
        faker.string.uuid(),
        'OS-1234',
        faker.string.uuid(),
        faker.string.uuid(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      );

      so.addService(mockServiceItem);
      so.addService({
        ...mockServiceItem,
        serviceId: faker.string.uuid(),
        totalPrice: new Money(200),
      });

      expect(so.totalServicePrice.amount).toBe(300);
    });
  });

  describe('totalPartsPrice', () => {
    it('TC0001 - Should calculate total from multiple parts', () => {
      const so = ServiceOrderAggregate.create(
        faker.string.uuid(),
        'OS-1234',
        faker.string.uuid(),
        faker.string.uuid(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      );

      so.addPart(mockPartItem);
      so.addPart({
        ...mockPartItem,
        partId: faker.string.uuid(),
        totalPrice: new Money(150),
      });

      expect(so.totalPartsPrice.amount).toBe(250);
    });
  });

  describe('totalPrice', () => {
    it('TC0001 - Should sum services and parts', () => {
      const so = ServiceOrderAggregate.create(
        faker.string.uuid(),
        'OS-1234',
        faker.string.uuid(),
        faker.string.uuid(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      );

      so.addService(mockServiceItem);
      so.addPart(mockPartItem);

      expect(so.totalPrice.amount).toBe(200);
    });
  });

  describe('addService', () => {
    it('TC0001 - Should add new service', () => {
      const so = ServiceOrderAggregate.create(
        faker.string.uuid(),
        'OS-1234',
        faker.string.uuid(),
        faker.string.uuid(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      );

      so.addService(mockServiceItem);

      expect(so.services).toHaveLength(1);
    });

    it('TC0002 - Should update existing service when same serviceId', () => {
      const so = ServiceOrderAggregate.create(
        faker.string.uuid(),
        'OS-1234',
        faker.string.uuid(),
        faker.string.uuid(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      );

      so.addService(mockServiceItem);
      so.addService({ ...mockServiceItem, quantity: 3 });

      expect(so.services).toHaveLength(1);
      expect(so.services[0].quantity).toBe(3);
    });

    it('TC0003 - Should throw error when order is delivered', () => {
      const so = ServiceOrderAggregate.create(
        faker.string.uuid(),
        'OS-1234',
        faker.string.uuid(),
        faker.string.uuid(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      );

      so.changeStatus(ServiceOrderStatus.EM_DIAGNOSTICO);
      so.changeStatus(ServiceOrderStatus.AGUARDANDO_APROVACAO);
      so.changeStatus(ServiceOrderStatus.EM_EXECUCAO);
      so.changeStatus(ServiceOrderStatus.FINALIZADA);
      so.changeStatus(ServiceOrderStatus.ENTREGUE);

      expect(() => so.addService(mockServiceItem)).toThrow(
        'Não é possível modificar ordens de serviço já entregues',
      );
    });
  });

  describe('removeService', () => {
    it('TC0001 - Should remove service', () => {
      const so = ServiceOrderAggregate.create(
        faker.string.uuid(),
        'OS-1234',
        faker.string.uuid(),
        faker.string.uuid(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      );

      so.addService(mockServiceItem);
      so.removeService(mockServiceItem.serviceId);

      expect(so.services).toHaveLength(0);
    });
  });

  describe('addPart', () => {
    it('TC0001 - Should add new part', () => {
      const so = ServiceOrderAggregate.create(
        faker.string.uuid(),
        'OS-1234',
        faker.string.uuid(),
        faker.string.uuid(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      );

      so.addPart(mockPartItem);

      expect(so.parts).toHaveLength(1);
    });

    it('TC0002 - Should update existing part when same partId', () => {
      const so = ServiceOrderAggregate.create(
        faker.string.uuid(),
        'OS-1234',
        faker.string.uuid(),
        faker.string.uuid(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      );

      so.addPart(mockPartItem);
      so.addPart({ ...mockPartItem, quantity: 5 });

      expect(so.parts).toHaveLength(1);
      expect(so.parts[0].quantity).toBe(5);
    });
  });

  describe('removePart', () => {
    it('TC0001 - Should remove part', () => {
      const so = ServiceOrderAggregate.create(
        faker.string.uuid(),
        'OS-1234',
        faker.string.uuid(),
        faker.string.uuid(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      );

      so.addPart(mockPartItem);
      so.removePart(mockPartItem.partId);

      expect(so.parts).toHaveLength(0);
    });
  });

  describe('changeStatus', () => {
    it('TC0001 - Should change status with custom notes', () => {
      const so = ServiceOrderAggregate.create(
        faker.string.uuid(),
        'OS-1234',
        faker.string.uuid(),
        faker.string.uuid(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      );

      so.changeStatus(
        ServiceOrderStatus.EM_DIAGNOSTICO,
        'Iniciando diagnóstico',
      );

      expect(so.status).toBe(ServiceOrderStatus.EM_DIAGNOSTICO);
      expect(so.statusHistory[1].notes).toBe('Iniciando diagnóstico');
    });

    it('TC0002 - Should change status with default notes', () => {
      const so = ServiceOrderAggregate.create(
        faker.string.uuid(),
        'OS-1234',
        faker.string.uuid(),
        faker.string.uuid(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      );

      so.changeStatus(ServiceOrderStatus.EM_DIAGNOSTICO);

      expect(so.statusHistory[1].notes).toContain('Status alterado');
    });

    it('TC0003 - Should throw error for invalid transition', () => {
      const so = ServiceOrderAggregate.create(
        faker.string.uuid(),
        'OS-1234',
        faker.string.uuid(),
        faker.string.uuid(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      );

      expect(() => so.changeStatus(ServiceOrderStatus.FINALIZADA)).toThrow(
        'Transição de status inválida',
      );
    });

    it('TC0004 - Should allow AGUARDANDO_APROVACAO to EM_DIAGNOSTICO', () => {
      const so = ServiceOrderAggregate.create(
        faker.string.uuid(),
        'OS-1234',
        faker.string.uuid(),
        faker.string.uuid(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      );

      so.changeStatus(ServiceOrderStatus.EM_DIAGNOSTICO);
      so.changeStatus(ServiceOrderStatus.AGUARDANDO_APROVACAO);
      so.changeStatus(ServiceOrderStatus.EM_DIAGNOSTICO);

      expect(so.status).toBe(ServiceOrderStatus.EM_DIAGNOSTICO);
    });
  });

  describe('startExecution', () => {
    it('TC0001 - Should start when AGUARDANDO_APROVACAO', () => {
      const so = ServiceOrderAggregate.create(
        faker.string.uuid(),
        'OS-1234',
        faker.string.uuid(),
        faker.string.uuid(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      );

      so.changeStatus(ServiceOrderStatus.EM_DIAGNOSTICO);
      so.changeStatus(ServiceOrderStatus.AGUARDANDO_APROVACAO);
      so.startExecution();

      expect(so.status).toBe(ServiceOrderStatus.EM_EXECUCAO);
    });

    it('TC0002 - Should throw error when not AGUARDANDO_APROVACAO', () => {
      const so = ServiceOrderAggregate.create(
        faker.string.uuid(),
        'OS-1234',
        faker.string.uuid(),
        faker.string.uuid(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      );

      expect(() => so.startExecution()).toThrow(
        'Só é possível iniciar execução de ordens aprovadas',
      );
    });
  });

  describe('finish', () => {
    it('TC0001 - Should finish when EM_EXECUCAO', () => {
      const so = ServiceOrderAggregate.create(
        faker.string.uuid(),
        'OS-1234',
        faker.string.uuid(),
        faker.string.uuid(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      );

      so.changeStatus(ServiceOrderStatus.EM_DIAGNOSTICO);
      so.changeStatus(ServiceOrderStatus.AGUARDANDO_APROVACAO);
      so.changeStatus(ServiceOrderStatus.EM_EXECUCAO);
      so.finish();

      expect(so.status).toBe(ServiceOrderStatus.FINALIZADA);
    });

    it('TC0002 - Should throw error when not EM_EXECUCAO', () => {
      const so = ServiceOrderAggregate.create(
        faker.string.uuid(),
        'OS-1234',
        faker.string.uuid(),
        faker.string.uuid(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      );

      expect(() => so.finish()).toThrow(
        'Só é possível finalizar ordens em execução',
      );
    });
  });

  describe('deliver', () => {
    it('TC0001 - Should deliver when FINALIZADA', () => {
      const so = ServiceOrderAggregate.create(
        faker.string.uuid(),
        'OS-1234',
        faker.string.uuid(),
        faker.string.uuid(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      );

      so.changeStatus(ServiceOrderStatus.EM_DIAGNOSTICO);
      so.changeStatus(ServiceOrderStatus.AGUARDANDO_APROVACAO);
      so.changeStatus(ServiceOrderStatus.EM_EXECUCAO);
      so.changeStatus(ServiceOrderStatus.FINALIZADA);
      so.deliver();

      expect(so.status).toBe(ServiceOrderStatus.ENTREGUE);
    });

    it('TC0002 - Should throw error when not FINALIZADA', () => {
      const so = ServiceOrderAggregate.create(
        faker.string.uuid(),
        'OS-1234',
        faker.string.uuid(),
        faker.string.uuid(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      );

      expect(() => so.deliver()).toThrow(
        'Só é possível entregar ordens finalizadas',
      );
    });
  });
});
