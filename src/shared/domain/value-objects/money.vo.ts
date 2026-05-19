export class Money {
  private constructor(private readonly _cents: number) {
    if (!Number.isInteger(_cents) || _cents < 0) {
      throw new Error("Money cents must be a non-negative integer");
    }
  }

  static fromCents(cents: number): Money {
    return new Money(cents);
  }

  static fromDecimal(amount: number): Money {
    return new Money(Math.round(amount * 100));
  }

  get cents(): number {
    return this._cents;
  }

  get decimal(): number {
    return this._cents / 100;
  }
}
