import { Entity } from '@/shared/domain/entity';
import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import { Identity } from '@/shared/domain/value-objects/identity.vo';
import type { Money } from '@/shared/domain/value-objects/money.vo';

export class PartCatalogId extends Identity {}

export interface PartsCatalogProps {
  id: PartCatalogId;
  name: string;
  description: string;
  unitPrice: Money;
  stockQuantity: number;
  minStock: number;
  supplier: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePartsCatalogProps {
  id: PartCatalogId;
  name: string;
  description: string;
  unitPrice: Money;
  stockQuantity?: number;
  minStock?: number;
  supplier?: string | null;
}

export interface ChangePartsCatalogProps {
  name?: string;
  description?: string;
  unitPrice?: Money;
  minStock?: number;
  supplier?: string | null;
}

export class PartsCatalog extends Entity {
  private readonly _id: PartCatalogId;
  private _name: string;
  private _description: string;
  private _unitPrice: Money;
  private _stockQuantity: number;
  private _minStock: number;
  private _supplier: string | null;
  private _active: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: PartsCatalogProps) {
    super();
    this._id = props.id;
    this._name = props.name;
    this._description = props.description;
    this._unitPrice = props.unitPrice;
    this._stockQuantity = props.stockQuantity;
    this._minStock = props.minStock;
    this._supplier = props.supplier;
    this._active = props.active;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreatePartsCatalogProps): PartsCatalog {
    const now = new Date();
    const stockQuantity = props.stockQuantity ?? 0;
    const minStock = props.minStock ?? 0;

    PartsCatalog.validateStockBounds(stockQuantity, minStock);

    return new PartsCatalog({
      ...props,
      name: PartsCatalog.normalizeName(props.name),
      description: PartsCatalog.normalizeDescription(props.description),
      supplier: PartsCatalog.normalizeSupplier(props.supplier ?? null),
      stockQuantity,
      minStock,
      active: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: PartsCatalogProps): PartsCatalog {
    return new PartsCatalog(props);
  }

  changeAttributes(props: ChangePartsCatalogProps): void {
    if (props.name !== undefined) {
      this._name = PartsCatalog.normalizeName(props.name);
    }
    if (props.description !== undefined) {
      this._description = PartsCatalog.normalizeDescription(props.description);
    }
    if (props.unitPrice !== undefined) {
      this._unitPrice = props.unitPrice;
    }
    if (props.minStock !== undefined) {
      if (!Number.isInteger(props.minStock) || props.minStock < 0) {
        throw new BusinessRuleException('minStock must be a non-negative integer');
      }
      this._minStock = props.minStock;
    }
    if (props.supplier !== undefined) {
      this._supplier = PartsCatalog.normalizeSupplier(props.supplier);
    }

    this._updatedAt = new Date();
  }

  adjustStock(delta: number): void {
    if (!Number.isInteger(delta) || delta === 0) {
      throw new BusinessRuleException('Stock delta must be a non-zero integer');
    }

    const nextStock = this._stockQuantity + delta;
    if (nextStock < 0) {
      throw new BusinessRuleException(
        `Insufficient stock. Current=${this._stockQuantity}, delta=${delta}`,
      );
    }

    this._stockQuantity = nextStock;
    this._updatedAt = new Date();
  }

  reserve(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BusinessRuleException('Reserve quantity must be a positive integer');
    }
    this.adjustStock(-quantity);
  }

  replenish(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BusinessRuleException('Replenish quantity must be a positive integer');
    }
    this.adjustStock(quantity);
  }

  canFulfill(quantity: number): boolean {
    if (!Number.isInteger(quantity) || quantity <= 0) return false;
    return this._stockQuantity >= quantity;
  }

  activate(): void {
    if (this._active) return;
    this._active = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    if (!this._active) return;
    this._active = false;
    this._updatedAt = new Date();
  }

  ensureCanBeDeleted(): void {
    if (this._active) {
      throw new BusinessRuleException(
        'Cannot delete an active catalog part. Deactivate it first.',
      );
    }
  }

  id(): Identity {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get unitPrice(): Money {
    return this._unitPrice;
  }

  get stockQuantity(): number {
    return this._stockQuantity;
  }

  get minStock(): number {
    return this._minStock;
  }

  get supplier(): string | null {
    return this._supplier;
  }

  get active(): boolean {
    return this._active;
  }

  get isLowStock(): boolean {
    return this._stockQuantity <= this._minStock;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  private static validateStockBounds(stockQuantity: number, minStock: number): void {
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      throw new BusinessRuleException(
        'stockQuantity must be a non-negative integer',
      );
    }
    if (!Number.isInteger(minStock) || minStock < 0) {
      throw new BusinessRuleException('minStock must be a non-negative integer');
    }
  }

  private static normalizeName(name: string): string {
    const clean = name?.trim();
    if (!clean) {
      throw new BusinessRuleException('Part name is required');
    }
    if (clean.length > 255) {
      throw new BusinessRuleException('Part name must be at most 255 chars');
    }
    return clean;
  }

  private static normalizeDescription(description: string): string {
    const clean = description?.trim();
    if (!clean) {
      throw new BusinessRuleException('Part description is required');
    }
    return clean;
  }

  private static normalizeSupplier(supplier: string | null): string | null {
    if (supplier === null) return null;
    const clean = supplier.trim();
    return clean.length > 0 ? clean : null;
  }
}
