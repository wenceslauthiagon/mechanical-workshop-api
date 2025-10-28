import { LicensePlate } from '../../../../src/workshop/3-domain/value-objects/license-plate.value-object';

describe('LicensePlate', () => {
  describe('constructor', () => {
    it('TC0001 - Should create license plate with old format', () => {
      const plate = 'ABC1234';

      const licensePlate = new LicensePlate(plate);

      expect(licensePlate.value).toBe('ABC1234');
    });

    it('TC0002 - Should create license plate with Mercosul format', () => {
      const plate = 'ABC1D23';

      const licensePlate = new LicensePlate(plate);

      expect(licensePlate.value).toBe('ABC1D23');
    });

    it('TC0003 - Should clean plate value', () => {
      const plate = 'ABC-1234';

      const licensePlate = new LicensePlate(plate);

      expect(licensePlate.value).toBe('ABC1234');
    });

    it('TC0004 - Should throw error for invalid plate', () => {
      const invalid = '123ABC';

      expect(() => new LicensePlate(invalid)).toThrow('Placa inválida');
    });

    it('TC0005 - Should throw error for plate with wrong length', () => {
      const invalid = 'ABC123';

      expect(() => new LicensePlate(invalid)).toThrow('Placa inválida');
    });

    it('TC0006 - Should throw error for plate with wrong format', () => {
      const invalid = 'A1C1234';

      expect(() => new LicensePlate(invalid)).toThrow('Placa inválida');
    });
  });

  describe('formatted', () => {
    it('TC0001 - Should format old format plate correctly', () => {
      const licensePlate = new LicensePlate('ABC1234');

      const result = licensePlate.formatted;

      expect(result).toBe('ABC-1234');
    });

    it('TC0002 - Should format Mercosul plate correctly', () => {
      const licensePlate = new LicensePlate('ABC1D23');

      const result = licensePlate.formatted;

      expect(result).toBe('ABC-1D23');
    });

    it('TC0003 - Should handle edge case with internal value manipulation', () => {
      const licensePlate = new LicensePlate('ABC1234');

      (licensePlate as any)._value = 'ABC';

      const result = licensePlate.formatted;

      expect(result).toBe('ABC');
    });
  });

  describe('equals', () => {
    it('TC0001 - Should return true for equal plates', () => {
      const plate1 = new LicensePlate('ABC1234');
      const plate2 = new LicensePlate('ABC-1234');

      const result = plate1.equals(plate2);

      expect(result).toBe(true);
    });

    it('TC0002 - Should return false for different plates', () => {
      const plate1 = new LicensePlate('ABC1234');
      const plate2 = new LicensePlate('XYZ9876');

      const result = plate1.equals(plate2);

      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('TC0001 - Should return plate value', () => {
      const licensePlate = new LicensePlate('ABC1234');

      const result = licensePlate.toString();

      expect(result).toBe('ABC1234');
    });
  });
});
