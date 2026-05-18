export class InvalidMileageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMileageError';
  }
}
