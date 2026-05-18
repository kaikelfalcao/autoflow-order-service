import { Entity } from '../../../shared/domain/entity';
import { InvalidMileageError } from './errors/invalid-mileage.error';
import { randomUUID } from 'crypto';

export interface CreateVehicleProps {
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  mileageKm: number;
}

export interface RestoreVehicleProps {
  id: string;
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  mileageKm: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Vehicle extends Entity {
  private _id: string;
  private _customerId: string;
  private _plate: string;
  private _brand: string;
  private _model: string;
  private _year: number;
  private _color: string;
  private _mileageKm: number;
  private _active: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor() {
    super();
  }

  static create(props: CreateVehicleProps): Vehicle {
    const vehicle = new Vehicle();
    vehicle._id = randomUUID();
    vehicle._customerId = props.customerId;
    vehicle._plate = props.plate;
    vehicle._brand = props.brand;
    vehicle._model = props.model;
    vehicle._year = props.year;
    vehicle._color = props.color;
    vehicle._mileageKm = props.mileageKm;
    vehicle._active = true;
    vehicle._createdAt = new Date();
    vehicle._updatedAt = new Date();
    return vehicle;
  }

  static restore(props: RestoreVehicleProps): Vehicle {
    const vehicle = new Vehicle();
    vehicle._id = props.id;
    vehicle._customerId = props.customerId;
    vehicle._plate = props.plate;
    vehicle._brand = props.brand;
    vehicle._model = props.model;
    vehicle._year = props.year;
    vehicle._color = props.color;
    vehicle._mileageKm = props.mileageKm;
    vehicle._active = props.active;
    vehicle._createdAt = props.createdAt;
    vehicle._updatedAt = props.updatedAt;
    return vehicle;
  }

  deactivate(): void {
    this._active = false;
    this._updatedAt = new Date();
  }

  updateMileage(km: number): void {
    if (km < this._mileageKm) {
      throw new InvalidMileageError(`New mileage (${km}) cannot be less than current mileage (${this._mileageKm})`);
    }
    this._mileageKm = km;
    this._updatedAt = new Date();
  }

  updateAttributes(props: { color?: string; brand?: string; model?: string }): void {
    if (props.color !== undefined) this._color = props.color;
    if (props.brand !== undefined) this._brand = props.brand;
    if (props.model !== undefined) this._model = props.model;
    this._updatedAt = new Date();
  }

  isOwnedBy(customerId: string): boolean {
    return this._customerId === customerId;
  }

  get id(): string { return this._id; }
  get customerId(): string { return this._customerId; }
  get plate(): string { return this._plate; }
  get brand(): string { return this._brand; }
  get model(): string { return this._model; }
  get year(): number { return this._year; }
  get color(): string { return this._color; }
  get mileageKm(): number { return this._mileageKm; }
  get active(): boolean { return this._active; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
}
