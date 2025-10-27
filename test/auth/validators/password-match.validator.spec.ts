import { ValidationArguments } from 'class-validator';

import { PasswordMatchValidator } from '../../../src/auth/validators/password-match.validator';

describe('PasswordMatchValidator', () => {
  let validator: PasswordMatchValidator;

  beforeEach(() => {
    validator = new PasswordMatchValidator();
  });

  it('Should be defined', () => {
    expect(validator).toBeDefined();
    expect(validator).toBeInstanceOf(PasswordMatchValidator);
  });

  it('Should instantiate without dependencies', () => {
    const testValidator = new PasswordMatchValidator();
    expect(testValidator).toBeDefined();
  });

  describe('validate', () => {
    it('TC0001 - Should return true when passwords match', () => {
      const mockObject = {
        password: 'password123',
        confirmPassword: 'password123',
      };

      const mockArgs: ValidationArguments = {
        object: mockObject,
        property: 'confirmPassword',
        value: 'password123',
        constraints: [],
        targetName: 'TestClass',
      };

      const result = validator.validate('password123', mockArgs);

      expect(result).toBe(true);
    });

    it('TC0002 - Should return false when passwords do not match', () => {
      const mockObject = {
        password: 'password123',
        confirmPassword: 'differentPassword',
      };

      const mockArgs: ValidationArguments = {
        object: mockObject,
        property: 'confirmPassword',
        value: 'differentPassword',
        constraints: [],
        targetName: 'TestClass',
      };

      const result = validator.validate('differentPassword', mockArgs);

      expect(result).toBe(false);
    });

    it('TC0003 - Should return false when password is undefined', () => {
      const mockObject = {
        password: undefined,
        confirmPassword: 'password123',
      };

      const mockArgs: ValidationArguments = {
        object: mockObject,
        property: 'confirmPassword',
        value: 'password123',
        constraints: [],
        targetName: 'TestClass',
      };

      const result = validator.validate('password123', mockArgs);

      expect(result).toBe(false);
    });

    it('TC0004 - Should return true when both passwords are undefined', () => {
      const mockObject = {
        password: undefined,
        confirmPassword: undefined,
      };

      const mockArgs: ValidationArguments = {
        object: mockObject,
        property: 'confirmPassword',
        value: undefined,
        constraints: [],
        targetName: 'TestClass',
      };

      const result = validator.validate(undefined as any, mockArgs);

      expect(result).toBe(true);
    });

    it('TC0005 - Should return true when both passwords are empty strings', () => {
      const mockObject = {
        password: '',
        confirmPassword: '',
      };

      const mockArgs: ValidationArguments = {
        object: mockObject,
        property: 'confirmPassword',
        value: '',
        constraints: [],
        targetName: 'TestClass',
      };

      const result = validator.validate('', mockArgs);

      expect(result).toBe(true);
    });
  });

  describe('defaultMessage', () => {
    it('TC0001 - Should return correct error message', () => {
      const mockArgs: ValidationArguments = {
        object: {},
        property: 'confirmPassword',
        value: 'someValue',
        constraints: [],
        targetName: 'TestClass',
      };

      const result = validator.defaultMessage(mockArgs);

      expect(result).toBe('A confirmação de senha deve ser igual à senha');
    });
  });
});
