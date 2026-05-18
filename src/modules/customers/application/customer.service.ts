import { Inject, Injectable } from '@nestjs/common';
import { CustomerRepository, CustomerFilters, CUSTOMER_REPOSITORY } from '../domain/ports/customer.repository';
import { CustomerNotFoundError } from '../domain/errors/customer-not-found.error';
import { CustomerAlreadyExistsError } from '../domain/errors/customer-already-exists.error';
import { CustomerHasActiveVehiclesError } from '../domain/errors/customer-has-active-vehicles.error';
import { Customer } from '../domain/customer.entity';
import { Document } from '../domain/value-objects/document.vo';
import { DocumentType } from '../domain/enums/document-type.enum';
import { AppLogger } from '../../../infrastructure/observability/logger';

export interface CreateCustomerDto {
  documentType: DocumentType;
  documentNumber: string;
  name: string;
  email: string;
  phone: string;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ListCustomersDto {
  name?: string;
  active?: boolean;
  page: number;
  limit: number;
}

@Injectable()
export class CustomerService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
    private readonly logger: AppLogger,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const doc = new Document(dto.documentType, dto.documentNumber);

    const exists = await this.customerRepository.exists(doc.value);
    if (exists) throw new CustomerAlreadyExistsError(doc.value);

    const customer = Customer.create({
      documentType: dto.documentType,
      documentNumber: doc.value,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
    });

    await this.customerRepository.save(customer);
    this.logger.log(`Customer created: ${customer.id}`, CustomerService.name);
    return customer;
  }

  async findById(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) throw new CustomerNotFoundError(id);
    return customer;
  }

  async findByDocument(documentNumber: string): Promise<Customer> {
    const clean = documentNumber.replace(/\D/g, '');
    const customer = await this.customerRepository.findByDocument(clean);
    if (!customer) throw new CustomerNotFoundError(documentNumber);
    return customer;
  }

  async findAll(dto: ListCustomersDto): Promise<{ data: Customer[]; total: number; page: number; limit: number }> {
    const limit = Math.min(dto.limit, 100);
    const filters: CustomerFilters = { name: dto.name, active: dto.active, page: dto.page, limit };
    const { data, total } = await this.customerRepository.findAll(filters);
    return { data, total, page: dto.page, limit };
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) throw new CustomerNotFoundError(id);

    if (dto.name) customer.updateName(dto.name);
    if (dto.email !== undefined || dto.phone !== undefined) {
      customer.updateContact(dto.email ?? customer.email, dto.phone ?? customer.phone);
    }

    await this.customerRepository.save(customer);
    this.logger.log(`Customer updated: ${id}`, CustomerService.name);
    return customer;
  }

  async deactivate(id: string): Promise<void> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) throw new CustomerNotFoundError(id);

    const hasVehicles = await this.customerRepository.hasActiveVehicles(id);
    if (hasVehicles) {
      this.logger.warn(`Customer ${id} has active vehicles, cannot deactivate`, CustomerService.name);
      throw new CustomerHasActiveVehiclesError(id);
    }

    customer.deactivate();
    await this.customerRepository.save(customer);
    this.logger.log(`Customer deactivated: ${id}`, CustomerService.name);
  }
}
