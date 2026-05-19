export class VehicleHasActiveOrdersError extends Error {
  constructor(vehicleId: string) {
    super(`Vehicle ${vehicleId} has active orders and cannot be deactivated`);
    this.name = "VehicleHasActiveOrdersError";
  }
}
