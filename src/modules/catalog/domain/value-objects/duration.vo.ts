export class Duration {
  private constructor(private readonly _minutes: number) {
    if (!Number.isInteger(_minutes) || _minutes <= 0) {
      throw new Error('Duration minutes must be a positive integer');
    }
  }

  static create(minutes: number): Duration {
    return new Duration(minutes);
  }

  static restore(minutes: number): Duration {
    return new Duration(minutes);
  }

  get minutes(): number {
    return this._minutes;
  }
}

