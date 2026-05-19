import { CustomerTypeormEntity } from "./customer.orm-entity";
import { Customer } from "../../domain/customer.entity";

export class CustomerMapper {
  static toDomain(entity: CustomerTypeormEntity): Customer {
    return Customer.restore({
      id: entity.id,
      documentType: entity.documentType,
      documentNumber: entity.documentNumber,
      name: entity.name,
      email: entity.email,
      phone: entity.phone,
      active: entity.active,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toOrm(customer: Customer): CustomerTypeormEntity {
    const entity = new CustomerTypeormEntity();
    entity.id = customer.id;
    entity.documentType = customer.documentType;
    entity.documentNumber = customer.documentNumber;
    entity.name = customer.name;
    entity.email = customer.email;
    entity.phone = customer.phone;
    entity.active = customer.active;
    entity.createdAt = customer.createdAt;
    entity.updatedAt = customer.updatedAt;
    return entity;
  }
}
