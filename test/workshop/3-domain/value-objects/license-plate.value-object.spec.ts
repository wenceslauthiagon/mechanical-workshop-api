import { faker } from '@faker-js/faker';
import { LicensePlate } from '../../../../src/workshop/3-domain/value-objects/license-plate.value-object';

const OLD_PLATE = faker.helpers.replaceSymbols('???####').toUpperCase();
const MERCOSUL_PLATE = faker.helpers.replaceSymbols('???#?##').toUpperCase();
const OTHER_PLATE = faker.helpers.replaceSymbols('???####').toUpperCase();

describe('LicensePlate', () => {
  describe('constructor', () => {
    it('TC0001 - Should create license plate with old format', () => {
      const licensePlate = new LicensePlate(OLD_PLATE);

      expect(licensePlate.value).toBe(OLD_PLATE);
    });

    it('TC0002 - Should create license plate with Mercosul format', () => {
      const licensePlate = new LicensePlate(MERCOSUL_PLATE);

      expect(licensePlate.value).toBe(MERCOSUL_PLATE);
    });

    it('TC0003 - Should clean plate value', () => {
      const raw = faker.helpers.replaceSymbols('???-####').toUpperCase();
      const cleaned = raw.replace(/[^A-Za-z0-9]/g, '');
      const licensePlate = new LicensePlate(raw);

      expect(licensePlate.value).toBe(cleaned);
    });

    it('TC0004 - Should throw error for invalid plate', () => {
      expect(() => new LicensePlate('123ABC')).toThrow('Placa inválida');
    });

    it('TC0005 - Should throw error for plate with wrong length', () => {
      expect(() => new LicensePlate('ABC123')).toThrow('Placa inválida');
    });

    it('TC0006 - Should throw error for plate with wrong format', () => {
      expect(() => new LicensePlate('A1C1234')).toThrow('Placa inválida');
    });
  });

  describe('formatted', () => {
    it('TC0001 - Should format old format plate correctly', () => {
      const licensePlate = new LicensePlate(OLD_PLATE);
      const result = licensePlate.formatted;
      expect(result).toBe(OLD_PLATE.replace(/^([A-Z]{3})([0-9A-Z]{4})$/, '$1-$2'));
    });

    it('TC0002 - Should format Mercosul plate correctly', () => {
      const licensePlate = new LicensePlate(MERCOSUL_PLATE);
      const result = licensePlate.formatted;
      expect(result).toBe(MERCOSUL_PLATE.replace(/^([A-Z]{3})([0-9A-Z]{4})$/, '$1-$2'));
    });

    it('TC0003 - Should return raw value when value length is not 7', () => {
      const licensePlate = new LicensePlate(OLD_PLATE);
      (licensePlate as any)._value = OTHER_PLATE.slice(0, 6);
      const result = licensePlate.formatted;
      expect(result).toBe(OTHER_PLATE.slice(0, 6));
    });
  });

  describe('equals', () => {
    it('TC0001 - Should return true for equal plates', () => {
      const plate1 = new LicensePlate(OLD_PLATE);
      const plate2 = new LicensePlate(OLD_PLATE.replace(/^([A-Z]{3})([0-9A-Z]{4})$/, '$1-$2'));
      const result = plate1.equals(plate2);
      expect(result).toBe(true);
    });

    it('TC0002 - Should return false for different plates', () => {
      const plate1 = new LicensePlate(OLD_PLATE);
      const plate2 = new LicensePlate(OTHER_PLATE);
      const result = plate1.equals(plate2);
      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('TC0001 - Should return plate value', () => {
      const licensePlate = new LicensePlate(OLD_PLATE);
      const result = licensePlate.toString();
      expect(result).toBe(OLD_PLATE);
    });
  });
});
