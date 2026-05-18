import { Document } from '../../../src/modules/customers/domain/value-objects/document.vo';
import { DocumentType } from '../../../src/modules/customers/domain/enums/document-type.enum';
import { InvalidDocumentError } from '../../../src/modules/customers/domain/errors/invalid-document.error';

describe('Document VO', () => {
  describe('CPF', () => {
    it('accepts a valid CPF', () => {
      const doc = new Document(DocumentType.CPF, '111.444.777-35');
      expect(doc.value).toBe('11144477735');
    });

    it('accepts CPF without formatting', () => {
      const doc = new Document(DocumentType.CPF, '11144477735');
      expect(doc.value).toBe('11144477735');
    });

    it('rejects CPF with invalid check digits', () => {
      expect(() => new Document(DocumentType.CPF, '11144477700')).toThrow(InvalidDocumentError);
    });

    it('rejects CPF with all equal digits', () => {
      expect(() => new Document(DocumentType.CPF, '11111111111')).toThrow(InvalidDocumentError);
    });

    it('formats CPF correctly', () => {
      const doc = new Document(DocumentType.CPF, '11144477735');
      expect(doc.formatted()).toBe('111.444.777-35');
    });
  });

  describe('CNPJ', () => {
    it('accepts a valid CNPJ', () => {
      const doc = new Document(DocumentType.CNPJ, '11.222.333/0001-81');
      expect(doc.value).toBe('11222333000181');
    });

    it('accepts CNPJ without formatting', () => {
      const doc = new Document(DocumentType.CNPJ, '11222333000181');
      expect(doc.value).toBe('11222333000181');
    });

    it('rejects CNPJ with invalid check digits', () => {
      expect(() => new Document(DocumentType.CNPJ, '11222333000100')).toThrow(InvalidDocumentError);
    });

    it('rejects CNPJ with all equal digits', () => {
      expect(() => new Document(DocumentType.CNPJ, '11111111111111')).toThrow(InvalidDocumentError);
    });

    it('formats CNPJ correctly', () => {
      const doc = new Document(DocumentType.CNPJ, '11222333000181');
      expect(doc.formatted()).toBe('11.222.333/0001-81');
    });
  });
});
