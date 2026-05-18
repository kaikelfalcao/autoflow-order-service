import { InvalidPlateError } from '../errors/invalid-plate.error';

// Accepts: ABC-1234 (old format) and ABC-1D23 (Mercosul)
const OLD_PLATE_REGEX = /^[A-Z]{3}[0-9]{4}$/;
const MERCOSUL_REGEX = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

export class Plate {
  readonly value: string; // normalized: ABCD1234 (no hyphen, uppercase)

  constructor(raw: string) {
    const normalized = raw.toUpperCase().replace(/[-\s]/g, '');
    if (!OLD_PLATE_REGEX.test(normalized) && !MERCOSUL_REGEX.test(normalized)) {
      throw new InvalidPlateError(raw);
    }
    this.value = normalized;
  }

  formatted(): string {
    return `${this.value.slice(0, 3)}-${this.value.slice(3)}`;
  }
}
