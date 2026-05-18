import { Vehicle } from '../vehicle.entity';

export interface VehicleFilters {
  customerId?: string;
  active?: boolean;
  page: number;
  limit: number;
}

export interface VehicleRepository {
  findById(id: string): Promise<Vehicle | null>;
  findByPlate(plate: string): Promise<Vehicle | null>;
  findByCustomerId(customerId: string, filters: VehicleFilters): Promise<{ data: Vehicle[]; total: number }>;
  findAll(filters: VehicleFilters): Promise<{ data: Vehicle[]; total: number }>;
  save(vehicle: Vehicle): Promise<void>;
  existsByPlate(plate: string): Promise<boolean>;
  hasActiveOrders(vehicleId: string): Promise<boolean>;
}

export const VEHICLE_REPOSITORY = 'VEHICLE_REPOSITORY';
