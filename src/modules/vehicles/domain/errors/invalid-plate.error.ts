export class InvalidPlateError extends Error {
  constructor(plate: string) {
    super(`Invalid vehicle plate: ${plate}`);
    this.name = "InvalidPlateError";
  }
}
