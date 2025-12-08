import { BaseSpecification } from '../../../../src/workshop/3-domain/specifications/base-specification';

class GreaterThanSpecification extends BaseSpecification<number> {
  constructor(private readonly threshold: number) {
    super();
  }

  isSatisfiedBy(candidate: number): boolean {
    return candidate > this.threshold;
  }
}

describe('BaseSpecification', () => {
  describe('isSatisfiedBy', () => {
    it('TC0001 - Should return true when candidate satisfies specification', () => {
      const spec = new GreaterThanSpecification(5);

      const result = spec.isSatisfiedBy(10);

      expect(result).toBe(true);
    });

    it('TC0002 - Should return false when candidate does not satisfy specification', () => {
      const spec = new GreaterThanSpecification(5);

      const result = spec.isSatisfiedBy(3);

      expect(result).toBe(false);
    });
  });

  describe('and', () => {
    it('TC0001 - Should return true when both specifications are satisfied', () => {
      const spec1 = new GreaterThanSpecification(5);
      const spec2 = new GreaterThanSpecification(3);

      const andSpec = spec1.and(spec2);

      expect(andSpec.isSatisfiedBy(10)).toBe(true);
    });

    it('TC0002 - Should return false when first specification is not satisfied', () => {
      const spec1 = new GreaterThanSpecification(5);
      const spec2 = new GreaterThanSpecification(3);

      const andSpec = spec1.and(spec2);

      expect(andSpec.isSatisfiedBy(4)).toBe(false);
    });

    it('TC0003 - Should return false when second specification is not satisfied', () => {
      const spec1 = new GreaterThanSpecification(5);
      const spec2 = new GreaterThanSpecification(10);

      const andSpec = spec1.and(spec2);

      expect(andSpec.isSatisfiedBy(7)).toBe(false);
    });
  });

  describe('or', () => {
    it('TC0001 - Should return true when both specifications are satisfied', () => {
      const spec1 = new GreaterThanSpecification(5);
      const spec2 = new GreaterThanSpecification(3);

      const orSpec = spec1.or(spec2);

      expect(orSpec.isSatisfiedBy(10)).toBe(true);
    });

    it('TC0002 - Should return true when first specification is satisfied', () => {
      const spec1 = new GreaterThanSpecification(5);
      const spec2 = new GreaterThanSpecification(10);

      const orSpec = spec1.or(spec2);

      expect(orSpec.isSatisfiedBy(7)).toBe(true);
    });

    it('TC0003 - Should return true when second specification is satisfied', () => {
      const spec1 = new GreaterThanSpecification(10);
      const spec2 = new GreaterThanSpecification(5);

      const orSpec = spec1.or(spec2);

      expect(orSpec.isSatisfiedBy(7)).toBe(true);
    });

    it('TC0004 - Should return false when both specifications are not satisfied', () => {
      const spec1 = new GreaterThanSpecification(5);
      const spec2 = new GreaterThanSpecification(10);

      const orSpec = spec1.or(spec2);

      expect(orSpec.isSatisfiedBy(3)).toBe(false);
    });
  });

  describe('not', () => {
    it('TC0001 - Should return true when specification is not satisfied', () => {
      const spec = new GreaterThanSpecification(10);

      const notSpec = spec.not();

      expect(notSpec.isSatisfiedBy(5)).toBe(true);
    });

    it('TC0002 - Should return false when specification is satisfied', () => {
      const spec = new GreaterThanSpecification(5);

      const notSpec = spec.not();

      expect(notSpec.isSatisfiedBy(10)).toBe(false);
    });
  });
});
