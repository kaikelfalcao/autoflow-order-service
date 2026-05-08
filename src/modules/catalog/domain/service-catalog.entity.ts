import type { Duration } from './value-objects/duration.vo';
import type { ServiceId } from './value-objects/service-id.vo';

import { Entity } from '@/shared/domain/entity';
import { BusinessRuleException } from '@/shared/domain/exceptions/business-rule.exception';
import type { Identity } from '@/shared/domain/value-objects/identity.vo';
import type { Money } from '@/shared/domain/value-objects/money.vo';

export interface ServiceCatalogProps {
  id: ServiceId;
  name: string;
  description: string;
  basePrice: Money;
  estimatedDuration: Duration;
  category: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceCatalogProps {
  id: ServiceId;
  name: string;
  description: string;
  basePrice: Money;
  estimatedDuration: Duration;
  category: string;
}

export interface ChangeServiceCatalogProps {
  name?: string;
  description?: string;
  basePrice?: Money;
  estimatedDuration?: Duration;
  category?: string;
}

export class ServiceCatalog extends Entity {
  private readonly _id: ServiceId;
  private _name: string;
  private _description: string;
  private _basePrice: Money;
  private _estimatedDuration: Duration;
  private _category: string;
  private _active: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ServiceCatalogProps) {
    super();
    this._id = props.id;
    this._name = props.name;
    this._description = props.description;
    this._basePrice = props.basePrice;
    this._estimatedDuration = props.estimatedDuration;
    this._category = props.category;
    this._active = props.active;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreateServiceCatalogProps): ServiceCatalog {
    const now = new Date();

    return new ServiceCatalog({
      ...props,
      name: ServiceCatalog.normalizeName(props.name),
      description: ServiceCatalog.normalizeDescription(props.description),
      category: ServiceCatalog.normalizeCategory(props.category),
      active: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: ServiceCatalogProps): ServiceCatalog {
    return new ServiceCatalog(props);
  }

  changeAttributes(props: ChangeServiceCatalogProps): void {
    if (props.name !== undefined) {
      this._name = ServiceCatalog.normalizeName(props.name);
    }
    if (props.description !== undefined) {
      this._description = ServiceCatalog.normalizeDescription(props.description);
    }
    if (props.basePrice !== undefined) {
      this._basePrice = props.basePrice;
    }
    if (props.estimatedDuration !== undefined) {
      this._estimatedDuration = props.estimatedDuration;
    }
    if (props.category !== undefined) {
      this._category = ServiceCatalog.normalizeCategory(props.category);
    }

    this._updatedAt = new Date();
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
        'Cannot delete an active catalog service. Deactivate it first.',
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

  get basePrice(): Money {
    return this._basePrice;
  }

  get estimatedDuration(): Duration {
    return this._estimatedDuration;
  }

  get category(): string {
    return this._category;
  }

  get active(): boolean {
    return this._active;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  private static normalizeName(name: string): string {
    const clean = name?.trim();
    if (!clean) {
      throw new BusinessRuleException('Service name is required');
    }
    if (clean.length > 255) {
      throw new BusinessRuleException('Service name must be at most 255 chars');
    }
    return clean;
  }

  private static normalizeDescription(description: string): string {
    const clean = description?.trim();
    if (!clean) {
      throw new BusinessRuleException('Service description is required');
    }
    return clean;
  }

  private static normalizeCategory(category: string): string {
    const clean = category?.trim();
    if (!clean) {
      throw new BusinessRuleException('Service category is required');
    }
    if (clean.length > 100) {
      throw new BusinessRuleException(
        'Service category must be at most 100 chars',
      );
    }
    return clean.toUpperCase();
  }
}
