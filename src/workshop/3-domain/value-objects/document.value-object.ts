import { DocumentUtils } from '../../../shared/utils/document.utils';

export class Document {
  public readonly value: string;

  constructor(document: string) {
    const normalized = DocumentUtils.normalize(document);
    if (!DocumentUtils.isValid(normalized)) {
      throw new Error('Documento inválido');
    }
    this.value = normalized;
  }

  getValue(): string {
    return this.value;
  }

  getFormatted(): string {
    return DocumentUtils.format(this.value);
  }

  isCPF(): boolean {
    return this.value.length === 11;
  }

  isCNPJ(): boolean {
    return this.value.length === 14;
  }

  toString(): string {
    return this.value;
  }

  equals(other: Document): boolean {
    return this.value === other.value;
  }
}
