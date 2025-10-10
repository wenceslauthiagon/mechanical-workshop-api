import { Document } from '../../workshop/3-domain/value-objects';

/**
 * Utilitários para normalização de documentos (CPF/CNPJ)
 * Usa o Value Object Document para garantir consistência
 */
export class DocumentUtils {
  /**
   * Normaliza um documento removendo todos os caracteres não numéricos
   * @param document - Documento com ou sem formatação
   * @returns Documento apenas com números (sem validação)
   * @example
   * normalize('123.456.789-01') // '12345678901'
   * normalize('12345678901') // '12345678901'
   */
  static normalize(document: string): string {
    if (!document) {
      return '';
    }
    return document.replace(/[^\d]/g, '');
  }

  /**
   * Valida e normaliza um documento usando o Value Object Document
   * @param document - Documento com ou sem formatação
   * @returns Documento normalizado e válido (apenas números)
   * @throws Error se o documento for inválido
   */
  static validateAndNormalize(document: string): string {
    const documentVO = new Document(document);
    // Garantir que retorna apenas números
    return documentVO.toString();
  }

  /**
   * Formata um documento usando o Value Object Document
   * @param document - Documento com ou sem formatação
   * @returns Documento formatado
   * @throws Error se o documento for inválido
   */
  static format(document: string): string {
    const documentVO = new Document(document);
    return documentVO.formatted;
  }

  /**
   * Verifica se um documento é válido sem lançar exceção
   * @param document - Documento com ou sem formatação
   * @returns true se válido, false se inválido
   */
  static isValid(document: string): boolean {
    try {
      new Document(document);
      return true;
    } catch {
      return false;
    }
  }
}
