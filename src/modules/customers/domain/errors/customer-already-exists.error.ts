export class CustomerAlreadyExistsError extends Error {
  constructor(documentNumber: string) {
    super(`Customer with document ${documentNumber} already exists`);
    this.name = 'CustomerAlreadyExistsError';
  }
}
