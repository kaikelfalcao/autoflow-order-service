import { VehicleTypeormEntity } from "./vehicle.orm-entity";
import { Vehicle } from "../../domain/vehicle.entity";

export class VehicleMapper {
  static toDomain(entity: VehicleTypeormEntity): Vehicle {
    return Vehicle.restore({
      id: entity.id,
      customerId: entity.customerId,
      plate: entity.plate,
      brand: entity.brand,
      model: entity.model,
      year: entity.year,
      color: entity.color,
      mileageKm: entity.mileageKm,
      active: entity.active,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toOrm(vehicle: Vehicle): VehicleTypeormEntity {
    const entity = new VehicleTypeormEntity();
    entity.id = vehicle.id;
    entity.customerId = vehicle.customerId;
    entity.plate = vehicle.plate;
    entity.brand = vehicle.brand;
    entity.model = vehicle.model;
    entity.year = vehicle.year;
    entity.color = vehicle.color;
    entity.mileageKm = vehicle.mileageKm;
    entity.active = vehicle.active;
    entity.createdAt = vehicle.createdAt;
    entity.updatedAt = vehicle.updatedAt;
    return entity;
  }
}
