import { Plate } from "../../../src/modules/vehicles/domain/value-objects/plate.vo";
import { InvalidPlateError } from "../../../src/modules/vehicles/domain/errors/invalid-plate.error";

describe("Plate VO", () => {
  it("accepts old format plate (ABC-1234)", () => {
    const plate = new Plate("ABC-1234");
    expect(plate.value).toBe("ABC1234");
  });

  it("accepts Mercosul format plate (ABC-1D23)", () => {
    const plate = new Plate("ABC-1D23");
    expect(plate.value).toBe("ABC1D23");
  });

  it("normalizes lowercase input", () => {
    const plate = new Plate("abc1234");
    expect(plate.value).toBe("ABC1234");
  });

  it("rejects invalid plate", () => {
    expect(() => new Plate("INVALID")).toThrow(InvalidPlateError);
    expect(() => new Plate("AB-1234")).toThrow(InvalidPlateError);
    expect(() => new Plate("1234ABC")).toThrow(InvalidPlateError);
  });

  it("formatted returns plate with hyphen", () => {
    const plate = new Plate("ABC1234");
    expect(plate.formatted()).toBe("ABC-1234");
  });
});
