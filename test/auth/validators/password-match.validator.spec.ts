import { ValidationArguments } from 'class-validator';
import { faker } from '@faker-js/faker/locale/pt_BR';

import { PasswordMatchValidator } from '../../../src/auth/validators/password-match.validator';

const TEST_PASSWORD = faker.internet.password();

describe('PasswordMatchValidator', () => {
  let validator: PasswordMatchValidator;

  beforeEach(() => {
    validator = new PasswordMatchValidator();
  });

  it('should be defined', () => {
    expect(validator).toBeDefined();
    expect(validator).toBeInstanceOf(PasswordMatchValidator);
  });

  it('should instantiate without dependencies', () => {
    const testValidator = new PasswordMatchValidator();
    expect(testValidator).toBeDefined();
  });

  describe('validate', () => {
    it('TC0001 - Should return true when passwords match', () => {
      const mockObject = {
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
      };

      const mockArgs: ValidationArguments = {
        object: mockObject,
        property: 'confirmPassword',
        value: TEST_PASSWORD,
        constraints: [],
        targetName: 'TestClass',
      };

      const result = validator.validate(TEST_PASSWORD, mockArgs);

      expect(result).toBe(true);
    });

    it('TC0002 - Should return false when passwords do not match', () => {
      const mockObject = {
        password: TEST_PASSWORD,
        confirmPassword: `${TEST_PASSWORD}_diff`,
      };

      const mockArgs: ValidationArguments = {
        object: mockObject,
        property: 'confirmPassword',
        value: `${TEST_PASSWORD}_diff`,
        constraints: [],
        targetName: 'TestClass',
      };

      const result = validator.validate(`${TEST_PASSWORD}_diff`, mockArgs);

      expect(result).toBe(false);
    });

    it('TC0003 - Should return false when password is undefined', () => {
      const mockObject = {
        password: undefined,
        confirmPassword: TEST_PASSWORD,
      };

      const mockArgs: ValidationArguments = {
        object: mockObject,
        property: 'confirmPassword',
        value: TEST_PASSWORD,
        constraints: [],
        targetName: 'TestClass',
      };

      const result = validator.validate(TEST_PASSWORD, mockArgs);

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
