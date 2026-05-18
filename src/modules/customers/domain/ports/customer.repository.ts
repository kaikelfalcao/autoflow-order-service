import { Customer } from '../customer.entity';

export interface CustomerFilters {
  name?: string;
  active?: boolean;
  page: number;
  limit: number;
}

export interface CustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByDocument(documentNumber: string): Promise<Customer | null>;
  findAll(filters: CustomerFilters): Promise<{ data: Customer[]; total: number }>;
  save(customer: Customer): Promise<void>;
  exists(documentNumber: string): Promise<boolean>;
  hasActiveVehicles(customerId: string): Promise<boolean>;
}

export const CUSTOMER_REPOSITORY = 'CUSTOMER_REPOSITORY';
