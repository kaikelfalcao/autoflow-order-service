export class CustomerHasActiveVehiclesError extends Error {
  constructor(customerId: string) {
    super(
      `Customer ${customerId} has active vehicles and cannot be deactivated`,
    );
    this.name = "CustomerHasActiveVehiclesError";
  }
}
