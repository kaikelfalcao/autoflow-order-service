import { randomUUID } from 'crypto';

export abstract class Identity {
  protected constructor(private readonly _value: string) {
    if (!_value?.trim()) {
      throw new Error('Identity value is required');
    }
  }

  static fromString<T extends Identity>(this: any, value: string): T {
    return new this(value) as T;
  }

  static generate<T extends Identity>(this: any): T {
    return new this(randomUUID()) as T;
  }

  get value(): string {
    return this._value;
  }

  equals(other: Identity): boolean {
    return this.value === other.value;
  }
}

