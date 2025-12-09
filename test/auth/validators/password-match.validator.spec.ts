import { ValidationArguments } from 'class-validator';
<<<<<<< HEAD

import { PasswordMatchValidator } from '../../../src/auth/validators/password-match.validator';

=======
import { faker } from '@faker-js/faker/locale/pt_BR';

import { PasswordMatchValidator } from '../../../src/auth/validators/password-match.validator';

const TEST_PASSWORD = faker.internet.password();

>>>>>>> develop
describe('PasswordMatchValidator', () => {
  let validator: PasswordMatchValidator;

  beforeEach(() => {
    validator = new PasswordMatchValidator();
  });

<<<<<<< HEAD
  it('Should be defined', () => {
=======
  it('should be defined', () => {
>>>>>>> develop
    expect(validator).toBeDefined();
    expect(validator).toBeInstanceOf(PasswordMatchValidator);
  });

<<<<<<< HEAD
  it('Should instantiate without dependencies', () => {
=======
  it('should instantiate without dependencies', () => {
>>>>>>> develop
    const testValidator = new PasswordMatchValidator();
    expect(testValidator).toBeDefined();
  });

  describe('validate', () => {
    it('TC0001 - Should return true when passwords match', () => {
      const mockObject = {
<<<<<<< HEAD
        password: 'password123',
        confirmPassword: 'password123',
=======
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
>>>>>>> develop
      };

      const mockArgs: ValidationArguments = {
        object: mockObject,
        property: 'confirmPassword',
<<<<<<< HEAD
        value: 'password123',
=======
        value: TEST_PASSWORD,
>>>>>>> develop
        constraints: [],
        targetName: 'TestClass',
      };

<<<<<<< HEAD
      const result = validator.validate('password123', mockArgs);
=======
      const result = validator.validate(TEST_PASSWORD, mockArgs);
>>>>>>> develop

      expect(result).toBe(true);
    });

    it('TC0002 - Should return false when passwords do not match', () => {
      const mockObject = {
<<<<<<< HEAD
        password: 'password123',
        confirmPassword: 'differentPassword',
=======
        password: TEST_PASSWORD,
        confirmPassword: `${TEST_PASSWORD}_diff`,
>>>>>>> develop
      };

      const mockArgs: ValidationArguments = {
        object: mockObject,
        property: 'confirmPassword',
<<<<<<< HEAD
        value: 'differentPassword',
=======
        value: `${TEST_PASSWORD}_diff`,
>>>>>>> develop
        constraints: [],
        targetName: 'TestClass',
      };

<<<<<<< HEAD
      const result = validator.validate('differentPassword', mockArgs);
=======
      const result = validator.validate(`${TEST_PASSWORD}_diff`, mockArgs);
>>>>>>> develop

      expect(result).toBe(false);
    });

    it('TC0003 - Should return false when password is undefined', () => {
      const mockObject = {
        password: undefined,
<<<<<<< HEAD
        confirmPassword: 'password123',
=======
        confirmPassword: TEST_PASSWORD,
>>>>>>> develop
      };

      const mockArgs: ValidationArguments = {
        object: mockObject,
        property: 'confirmPassword',
<<<<<<< HEAD
        value: 'password123',
=======
        value: TEST_PASSWORD,
>>>>>>> develop
        constraints: [],
        targetName: 'TestClass',
      };

<<<<<<< HEAD
      const result = validator.validate('password123', mockArgs);
=======
      const result = validator.validate(TEST_PASSWORD, mockArgs);
>>>>>>> develop

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
