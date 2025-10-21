import { Document } from '../../../../src/workshop/3-domain/value-objects/document.value-object';

describe('Document', () => {
  describe('constructor', () => {
    it('TC0001 - Should create document with valid CPF', () => {
      const cpf = '529.982.247-25';

      const document = new Document(cpf);

      expect(document.value).toBe('52998224725');
    });

    it('TC0002 - Should create document with valid CNPJ', () => {
      const cnpj = '11.222.333/0001-81';

      const document = new Document(cnpj);

      expect(document.value).toBe('11222333000181');
    });

    it('TC0003 - Should create document with CNPJ with remainder less than 2', () => {
      const cnpj = '11.444.777/0001-61';

      const document = new Document(cnpj);

      expect(document.value).toBe('11444777000161');
    });

    it('TC0004 - Should create document with CNPJ with remainder greater than 2', () => {
      const cnpj = '06.990.590/0001-23';

      const document = new Document(cnpj);

      expect(document.value).toBe('06990590000123');
    });

    it('TC0005 - Should throw error for invalid document', () => {
      const invalid = '123.456.789-00';

      expect(() => new Document(invalid)).toThrow('Documento inválido');
    });

    it('TC0006 - Should throw error for CPF with invalid first digit', () => {
      const invalid = '52998224735';

      expect(() => new Document(invalid)).toThrow('Documento inválido');
    });

    it('TC0007 - Should throw error for CPF with invalid second digit', () => {
      const invalid = '52998224726';

      expect(() => new Document(invalid)).toThrow('Documento inválido');
    });

    it('TC0008 - Should create CPF where remainder needs normalization', () => {
      const cpf = '11144477735';

      const document = new Document(cpf);

      expect(document.value).toBe('11144477735');
    });

    it('TC0009 - Should throw error for CNPJ with invalid first digit', () => {
      const invalid = '11222333000191';

      expect(() => new Document(invalid)).toThrow('Documento inválido');
    });

    it('TC0010 - Should throw error for CNPJ with invalid second digit', () => {
      const invalid = '11222333000182';

      expect(() => new Document(invalid)).toThrow('Documento inválido');
    });

    it('TC0011 - Should clean document value', () => {
      const cpf = '529.982.247-25';

      const document = new Document(cpf);

      expect(document.value).toBe('52998224725');
    });
  });

  describe('formatted', () => {
    it('TC0001 - Should format CPF correctly', () => {
      const document = new Document('52998224725');

      const result = document.formatted;

      expect(result).toBe('529.982.247-25');
    });

    it('TC0002 - Should format CNPJ correctly', () => {
      const document = new Document('11222333000181');

      const result = document.formatted;

      expect(result).toBe('11.222.333/0001-81');
    });
  });

  describe('equals', () => {
    it('TC0001 - Should return true for equal documents', () => {
      const doc1 = new Document('52998224725');
      const doc2 = new Document('529.982.247-25');

      const result = doc1.equals(doc2);

      expect(result).toBe(true);
    });

    it('TC0002 - Should return false for different documents', () => {
      const doc1 = new Document('52998224725');
      const doc2 = new Document('11222333000181');

      const result = doc1.equals(doc2);

      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('TC0001 - Should return clean document value', () => {
      const document = new Document('529.982.247-25');

      const result = document.toString();

      expect(result).toBe('52998224725');
    });
  });
});
