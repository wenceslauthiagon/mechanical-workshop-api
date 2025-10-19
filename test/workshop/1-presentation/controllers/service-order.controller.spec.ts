import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { CustomerType } from '@prisma/client';

import { CustomerController } from '../../../../src/workshop/1-presentation/controllers/customer.controller';
import { CustomerService } from '../../../../src/workshop/2-application/services/customer.service';
import { CreateCustomerDto } from '../../../../src/workshop/1-presentation/dtos/customer/create-customer.dto';
import { UpdateCustomerDto } from '../../../../src/workshop/1-presentation/dtos/customer/update-customer.dto';
import { CustomerResponseDto } from '../../../../src/workshop/1-presentation/dtos/customer/customer-response.dto';

describe('CustomerController', () => {
  let customerController: CustomerController;
  let customerService: jest.Mocked<CustomerService>;

  const mockCustomerId = uuidv4();
  const mockDocument = '12345678901';

  const mockCustomerData = {
    id: mockCustomerId,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    type: CustomerType.INDIVIDUAL,
    document: mockDocument,
    additionalInfo: faker.lorem.sentence(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    vehicles: [
      {
        id: uuidv4(),
        licensePlate: 'ABC-1234',
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        year: faker.date.past().getFullYear(),
        color: faker.vehicle.color(),
      },
    ],
  };

  const mockCreateCustomerDto: CreateCustomerDto = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    type: CustomerType.INDIVIDUAL,
    document: '98765432100',
    additionalInfo: faker.lorem.sentence(),
  };

  const mockUpdateCustomerDto: UpdateCustomerDto = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    additionalInfo: faker.lorem.sentence(),
  };

  const mockCustomerResponseDto: CustomerResponseDto = {
    id: mockCustomerData.id,
    name: mockCustomerData.name,
    email: mockCustomerData.email,
    phone: mockCustomerData.phone,
    address: mockCustomerData.address,
    type: mockCustomerData.type,
    document: mockCustomerData.document,
    additionalInfo: mockCustomerData.additionalInfo,
    createdAt: mockCustomerData.createdAt,
    updatedAt: mockCustomerData.updatedAt,
    vehicles: mockCustomerData.vehicles,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CustomerService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByDocument: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    customerController = module.get<CustomerController>(CustomerController);
    customerService = module.get(CustomerService);
  });

  describe('create', () => {
    it('TC0001 - Should create a customer successfully', async () => {
      customerService.create.mockResolvedValue(mockCustomerData);

      const result = await customerController.create(mockCreateCustomerDto);

      expect(customerService.create).toHaveBeenCalledWith(
        mockCreateCustomerDto,
      );
      expect(result).toEqual(mockCustomerResponseDto);
    });

    it('TC0002 - Should throw error when creating customer fails', async () => {
      const mockError = new Error('Falha ao criar cliente');
      customerService.create.mockRejectedValue(mockError);

      await expect(
        customerController.create(mockCreateCustomerDto),
      ).rejects.toThrow(mockError);
      expect(customerService.create).toHaveBeenCalledWith(
        mockCreateCustomerDto,
      );
    });

    it('TC0003 - Should handle invalid customer data', async () => {
      const invalidData = { ...mockCreateCustomerDto, email: 'invalid-email' };
      const mockError = new Error('Email inválido');
      customerService.create.mockRejectedValue(mockError);

      await expect(customerController.create(invalidData)).rejects.toThrow(
        mockError,
      );
      expect(customerService.create).toHaveBeenCalledWith(invalidData);
    });
  });

  describe('findAll', () => {
    it('TC0001 - Should return all customers successfully', async () => {
      const mockCustomers = [mockCustomerData];
      customerService.findAll.mockResolvedValue(mockCustomers);

      const result = await customerController.findAll();

      expect(customerService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockCustomerResponseDto]);
    });

    it('TC0002 - Should return empty array when no customers found', async () => {
      customerService.findAll.mockResolvedValue([]);

      const result = await customerController.findAll();

      expect(customerService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('TC0003 - Should throw error when findAll fails', async () => {
      const mockError = new Error('Falha ao listar clientes');
      customerService.findAll.mockRejectedValue(mockError);

      await expect(customerController.findAll()).rejects.toThrow(mockError);
      expect(customerService.findAll).toHaveBeenCalled();
    });
  });

  describe('findByDocument', () => {
    it('TC0001 - Should find customer by document successfully', async () => {
      customerService.findByDocument.mockResolvedValue(mockCustomerData);

      const result = await customerController.findByDocument(mockDocument);

      expect(customerService.findByDocument).toHaveBeenCalledWith(mockDocument);
      expect(result).toEqual(mockCustomerResponseDto);
    });

    it('TC0002 - Should throw error when customer not found by document', async () => {
      const mockError = new Error('Cliente não encontrado');
      customerService.findByDocument.mockRejectedValue(mockError);

      await expect(
        customerController.findByDocument(mockDocument),
      ).rejects.toThrow(mockError);
      expect(customerService.findByDocument).toHaveBeenCalledWith(mockDocument);
    });

    it('TC0003 - Should handle invalid document format', async () => {
      const invalidDocument = 'invalid-doc';
      const mockError = new Error('Documento inválido');
      customerService.findByDocument.mockRejectedValue(mockError);

      await expect(
        customerController.findByDocument(invalidDocument),
      ).rejects.toThrow(mockError);
      expect(customerService.findByDocument).toHaveBeenCalledWith(
        invalidDocument,
      );
    });
  });

  describe('findOne', () => {
    it('TC0001 - Should find customer by ID successfully', async () => {
      customerService.findById.mockResolvedValue(mockCustomerData);

      const result = await customerController.findOne(mockCustomerId);

      expect(customerService.findById).toHaveBeenCalledWith(mockCustomerId);
      expect(result).toEqual(mockCustomerResponseDto);
    });

    it('TC0002 - Should throw error when customer not found by ID', async () => {
      const mockError = new Error('Cliente não encontrado');
      customerService.findById.mockRejectedValue(mockError);

      await expect(customerController.findOne(mockCustomerId)).rejects.toThrow(
        mockError,
      );
      expect(customerService.findById).toHaveBeenCalledWith(mockCustomerId);
    });

    it('TC0003 - Should handle invalid UUID format', async () => {
      const invalidId = 'invalid-uuid';
      const mockError = new Error('ID inválido');
      customerService.findById.mockRejectedValue(mockError);

      await expect(customerController.findOne(invalidId)).rejects.toThrow(
        mockError,
      );
      expect(customerService.findById).toHaveBeenCalledWith(invalidId);
    });
  });

  describe('update', () => {
    it('TC0001 - Should update customer successfully', async () => {
      const updatedCustomer = { ...mockCustomerData, ...mockUpdateCustomerDto };
      customerService.update.mockResolvedValue(updatedCustomer);

      const result = await customerController.update(
        mockCustomerId,
        mockUpdateCustomerDto,
      );

      expect(customerService.update).toHaveBeenCalledWith(
        mockCustomerId,
        mockUpdateCustomerDto,
      );
      expect(result).toEqual({
        ...mockCustomerResponseDto,
        ...mockUpdateCustomerDto,
      });
    });

    it('TC0002 - Should throw error when customer not found for update', async () => {
      const mockError = new Error('Cliente não encontrado');
      customerService.update.mockRejectedValue(mockError);

      await expect(
        customerController.update(mockCustomerId, mockUpdateCustomerDto),
      ).rejects.toThrow(mockError);
      expect(customerService.update).toHaveBeenCalledWith(
        mockCustomerId,
        mockUpdateCustomerDto,
      );
    });

    it('TC0003 - Should handle duplicate email error during update', async () => {
      const mockError = new Error('Email já cadastrado');
      customerService.update.mockRejectedValue(mockError);

      await expect(
        customerController.update(mockCustomerId, mockUpdateCustomerDto),
      ).rejects.toThrow(mockError);
      expect(customerService.update).toHaveBeenCalledWith(
        mockCustomerId,
        mockUpdateCustomerDto,
      );
    });
  });

  describe('remove', () => {
    it('TC0001 - Should remove customer successfully', async () => {
      customerService.remove.mockResolvedValue();

      await customerController.remove(mockCustomerId);

      expect(customerService.remove).toHaveBeenCalledWith(mockCustomerId);
    });

    it('TC0002 - Should throw error when customer not found for removal', async () => {
      const mockError = new Error('Cliente não encontrado');
      customerService.remove.mockRejectedValue(mockError);

      await expect(customerController.remove(mockCustomerId)).rejects.toThrow(
        mockError,
      );
      expect(customerService.remove).toHaveBeenCalledWith(mockCustomerId);
    });

    it('TC0003 - Should handle conflict when customer has vehicles', async () => {
      const mockError = new Error('Cliente possui veículos cadastrados');
      customerService.remove.mockRejectedValue(mockError);

      await expect(customerController.remove(mockCustomerId)).rejects.toThrow(
        mockError,
      );
      expect(customerService.remove).toHaveBeenCalledWith(mockCustomerId);
    });
  });

  describe('mapToResponseDto', () => {
    it('TC0001 - Should map customer data to response DTO correctly', async () => {
      customerService.findById.mockResolvedValue(mockCustomerData);

      const result = await customerController.findOne(mockCustomerId);

      expect(result).toEqual(mockCustomerResponseDto);
      expect(result.vehicles).toHaveLength(1);
      expect(result.vehicles?.[0]).toEqual(mockCustomerData.vehicles[0]);
    });

    it('TC0002 - Should handle customer without vehicles', async () => {
      const customerWithoutVehicles = {
        ...mockCustomerData,
        vehicles: undefined,
      };
      customerService.findById.mockResolvedValue(customerWithoutVehicles);

      const result = await customerController.findOne(mockCustomerId);

      expect(result.vehicles).toBeUndefined();
    });
  });
});

import { faker } from '@faker-js/faker';
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

import { faker } from '@faker-js/faker';
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
      type: 'INDIVIDUAL',
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

import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { ServiceOrderStatus } from '@prisma/client';

import { ServiceOrderController } from '../../../../src/workshop/1-presentation/controllers/service-order.controller';
import { ServiceOrderService } from '../../../../src/workshop/2-application/services/service-order.service';
import { CreateServiceOrderDto } from '../../../../src/workshop/1-presentation/dtos/service-order/create-service-order.dto';
import { UpdateServiceOrderStatusDto } from '../../../../src/workshop/1-presentation/dtos/service-order/update-service-order-status.dto';

describe('ServiceOrderController', () => {
  let serviceOrderController: ServiceOrderController;
  let serviceOrderService: jest.Mocked<ServiceOrderService>;

  const mockServiceOrderId = uuidv4();
  const mockCustomerId = uuidv4();
  const mockVehicleId = uuidv4();
  const mockServiceId = uuidv4();
  const mockPartId = uuidv4();

  const mockServiceOrderData = {
    id: mockServiceOrderId,
    orderNumber: faker.string.alphanumeric(10).toUpperCase(),
    customerId: mockCustomerId,
    vehicleId: mockVehicleId,
    description: faker.lorem.paragraph(),
    status: ServiceOrderStatus.RECEBIDA,
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
    startedAt: null,
    completedAt: null,
    deliveredAt: null,
    approvedAt: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    customer: {
      id: mockCustomerId,
      name: faker.person.fullName(),
      document: faker.string.numeric(11),
      type: 'INDIVIDUAL',
      email: faker.internet.email(),
      phone: faker.phone.number(),
    },
    vehicle: {
      id: mockVehicleId,
      licensePlate: faker.vehicle.vrm(),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.date.past().getFullYear(),
      color: faker.vehicle.color(),
    },
    services: [],
    parts: [],
  };

  const mockCreateServiceOrderDto: CreateServiceOrderDto = {
    customerId: mockCustomerId,
    vehicleId: mockVehicleId,
    description: faker.lorem.paragraph(),
    services: [
      {
        serviceId: mockServiceId,
        quantity: 1,
      },
    ],
    parts: [
      {
        partId: mockPartId,
        quantity: 2,
      },
    ],
  };

  const mockUpdateStatusDto: UpdateServiceOrderStatusDto = {
    status: ServiceOrderStatus.EM_DIAGNOSTICO,
    notes: faker.lorem.sentence(),
  };

  const mockStatusHistory = [
    {
      id: uuidv4(),
      serviceOrderId: mockServiceOrderId,
      status: ServiceOrderStatus.RECEBIDA,
      notes: 'Ordem de serviço recebida',
      changedBy: faker.person.fullName(),
      createdAt: faker.date.past(),
    },
    {
      id: uuidv4(),
      serviceOrderId: mockServiceOrderId,
      status: ServiceOrderStatus.EM_DIAGNOSTICO,
      notes: 'Iniciado diagnóstico',
      changedBy: faker.person.fullName(),
      createdAt: faker.date.recent(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceOrderController],
      providers: [
        {
          provide: ServiceOrderService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findByCustomer: jest.fn(),
            updateStatus: jest.fn(),
            approveOrder: jest.fn(),
            getStatusHistory: jest.fn(),
          },
        },
      ],
    }).compile();

    serviceOrderController = module.get<ServiceOrderController>(
      ServiceOrderController,
    );
    serviceOrderService = module.get(ServiceOrderService);
  });

  describe('create', () => {
    it('TC0001 - Should create a service order successfully', async () => {
      const createdServiceOrder = { ...mockServiceOrderData };
      serviceOrderService.create.mockResolvedValue(createdServiceOrder);

      const result = await serviceOrderController.create(
        mockCreateServiceOrderDto,
      );

      expect(serviceOrderService.create).toHaveBeenCalledWith(
        mockCreateServiceOrderDto,
      );
      expect(result).toEqual(createdServiceOrder);
      expect(result.id).toBe(mockServiceOrderId);
      expect(result.status).toBe(ServiceOrderStatus.RECEBIDA);
    });

    it('TC0002 - Should throw error when creating service order fails', async () => {
      const mockError = new Error('Falha ao criar ordem de serviço');
      serviceOrderService.create.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.create(mockCreateServiceOrderDto),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.create).toHaveBeenCalledWith(
        mockCreateServiceOrderDto,
      );
    });

    it('TC0003 - Should handle customer not found error', async () => {
      const mockError = new Error('Cliente não encontrado');
      serviceOrderService.create.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.create(mockCreateServiceOrderDto),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.create).toHaveBeenCalledWith(
        mockCreateServiceOrderDto,
      );
    });

    it('TC0004 - Should handle vehicle not found error', async () => {
      const mockError = new Error('Veículo não encontrado');
      serviceOrderService.create.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.create(mockCreateServiceOrderDto),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.create).toHaveBeenCalledWith(
        mockCreateServiceOrderDto,
      );
    });
  });

  describe('findAll', () => {
    it('TC0001 - Should return all service orders without filter', async () => {
      const mockServiceOrders = [mockServiceOrderData];
      serviceOrderService.findAll.mockResolvedValue(mockServiceOrders);

      const result = await serviceOrderController.findAll();

      expect(serviceOrderService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockServiceOrders);
      expect(result).toHaveLength(1);
    });

    it('TC0002 - Should return service orders filtered by customer', async () => {
      const mockServiceOrders = [mockServiceOrderData];
      serviceOrderService.findByCustomer.mockResolvedValue(mockServiceOrders);

      const result = await serviceOrderController.findAll(mockCustomerId);

      expect(serviceOrderService.findByCustomer).toHaveBeenCalledWith(
        mockCustomerId,
      );
      expect(result).toEqual(mockServiceOrders);
      expect(result[0].customerId).toBe(mockCustomerId);
    });

    it('TC0003 - Should throw error when findAll fails', async () => {
      const mockError = new Error('Falha ao listar ordens de serviço');
      serviceOrderService.findAll.mockRejectedValue(mockError);

      await expect(serviceOrderController.findAll()).rejects.toThrow(mockError);
      expect(serviceOrderService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('TC0001 - Should find service order by ID successfully', async () => {
      serviceOrderService.findById.mockResolvedValue(mockServiceOrderData);

      const result = await serviceOrderController.findOne(mockServiceOrderId);

      expect(serviceOrderService.findById).toHaveBeenCalledWith(
        mockServiceOrderId,
      );
      expect(result).toEqual(mockServiceOrderData);
      expect(result.id).toBe(mockServiceOrderId);
    });

    it('TC0002 - Should throw error when service order not found by ID', async () => {
      const mockError = new Error('Ordem de serviço não encontrada');
      serviceOrderService.findById.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.findOne(mockServiceOrderId),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.findById).toHaveBeenCalledWith(
        mockServiceOrderId,
      );
    });

    it('TC0003 - Should handle invalid UUID format', async () => {
      const invalidId = 'invalid-uuid';
      const mockError = new Error('UUID inválido');
      serviceOrderService.findById.mockRejectedValue(mockError);

      await expect(serviceOrderController.findOne(invalidId)).rejects.toThrow(
        mockError,
      );
      expect(serviceOrderService.findById).toHaveBeenCalledWith(invalidId);
    });
  });

  describe('updateStatus', () => {
    it('TC0001 - Should update service order status successfully', async () => {
      const updatedServiceOrder = {
        ...mockServiceOrderData,
        status: ServiceOrderStatus.EM_DIAGNOSTICO,
      };
      serviceOrderService.updateStatus.mockResolvedValue(updatedServiceOrder);

      const result = await serviceOrderController.updateStatus(
        mockServiceOrderId,
        mockUpdateStatusDto,
      );

      expect(serviceOrderService.updateStatus).toHaveBeenCalledWith(
        mockServiceOrderId,
        mockUpdateStatusDto,
      );
      expect(result.status).toBe(ServiceOrderStatus.EM_DIAGNOSTICO);
      expect(result.id).toBe(mockServiceOrderId);
    });

    it('TC0002 - Should throw error when service order not found for status update', async () => {
      const mockError = new Error('Ordem de serviço não encontrada');
      serviceOrderService.updateStatus.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.updateStatus(
          mockServiceOrderId,
          mockUpdateStatusDto,
        ),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.updateStatus).toHaveBeenCalledWith(
        mockServiceOrderId,
        mockUpdateStatusDto,
      );
    });

    it('TC0003 - Should handle invalid status transition', async () => {
      const mockError = new Error('Transição de status inválida');
      serviceOrderService.updateStatus.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.updateStatus(
          mockServiceOrderId,
          mockUpdateStatusDto,
        ),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.updateStatus).toHaveBeenCalledWith(
        mockServiceOrderId,
        mockUpdateStatusDto,
      );
    });

    it('TC0004 - Should update status with notes', async () => {
      const statusWithNotes = {
        status: ServiceOrderStatus.AGUARDANDO_APROVACAO,
        notes: 'Diagnóstico completo, aguardando aprovação do cliente',
      };
      const updatedServiceOrder = {
        ...mockServiceOrderData,
        status: ServiceOrderStatus.AGUARDANDO_APROVACAO,
      };
      serviceOrderService.updateStatus.mockResolvedValue(updatedServiceOrder);

      const result = await serviceOrderController.updateStatus(
        mockServiceOrderId,
        statusWithNotes,
      );

      expect(serviceOrderService.updateStatus).toHaveBeenCalledWith(
        mockServiceOrderId,
        statusWithNotes,
      );
      expect(result.status).toBe(ServiceOrderStatus.AGUARDANDO_APROVACAO);
    });
  });

  describe('approveOrder', () => {
    it('TC0001 - Should approve service order successfully', async () => {
      const approvedServiceOrder = {
        ...mockServiceOrderData,
        status: ServiceOrderStatus.EM_EXECUCAO,
      };
      serviceOrderService.approveOrder.mockResolvedValue(approvedServiceOrder);

      const result =
        await serviceOrderController.approveOrder(mockServiceOrderId);

      expect(serviceOrderService.approveOrder).toHaveBeenCalledWith(
        mockServiceOrderId,
      );
      expect(result.status).toBe(ServiceOrderStatus.EM_EXECUCAO);
      expect(result.id).toBe(mockServiceOrderId);
    });

    it('TC0002 - Should throw error when service order not found for approval', async () => {
      const mockError = new Error('Ordem de serviço não encontrada');
      serviceOrderService.approveOrder.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.approveOrder(mockServiceOrderId),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.approveOrder).toHaveBeenCalledWith(
        mockServiceOrderId,
      );
    });

    it('TC0003 - Should handle service order not awaiting approval', async () => {
      const mockError = new Error(
        'Ordem de serviço não está aguardando aprovação',
      );
      serviceOrderService.approveOrder.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.approveOrder(mockServiceOrderId),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.approveOrder).toHaveBeenCalledWith(
        mockServiceOrderId,
      );
    });
  });

  describe('getStatusHistory', () => {
    it('TC0001 - Should return status history successfully', async () => {
      serviceOrderService.getStatusHistory.mockResolvedValue(mockStatusHistory);

      const result =
        await serviceOrderController.getStatusHistory(mockServiceOrderId);

      expect(serviceOrderService.getStatusHistory).toHaveBeenCalledWith(
        mockServiceOrderId,
      );
      expect(result).toEqual(mockStatusHistory);
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe(ServiceOrderStatus.RECEBIDA);
      expect(result[1].status).toBe(ServiceOrderStatus.EM_DIAGNOSTICO);
    });

    it('TC0002 - Should throw error when service order not found for history', async () => {
      const mockError = new Error('Ordem de serviço não encontrada');
      serviceOrderService.getStatusHistory.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.getStatusHistory(mockServiceOrderId),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.getStatusHistory).toHaveBeenCalledWith(
        mockServiceOrderId,
      );
    });

    it('TC0003 - Should return empty history for new service order', async () => {
      serviceOrderService.getStatusHistory.mockResolvedValue([]);

      const result =
        await serviceOrderController.getStatusHistory(mockServiceOrderId);

      expect(serviceOrderService.getStatusHistory).toHaveBeenCalledWith(
        mockServiceOrderId,
      );
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findByCustomer', () => {
    it('TC0001 - Should find service orders by customer successfully', async () => {
      const mockServiceOrders = [mockServiceOrderData];
      serviceOrderService.findByCustomer.mockResolvedValue(mockServiceOrders);

      const result =
        await serviceOrderController.findByCustomer(mockCustomerId);

      expect(serviceOrderService.findByCustomer).toHaveBeenCalledWith(
        mockCustomerId,
      );
      expect(result).toEqual(mockServiceOrders);
      expect(result).toHaveLength(1);
      expect(result[0].customerId).toBe(mockCustomerId);
    });

    it('TC0002 - Should return empty array when customer has no service orders', async () => {
      serviceOrderService.findByCustomer.mockResolvedValue([]);

      const result =
        await serviceOrderController.findByCustomer(mockCustomerId);

      expect(serviceOrderService.findByCustomer).toHaveBeenCalledWith(
        mockCustomerId,
      );
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('TC0003 - Should throw error when customer not found', async () => {
      const mockError = new Error('Cliente não encontrado');
      serviceOrderService.findByCustomer.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.findByCustomer(mockCustomerId),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.findByCustomer).toHaveBeenCalledWith(
        mockCustomerId,
      );
    });

    it('TC0004 - Should handle invalid customer ID', async () => {
      const invalidCustomerId = 'invalid-uuid';
      const mockError = new Error('UUID inválido');
      serviceOrderService.findByCustomer.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.findByCustomer(invalidCustomerId),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.findByCustomer).toHaveBeenCalledWith(
        invalidCustomerId,
      );
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ServiceStatsController } from '../../../../src/workshop/1-presentation/controllers/service-stats.controller';
import { ServiceStatsService } from '../../../../src/workshop/2-application/services/service-stats.service';
import { JwtAuthGuard } from '../../../../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../src/auth/guards/roles.guard';
import { faker } from '@faker-js/faker';

describe('ServiceStatsController', () => {
  let controller: ServiceStatsController;
  let serviceStatsService: jest.Mocked<ServiceStatsService>;

  const mockServiceStats = [
    {
      serviceId: faker.string.uuid(),
      serviceName: faker.company.name(),
      averageExecutionHours: faker.number.float({ min: 0.5, max: 8.0 }),
      totalCompletedOrders: faker.number.int({ min: 1, max: 100 }),
      estimatedTimeHours: faker.number.float({ min: 0.5, max: 8.0 }),
      accuracyPercentage: faker.number.float({ min: 50, max: 100 }),
    },
    {
      serviceId: faker.string.uuid(),
      serviceName: faker.company.name(),
      averageExecutionHours: faker.number.float({ min: 0.5, max: 8.0 }),
      totalCompletedOrders: faker.number.int({ min: 1, max: 100 }),
      estimatedTimeHours: faker.number.float({ min: 0.5, max: 8.0 }),
      accuracyPercentage: faker.number.float({ min: 50, max: 100 }),
    },
  ];

  const mockOverallStats = {
    totalCompletedOrders: faker.number.int({ min: 100, max: 1000 }),
    averageExecutionTime: faker.number.float({ min: 1.0, max: 10.0 }),
    averageEstimatedTime: faker.number.float({ min: 1.0, max: 10.0 }),
    overallAccuracy: faker.number.float({ min: 70, max: 95 }),
  };

  const mockSingleServiceStats = {
    serviceId: faker.string.uuid(),
    serviceName: faker.company.name(),
    averageExecutionHours: faker.number.float({ min: 0.5, max: 8.0 }),
    totalCompletedOrders: faker.number.int({ min: 1, max: 100 }),
    estimatedTimeHours: faker.number.float({ min: 0.5, max: 8.0 }),
    accuracyPercentage: faker.number.float({ min: 50, max: 100 }),
  };

  beforeEach(async () => {
    const mockServiceStatsService = {
      getServiceExecutionStats: jest.fn(),
      getOverallStats: jest.fn(),
      getServiceById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceStatsController],
      providers: [
        {
          provide: ServiceStatsService,
          useValue: mockServiceStatsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ServiceStatsController>(ServiceStatsController);
    serviceStatsService = module.get(ServiceStatsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getServiceStats', () => {
    it('TC0001 - Should return service execution statistics', async () => {
      serviceStatsService.getServiceExecutionStats.mockResolvedValue(
        mockServiceStats,
      );

      const result = await controller.getServiceStats();

      expect(
        serviceStatsService.getServiceExecutionStats,
      ).toHaveBeenCalledWith();
      expect(result).toEqual(mockServiceStats);
      expect(result).toHaveLength(2);
    });

    it('TC0002 - Should return empty array when no service stats available', async () => {
      serviceStatsService.getServiceExecutionStats.mockResolvedValue([]);

      const result = await controller.getServiceStats();

      expect(
        serviceStatsService.getServiceExecutionStats,
      ).toHaveBeenCalledWith();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('TC0003 - Should throw error when service fails', async () => {
      const mockError = new Error('Database connection error');
      serviceStatsService.getServiceExecutionStats.mockRejectedValue(mockError);

      await expect(controller.getServiceStats()).rejects.toThrow(mockError);
      expect(
        serviceStatsService.getServiceExecutionStats,
      ).toHaveBeenCalledWith();
    });
  });

  describe('getOverallStats', () => {
    it('TC0001 - Should return overall system statistics', async () => {
      serviceStatsService.getOverallStats.mockResolvedValue(mockOverallStats);

      const result = await controller.getOverallStats();

      expect(serviceStatsService.getOverallStats).toHaveBeenCalledWith();
      expect(result).toEqual(mockOverallStats);
      expect(result.totalCompletedOrders).toBeDefined();
      expect(result.overallAccuracy).toBeDefined();
    });

    it('TC0002 - Should return zero stats when no data available', async () => {
      const emptyStats = {
        totalCompletedOrders: 0,
        averageExecutionTime: 0,
        averageEstimatedTime: 0,
        overallAccuracy: 0,
      };
      serviceStatsService.getOverallStats.mockResolvedValue(emptyStats);

      const result = await controller.getOverallStats();

      expect(serviceStatsService.getOverallStats).toHaveBeenCalledWith();
      expect(result).toEqual(emptyStats);
      expect(result.totalCompletedOrders).toBe(0);
    });

    it('TC0003 - Should throw error when service fails', async () => {
      const mockError = new Error('Service unavailable');
      serviceStatsService.getOverallStats.mockRejectedValue(mockError);

      await expect(controller.getOverallStats()).rejects.toThrow(mockError);
      expect(serviceStatsService.getOverallStats).toHaveBeenCalledWith();
    });
  });

  describe('getServiceStatsById', () => {
    const serviceId = faker.string.uuid();

    it('TC0001 - Should return statistics for a specific service', async () => {
      serviceStatsService.getServiceById.mockResolvedValue(
        mockSingleServiceStats,
      );

      const result = await controller.getServiceStatsById(serviceId);

      expect(serviceStatsService.getServiceById).toHaveBeenCalledWith(
        serviceId,
      );
      expect(result).toEqual(mockSingleServiceStats);
      expect(result.serviceId).toBe(mockSingleServiceStats.serviceId);
    });

    it('TC0002 - Should return message when service not found', async () => {
      serviceStatsService.getServiceById.mockResolvedValue(null);

      const result = await controller.getServiceStatsById(serviceId);

      expect(serviceStatsService.getServiceById).toHaveBeenCalledWith(
        serviceId,
      );
      expect(result).toEqual({
        message: 'Serviço não encontrado ou sem dados de execução suficientes',
        serviceId,
      });
    });

    it('TC0003 - Should throw error when database query fails', async () => {
      const mockError = new Error('Database query failed');
      serviceStatsService.getServiceById.mockRejectedValue(mockError);

      await expect(controller.getServiceStatsById(serviceId)).rejects.toThrow(
        mockError,
      );
      expect(serviceStatsService.getServiceById).toHaveBeenCalledWith(
        serviceId,
      );
    });

    it('TC0004 - Should handle invalid UUID format', async () => {
      const invalidServiceId = 'invalid-uuid';
      serviceStatsService.getServiceById.mockResolvedValue(null);

      const result = await controller.getServiceStatsById(invalidServiceId);

      expect(serviceStatsService.getServiceById).toHaveBeenCalledWith(
        invalidServiceId,
      );
      expect(result).toEqual({
        message: 'Serviço não encontrado ou sem dados de execução suficientes',
        serviceId: invalidServiceId,
      });
    });
  });
});

import { faker } from '@faker-js/faker';
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
    price: faker.number
      .float({ min: 50, max: 500, fractionDigits: 2 })
      .toFixed(2),
    category: mockCategory,
    estimatedMinutes: faker.number.int({ min: 30, max: 240 }),
  };

  const mockUpdateServiceDto: UpdateServiceDto = {
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(),
    price: faker.number
      .float({ min: 50, max: 500, fractionDigits: 2 })
      .toFixed(2),
    estimatedMinutes: faker.number.int({ min: 30, max: 240 }),
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

import { faker } from '@faker-js/faker';
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
