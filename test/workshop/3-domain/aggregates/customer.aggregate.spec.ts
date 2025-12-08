import { CustomerType } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/pt_BR';

import { CustomerAggregate } from '../../../../src/workshop/3-domain/aggregates/customer.aggregate';

describe('CustomerAggregate', () => {
  const validCPF = '52998224725'; // CPF válido
  const anotherValidCPF = '85401325835'; // Outro CPF válido
  const validCNPJ = '11222333000181'; // CNPJ válido

  describe('create', () => {
    it('TC0001 - Should create a customer with all fields', () => {
      const id = faker.string.uuid();
      const name = '  João Silva  ';
      const email = faker.internet.email();
      const phone = '  11999887766  ';
      const address = '  Rua Test, 123  ';
      const additionalInfo = '  Cliente VIP  ';

      const customer = CustomerAggregate.create(
        id,
        validCPF,
        CustomerType.PESSOA_FISICA,
        name,
        email,
        phone,
        address,
        additionalInfo,
      );

      expect(customer.id).toBe(id);
      expect(customer.document.value).toBe(validCPF);
      expect(customer.type).toBe(CustomerType.PESSOA_FISICA);
      expect(customer.name).toBe('João Silva');
      expect(customer.phone).toBe('11999887766');
      expect(customer.address).toBe('Rua Test, 123');
      expect(customer.additionalInfo).toBe('Cliente VIP');
      expect(customer.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('fromDatabase', () => {
    it('TC0001 - Should create a customer from database data', () => {
      const data = {
        id: faker.string.uuid(),
        document: validCPF,
        type: CustomerType.PESSOA_FISICA,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        additionalInfo: faker.lorem.sentence(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const customer = CustomerAggregate.fromDatabase(data);

      expect(customer.id).toBe(data.id);
      expect(customer.document.value).toBe(data.document);
      expect(customer.createdAt).toBe(data.createdAt);
      expect(customer.updatedAt).toBe(data.updatedAt);
    });
  });

  describe('updatePersonalInfo', () => {
    let customer: CustomerAggregate;

    beforeEach(() => {
      customer = CustomerAggregate.create(
        faker.string.uuid(),
        validCPF,
        CustomerType.PESSOA_FISICA,
        faker.person.fullName(),
        faker.internet.email(),
        '11999887766',
        faker.location.streetAddress(),
      );
    });

    it('TC0001 - Should update personal info with additionalInfo', () => {
      const newAdditionalInfo = faker.lorem.sentence();

      customer.updatePersonalInfo(
        'João Silva',
        '11999887766',
        'Rua Nova, 456',
        newAdditionalInfo,
      );

      expect(customer.name).toBe('João Silva');
      expect(customer.additionalInfo).toBe(newAdditionalInfo.trim());
    });

    it('TC0002 - Should throw error when name is too short', () => {
      expect(() => {
        customer.updatePersonalInfo('A', '11999887766', 'Rua Nova, 456');
      }).toThrow('Nome deve ter pelo menos 2 caracteres');
    });

    it('TC0003 - Should throw error when phone is too short', () => {
      expect(() => {
        customer.updatePersonalInfo('João Silva', '123456789', 'Rua Nova, 456');
      }).toThrow('Telefone deve ter pelo menos 10 dígitos');
    });

    it('TC0004 - Should throw error when address is too short', () => {
      expect(() => {
        customer.updatePersonalInfo('João Silva', '11999887766', 'Short');
      }).toThrow('Endereço deve ter pelo menos 10 caracteres');
    });
  });

  describe('changeEmail', () => {
    it('TC0001 - Should change email successfully', () => {
      const customer = CustomerAggregate.create(
        faker.string.uuid(),
        validCPF,
        CustomerType.PESSOA_FISICA,
        faker.person.fullName(),
        faker.internet.email(),
        '11999887766',
        faker.location.streetAddress(),
      );

      const newEmail = faker.internet.email();
      customer.changeEmail(newEmail);

      expect(customer.email.value).toBe(newEmail.toLowerCase().trim());
    });
  });

  describe('changeDocument', () => {
    it('TC0001 - Should change document for same type', () => {
      const customer = CustomerAggregate.create(
        faker.string.uuid(),
        validCPF,
        CustomerType.PESSOA_FISICA,
        faker.person.fullName(),
        faker.internet.email(),
        '11999887766',
        faker.location.streetAddress(),
      );

      customer.changeDocument(anotherValidCPF);

      expect(customer.document.value).toBe(anotherValidCPF);
    });

    it('TC0002 - Should throw error when changing to incompatible document type', () => {
      const customer = CustomerAggregate.create(
        faker.string.uuid(),
        validCPF,
        CustomerType.PESSOA_FISICA,
        faker.person.fullName(),
        faker.internet.email(),
        '11999887766',
        faker.location.streetAddress(),
      );

      expect(() => {
        customer.changeDocument(validCNPJ);
      }).toThrow('Tipo de documento incompatível com o tipo de cliente');
    });
  });

  describe('isCompany', () => {
    it('TC0001 - Should return true for PESSOA_JURIDICA', () => {
      const customer = CustomerAggregate.create(
        faker.string.uuid(),
        validCNPJ,
        CustomerType.PESSOA_JURIDICA,
        faker.company.name(),
        faker.internet.email(),
        '11999887766',
        faker.location.streetAddress(),
      );

      expect(customer.isCompany()).toBe(true);
    });
  });

  describe('isIndividual', () => {
    it('TC0001 - Should return true for PESSOA_FISICA', () => {
      const customer = CustomerAggregate.create(
        faker.string.uuid(),
        validCPF,
        CustomerType.PESSOA_FISICA,
        faker.person.fullName(),
        faker.internet.email(),
        '11999887766',
        faker.location.streetAddress(),
      );

      expect(customer.isIndividual()).toBe(true);
    });
  });

  describe('getDocumentFormatted', () => {
    it('TC0001 - Should return formatted CPF', () => {
      const customer = CustomerAggregate.create(
        faker.string.uuid(),
        validCPF,
        CustomerType.PESSOA_FISICA,
        faker.person.fullName(),
        faker.internet.email(),
        '11999887766',
        faker.location.streetAddress(),
      );

      expect(customer.getDocumentFormatted()).toBe('529.982.247-25');
    });

    it('TC0002 - Should return formatted CNPJ', () => {
      const customer = CustomerAggregate.create(
        faker.string.uuid(),
        validCNPJ,
        CustomerType.PESSOA_JURIDICA,
        faker.company.name(),
        faker.internet.email(),
        '11999887766',
        faker.location.streetAddress(),
      );

      expect(customer.getDocumentFormatted()).toBe('11.222.333/0001-81');
    });
  });
});
