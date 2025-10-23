import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { CustomerRepository } from '../../../src/workshop/4-infrastructure/repositories/customer.repository';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { CustomerType } from '@prisma/client';

describe('Customer Repository Integration Tests', () => {
  let repository: CustomerRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: 'ICustomerRepository',
          useClass: CustomerRepository,
        },
        CustomerRepository,
      ],
    }).compile();

    repository = module.get<CustomerRepository>(CustomerRepository);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF;');
    await prisma.serviceOrderItem.deleteMany();
    await prisma.serviceOrderPart.deleteMany();
    await prisma.serviceOrderStatusHistory.deleteMany();
    await prisma.budgetItem.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.serviceOrder.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.mechanic.deleteMany();
    await prisma.service.deleteMany();
    await prisma.part.deleteMany();
    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON;');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('create customer', () => {
    it('TC0001 - Should create a new customer with valid data', async () => {
      const customerData = {
        document: '52998224725',
        type: CustomerType.PESSOA_FISICA,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        additionalInfo: null,
      };

      const customer = await repository.create(customerData);

      expect(customer).toBeDefined();
      expect(customer.id).toBeDefined();
      expect(customer.document).toBe(customerData.document);
      expect(customer.name).toBe(customerData.name);
      expect(customer.email).toBe(customerData.email);
    });

    it('TC0002 - Should create customer with additional info', async () => {
      const customerData = {
        document: '44451959007',
        type: CustomerType.PESSOA_FISICA,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        additionalInfo: 'Cliente VIP',
      };

      const customer = await repository.create(customerData);

      expect(customer.additionalInfo).toBe('Cliente VIP');
    });

    it('TC0003 - Should create juridical person customer', async () => {
      const customerData = {
        document: '11222333000181',
        type: CustomerType.PESSOA_JURIDICA,
        name: 'Empresa Teste LTDA',
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        additionalInfo: null,
      };

      const customer = await repository.create(customerData);

      expect(customer.type).toBe(CustomerType.PESSOA_JURIDICA);
      expect(customer.document).toBe('11222333000181');
    });
  });

  describe('find customer', () => {
    let customerId: string;
    const customerEmail = 'unique-find@test.com';
    const customerDocument = '11144477735';

    beforeAll(async () => {
      const customer = await repository.create({
        document: customerDocument,
        type: CustomerType.PESSOA_FISICA,
        name: 'Test Customer',
        email: customerEmail,
        phone: '11999999999',
        address: 'Test Address',
        additionalInfo: null,
      });
      customerId = customer.id;
    });

    it('TC0001 - Should find customer by ID', async () => {
      const customer = await repository.findById(customerId);

      expect(customer).toBeDefined();
      expect(customer?.id).toBe(customerId);
    });

    it('TC0002 - Should find customer by email', async () => {
      const customer = await repository.findByEmail(customerEmail);

      expect(customer).toBeDefined();
      expect(customer?.email).toBe(customerEmail);
    });

    it('TC0003 - Should find customer by document', async () => {
      const customer = await repository.findByDocument(customerDocument);

      expect(customer).toBeDefined();
      expect(customer?.document).toBe(customerDocument);
    });

    it('TC0004 - Should return null for non-existent customer', async () => {
      const customer = await repository.findById(
        '00000000-0000-0000-0000-000000000000',
      );

      expect(customer).toBeNull();
    });

    it('TC0005 - Should find all customers', async () => {
      const customers = await repository.findAll();

      expect(customers).toBeDefined();
      expect(Array.isArray(customers)).toBe(true);
      expect(customers.length).toBeGreaterThan(0);
    });
  });

  describe('update customer', () => {
    let customerId: string;

    beforeAll(async () => {
      const customer = await repository.create({
        document: '06990590000123',
        type: CustomerType.PESSOA_JURIDICA,
        name: 'Update Test Company',
        email: 'update@test.com',
        phone: '11888888888',
        address: 'Old Address',
        additionalInfo: null,
      });
      customerId = customer.id;
    });

    it('TC0001 - Should update customer name', async () => {
      const updatedCustomer = await repository.update(customerId, {
        name: 'New Company Name',
      });

      expect(updatedCustomer.name).toBe('New Company Name');
    });

    it('TC0002 - Should update customer address', async () => {
      const updatedCustomer = await repository.update(customerId, {
        address: 'New Address, 456',
      });

      expect(updatedCustomer.address).toBe('New Address, 456');
    });

    it('TC0003 - Should update customer phone', async () => {
      const updatedCustomer = await repository.update(customerId, {
        phone: '11777777777',
      });

      expect(updatedCustomer.phone).toBe('11777777777');
    });

    it('TC0004 - Should update multiple fields at once', async () => {
      const updatedCustomer = await repository.update(customerId, {
        name: 'Multi Update Company',
        phone: '11666666666',
        additionalInfo: 'Updated info',
      });

      expect(updatedCustomer.name).toBe('Multi Update Company');
      expect(updatedCustomer.phone).toBe('11666666666');
      expect(updatedCustomer.additionalInfo).toBe('Updated info');
    });
  });

  describe('delete customer', () => {
    it('TC0001 - Should delete customer by ID', async () => {
      const customer = await repository.create({
        document: '33344455566',
        type: CustomerType.PESSOA_FISICA,
        name: 'Delete Test',
        email: 'delete@test.com',
        phone: '11555555555',
        address: 'Delete Address',
        additionalInfo: null,
      });

      await repository.delete(customer.id);

      const deletedCustomer = await repository.findById(customer.id);
      expect(deletedCustomer).toBeNull();
    });
  });
});
