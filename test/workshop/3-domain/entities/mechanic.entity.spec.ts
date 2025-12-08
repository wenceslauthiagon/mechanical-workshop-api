import { faker } from '@faker-js/faker/locale/pt_BR';
import { Mechanic } from '../../../../src/workshop/3-domain/entities/mechanic.entity';

describe('Mechanic', () => {
  const mechanicData = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    specialties: ['Motor', 'Freios'],
    isActive: true,
    isAvailable: true,
    experienceYears: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('constructor', () => {
    it('TC0001 - Should create mechanic with all properties', () => {
      const mechanic = new Mechanic(
        mechanicData.id,
        mechanicData.name,
        mechanicData.email,
        mechanicData.specialties,
        mechanicData.isActive,
        mechanicData.isAvailable,
        mechanicData.experienceYears,
        mechanicData.phone,
        mechanicData.createdAt,
        mechanicData.updatedAt,
      );

      expect(mechanic.id).toBe(mechanicData.id);
      expect(mechanic.name).toBe(mechanicData.name);
      expect(mechanic.email).toBe(mechanicData.email);
      expect(mechanic.specialties).toEqual(mechanicData.specialties);
      expect(mechanic.isActive).toBe(mechanicData.isActive);
      expect(mechanic.isAvailable).toBe(mechanicData.isAvailable);
      expect(mechanic.experienceYears).toBe(mechanicData.experienceYears);
      expect(mechanic.phone).toBe(mechanicData.phone);
      expect(mechanic.createdAt).toBe(mechanicData.createdAt);
      expect(mechanic.updatedAt).toBe(mechanicData.updatedAt);
    });

    it('TC0002 - Should create mechanic with default values', () => {
      const mechanic = new Mechanic(
        mechanicData.id,
        mechanicData.name,
        mechanicData.email,
        mechanicData.specialties,
      );

      expect(mechanic.isActive).toBe(true);
      expect(mechanic.isAvailable).toBe(true);
      expect(mechanic.experienceYears).toBe(0);
      expect(mechanic.createdAt).toBeInstanceOf(Date);
      expect(mechanic.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('create', () => {
    it('TC0001 - Should create mechanic data with all properties', () => {
      const data = {
        name: mechanicData.name,
        email: mechanicData.email,
        phone: mechanicData.phone,
        specialties: mechanicData.specialties,
        experienceYears: mechanicData.experienceYears,
      };

      const result = Mechanic.create(data);

      expect(result.name).toBe(data.name);
      expect(result.email).toBe(data.email);
      expect(result.phone).toBe(data.phone);
      expect(result.specialties).toEqual(data.specialties);
      expect(result.experienceYears).toBe(data.experienceYears);
      expect(result.isActive).toBe(true);
      expect(result.isAvailable).toBe(true);
    });

    it('TC0002 - Should create mechanic data with default experience years', () => {
      const data = {
        name: mechanicData.name,
        email: mechanicData.email,
        specialties: mechanicData.specialties,
      };

      const result = Mechanic.create(data);

      expect(result.experienceYears).toBe(0);
    });
  });

  describe('toggleAvailability', () => {
    it('TC0001 - Should toggle availability from true to false', () => {
      const mechanic = new Mechanic(
        mechanicData.id,
        mechanicData.name,
        mechanicData.email,
        mechanicData.specialties,
        true,
        true,
        mechanicData.experienceYears,
        mechanicData.phone,
        mechanicData.createdAt,
        mechanicData.updatedAt,
      );

      const result = mechanic.toggleAvailability();

      expect(result.isAvailable).toBe(false);
    });

    it('TC0002 - Should toggle availability from false to true', () => {
      const mechanic = new Mechanic(
        mechanicData.id,
        mechanicData.name,
        mechanicData.email,
        mechanicData.specialties,
        true,
        false,
        mechanicData.experienceYears,
        mechanicData.phone,
        mechanicData.createdAt,
        mechanicData.updatedAt,
      );

      const result = mechanic.toggleAvailability();

      expect(result.isAvailable).toBe(true);
    });

    it('TC0003 - Should update updatedAt when toggling', () => {
      const mechanic = new Mechanic(
        mechanicData.id,
        mechanicData.name,
        mechanicData.email,
        mechanicData.specialties,
        true,
        true,
        mechanicData.experienceYears,
        mechanicData.phone,
        mechanicData.createdAt,
        mechanicData.updatedAt,
      );

      const beforeToggle = new Date();
      const result = mechanic.toggleAvailability();
      const afterToggle = new Date();

      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeToggle.getTime(),
      );
      expect(result.updatedAt.getTime()).toBeLessThanOrEqual(
        afterToggle.getTime(),
      );
    });
  });

  describe('updateSpecialties', () => {
    it('TC0001 - Should update specialties', () => {
      const mechanic = new Mechanic(
        mechanicData.id,
        mechanicData.name,
        mechanicData.email,
        mechanicData.specialties,
      );
      const newSpecialties = ['Suspensão', 'Elétrica'];

      const result = mechanic.updateSpecialties(newSpecialties);

      expect(result.specialties).toEqual(newSpecialties);
    });

    it('TC0002 - Should update updatedAt when updating specialties', () => {
      const mechanic = new Mechanic(
        mechanicData.id,
        mechanicData.name,
        mechanicData.email,
        mechanicData.specialties,
        true,
        true,
        mechanicData.experienceYears,
        mechanicData.phone,
        mechanicData.createdAt,
        mechanicData.updatedAt,
      );

      const beforeUpdate = new Date();
      const result = mechanic.updateSpecialties(['Nova Especialidade']);
      const afterUpdate = new Date();

      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
      expect(result.updatedAt.getTime()).toBeLessThanOrEqual(
        afterUpdate.getTime(),
      );
    });
  });

  describe('hasSpecialty', () => {
    it('TC0001 - Should return true when mechanic has specialty', () => {
      const mechanic = new Mechanic(
        mechanicData.id,
        mechanicData.name,
        mechanicData.email,
        ['Motor', 'Freios'],
      );

      const result = mechanic.hasSpecialty('Motor');

      expect(result).toBe(true);
    });

    it('TC0002 - Should return false when mechanic does not have specialty', () => {
      const mechanic = new Mechanic(
        mechanicData.id,
        mechanicData.name,
        mechanicData.email,
        ['Motor'],
      );

      const result = mechanic.hasSpecialty('Freios');

      expect(result).toBe(false);
    });
  });

  describe('isQualifiedFor', () => {
    it('TC0001 - Should return true when mechanic has at least one required specialty', () => {
      const mechanic = new Mechanic(
        mechanicData.id,
        mechanicData.name,
        mechanicData.email,
        ['Motor', 'Freios'],
      );

      const result = mechanic.isQualifiedFor(['Motor', 'Suspensão']);

      expect(result).toBe(true);
    });

    it('TC0002 - Should return false when mechanic has no required specialties', () => {
      const mechanic = new Mechanic(
        mechanicData.id,
        mechanicData.name,
        mechanicData.email,
        ['Motor'],
      );

      const result = mechanic.isQualifiedFor(['Freios', 'Suspensão']);

      expect(result).toBe(false);
    });
  });
});
