import { DocumentType } from '../enums/document-type.enum';
import { InvalidDocumentError } from '../errors/invalid-document.error';

export class Document {
  readonly type: DocumentType;
  readonly value: string; // always clean digits

  constructor(type: DocumentType, rawNumber: string) {
    const clean = rawNumber.replace(/\D/g, '');
    if (type === DocumentType.CPF) {
      Document.validateCpf(clean);
    } else {
      Document.validateCnpj(clean);
    }
    this.type = type;
    this.value = clean;
  }

  formatted(): string {
    if (this.type === DocumentType.CPF) {
      return this.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return this.value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  private static validateCpf(cpf: string): void {
    if (cpf.length !== 11) throw new InvalidDocumentError('CPF must have 11 digits');
    if (/^(\d)\1+$/.test(cpf)) throw new InvalidDocumentError('CPF with all equal digits is invalid');

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf[9])) throw new InvalidDocumentError('Invalid CPF check digit');

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf[10])) throw new InvalidDocumentError('Invalid CPF check digit');
  }

  private static validateCnpj(cnpj: string): void {
    if (cnpj.length !== 14) throw new InvalidDocumentError('CNPJ must have 14 digits');
    if (/^(\d)\1+$/.test(cnpj)) throw new InvalidDocumentError('CNPJ with all equal digits is invalid');

    const calc = (cnpj: string, weights: number[]): number => {
      const sum = weights.reduce((acc, w, i) => acc + parseInt(cnpj[i]) * w, 0);
      const remainder = sum % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };

    const d1 = calc(cnpj, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    if (d1 !== parseInt(cnpj[12])) throw new InvalidDocumentError('Invalid CNPJ check digit');

    const d2 = calc(cnpj, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    if (d2 !== parseInt(cnpj[13])) throw new InvalidDocumentError('Invalid CNPJ check digit');
  }
}
