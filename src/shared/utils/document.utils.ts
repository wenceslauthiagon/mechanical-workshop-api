export class DocumentUtils {
  static normalize(document: string): string {
    return document ? document.replace(/\D/g, '') : '';
  }

  static validateAndNormalize(document: string): string {
    const normalized = this.normalize(document);
    if (!this.isValid(normalized)) {
      throw new Error('Invalid document');
    }
    return normalized;
  }

  static isValid(document: string): boolean {
    if (!document) return false;

    // Remove caracteres não numéricos
    const cleanDoc = document.replace(/\D/g, '');

    // Valida CPF (11 dígitos)
    if (cleanDoc.length === 11) {
      return this.isValidCPF(cleanDoc);
    }

    // Valida CNPJ (14 dígitos)
    if (cleanDoc.length === 14) {
      return this.isValidCNPJ(cleanDoc);
    }

    return false;
  }

  static format(document: string): string {
    if (!document) return '';

    const cleanDoc = document.replace(/\D/g, '');

    // Formata CPF
    if (cleanDoc.length === 11) {
      return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    // Formata CNPJ
    if (cleanDoc.length === 14) {
      return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    return document;
  }

  private static isValidCPF(cpf: string): boolean {
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Valida primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) return false;

    // Valida segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  private static isValidCNPJ(cnpj: string): boolean {
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    // Valida primeiro dígito verificador
    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    const digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    // Valida segundo dígito verificador
    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
  }
}
