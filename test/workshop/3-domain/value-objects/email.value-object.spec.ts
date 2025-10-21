import { Email } from '../../../../src/workshop/3-domain/value-objects/email.value-object';

describe('Email', () => {
  describe('constructor', () => {
    it('TC0001 - Should create email with valid address', () => {
      const validEmail = 'user@example.com';

      const email = new Email(validEmail);

      expect(email.value).toBe('user@example.com');
    });

    it('TC0002 - Should convert email to lowercase', () => {
      const email = new Email('USER@EXAMPLE.COM');

      expect(email.value).toBe('user@example.com');
    });

    it('TC0003 - Should throw error for invalid email', () => {
      const invalidEmail = 'invalid-email';

      expect(() => new Email(invalidEmail)).toThrow('Email inválido');
    });

    it('TC0004 - Should throw error for email without domain', () => {
      const invalidEmail = 'user@';

      expect(() => new Email(invalidEmail)).toThrow('Email inválido');
    });

    it('TC0005 - Should throw error for email too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';

      expect(() => new Email(longEmail)).toThrow('Email inválido');
    });
  });

  describe('equals', () => {
    it('TC0001 - Should return true for equal emails', () => {
      const email1 = new Email('user@example.com');
      const email2 = new Email('USER@EXAMPLE.COM');

      const result = email1.equals(email2);

      expect(result).toBe(true);
    });

    it('TC0002 - Should return false for different emails', () => {
      const email1 = new Email('user1@example.com');
      const email2 = new Email('user2@example.com');

      const result = email1.equals(email2);

      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('TC0001 - Should return email value', () => {
      const email = new Email('user@example.com');

      const result = email.toString();

      expect(result).toBe('user@example.com');
    });
  });
});
