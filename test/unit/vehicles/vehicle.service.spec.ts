import { VehicleService } from "../../../src/modules/vehicles/application/vehicle.service";
import { Vehicle } from "../../../src/modules/vehicles/domain/vehicle.entity";
import { VehicleNotFoundError } from "../../../src/modules/vehicles/domain/errors/vehicle-not-found.error";
import { VehicleAlreadyExistsError } from "../../../src/modules/vehicles/domain/errors/vehicle-already-exists.error";
import { VehicleHasActiveOrdersError } from "../../../src/modules/vehicles/domain/errors/vehicle-has-active-orders.error";
import { CustomerNotFoundError } from "../../../src/modules/customers/domain/errors/customer-not-found.error";
import { InvalidMileageError } from "../../../src/modules/vehicles/domain/errors/invalid-mileage.error";
import { Customer } from "../../../src/modules/customers/domain/customer.entity";
import { DocumentType } from "../../../src/modules/customers/domain/enums/document-type.enum";

const makeVehicle = (mileageKm = 0) =>
  Vehicle.restore({
    id: "vehicle-1",
    customerId: "customer-1",
    plate: "ABC1234",
    brand: "Toyota",
    model: "Corolla",
    year: 2022,
    color: "White",
    mileageKm,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const makeCustomer = () =>
  Customer.restore({
    id: "customer-1",
    documentType: DocumentType.CPF,
    documentNumber: "11144477735",
    name: "João",
    email: "j@e.com",
    phone: "11999999999",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe("VehicleService", () => {
  let service: VehicleService;
  let vehicleRepo: {
    findById: jest.Mock;
    findByPlate: jest.Mock;
    findByCustomerId: jest.Mock;
    findAll: jest.Mock;
    save: jest.Mock;
    existsByPlate: jest.Mock;
    hasActiveOrders: jest.Mock;
  };
  let customerRepo: { findById: jest.Mock };
  let logger: { log: jest.Mock; warn: jest.Mock; error: jest.Mock };

  beforeEach(() => {
    vehicleRepo = {
      findById: jest.fn(),
      findByPlate: jest.fn(),
      findByCustomerId: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      existsByPlate: jest.fn(),
      hasActiveOrders: jest.fn(),
    };
    customerRepo = { findById: jest.fn() };
    logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
    service = new VehicleService(
      vehicleRepo,
      customerRepo as any,
      logger as any,
    );
  });

  describe("create", () => {
    it("creates vehicle when customer exists and plate is new", async () => {
      customerRepo.findById.mockResolvedValue(makeCustomer());
      vehicleRepo.existsByPlate.mockResolvedValue(false);
      const result = await service.create({
        customerId: "customer-1",
        plate: "ABC-1234",
        brand: "Toyota",
        model: "Corolla",
        year: 2022,
        color: "White",
      });
      expect(vehicleRepo.save).toHaveBeenCalled();
      expect(result.plate).toBe("ABC1234");
    });

    it("throws CustomerNotFoundError when customer does not exist", async () => {
      customerRepo.findById.mockResolvedValue(null);
      await expect(
        service.create({
          customerId: "missing",
          plate: "ABC-1234",
          brand: "Toyota",
          model: "Corolla",
          year: 2022,
          color: "White",
        }),
      ).rejects.toThrow(CustomerNotFoundError);
    });

    it("throws VehicleAlreadyExistsError when plate exists", async () => {
      customerRepo.findById.mockResolvedValue(makeCustomer());
      vehicleRepo.existsByPlate.mockResolvedValue(true);
      await expect(
        service.create({
          customerId: "customer-1",
          plate: "ABC-1234",
          brand: "Toyota",
          model: "Corolla",
          year: 2022,
          color: "White",
        }),
      ).rejects.toThrow(VehicleAlreadyExistsError);
    });
  });

  describe("update", () => {
    it("updates mileage when new value is greater", async () => {
      vehicleRepo.findById.mockResolvedValue(makeVehicle(1000));
      const result = await service.update("vehicle-1", { mileageKm: 2000 });
      expect(result.mileageKm).toBe(2000);
    });

    it("throws InvalidMileageError when new mileage is less than current", async () => {
      vehicleRepo.findById.mockResolvedValue(makeVehicle(5000));
      await expect(
        service.update("vehicle-1", { mileageKm: 3000 }),
      ).rejects.toThrow(InvalidMileageError);
    });
  });

  describe("deactivate", () => {
    it("deactivates vehicle when no active orders", async () => {
      const vehicle = makeVehicle();
      vehicleRepo.findById.mockResolvedValue(vehicle);
      vehicleRepo.hasActiveOrders.mockResolvedValue(false);
      await service.deactivate("vehicle-1");
      expect(vehicle.active).toBe(false);
    });

    it("throws VehicleHasActiveOrdersError when active orders exist", async () => {
      vehicleRepo.findById.mockResolvedValue(makeVehicle());
      vehicleRepo.hasActiveOrders.mockResolvedValue(true);
      await expect(service.deactivate("vehicle-1")).rejects.toThrow(
        VehicleHasActiveOrdersError,
      );
    });

    it("throws VehicleNotFoundError when not found", async () => {
      vehicleRepo.findById.mockResolvedValue(null);
      await expect(service.deactivate("missing")).rejects.toThrow(
        VehicleNotFoundError,
      );
    });
  });
});
