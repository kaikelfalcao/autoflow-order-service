import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import {
  CustomerRepository,
  CustomerFilters,
} from "../../domain/ports/customer.repository";
import { Customer } from "../../domain/customer.entity";
import { CustomerTypeormEntity } from "./customer.orm-entity";
import { CustomerMapper } from "./customer.mapper";
import { VehicleTypeormEntity } from "../../../vehicles/infrastructure/persistence/vehicle.orm-entity";

@Injectable()
export class CustomerRepositoryImpl implements CustomerRepository {
  constructor(
    @InjectRepository(CustomerTypeormEntity)
    private readonly repo: Repository<CustomerTypeormEntity>,
    @InjectRepository(VehicleTypeormEntity)
    private readonly vehicleRepo: Repository<VehicleTypeormEntity>,
  ) {}

  async findById(id: string): Promise<Customer | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? CustomerMapper.toDomain(entity) : null;
  }

  async findByDocument(documentNumber: string): Promise<Customer | null> {
    const clean = documentNumber.replace(/\D/g, "");
    const entity = await this.repo.findOne({
      where: { documentNumber: clean },
    });
    return entity ? CustomerMapper.toDomain(entity) : null;
  }

  async findAll(
    filters: CustomerFilters,
  ): Promise<{ data: Customer[]; total: number }> {
    const limit = Math.min(filters.limit, 100);
    const skip = (filters.page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (filters.active !== undefined) where.active = filters.active;
    if (filters.name) where.name = ILike(`%${filters.name}%`);

    const [entities, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: "DESC" },
      take: limit,
      skip,
    });

    return { data: entities.map(CustomerMapper.toDomain), total };
  }

  async save(customer: Customer): Promise<void> {
    const entity = CustomerMapper.toOrm(customer);
    await this.repo.save(entity);
  }

  async exists(documentNumber: string): Promise<boolean> {
    const clean = documentNumber.replace(/\D/g, "");
    const count = await this.repo.count({ where: { documentNumber: clean } });
    return count > 0;
  }

  async hasActiveVehicles(customerId: string): Promise<boolean> {
    const count = await this.vehicleRepo.count({
      where: { customerId, active: true },
    });
    return count > 0;
  }
}
