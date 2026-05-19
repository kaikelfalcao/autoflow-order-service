import {
  canTransitionStatus,
  assertValidTransition,
  OrderStatus,
} from "./order-status.vo";

describe("order-status.vo", () => {
  describe("canTransitionStatus", () => {
    it("deve permitir transicao valida RECEIVED -> DIAGNOSIS", () => {
      expect(canTransitionStatus("RECEIVED", "DIAGNOSIS")).toBe(true);
    });

    it("deve permitir transicao valida AWAITING_APPROVAL -> APPROVED", () => {
      expect(canTransitionStatus("AWAITING_APPROVAL", "APPROVED")).toBe(true);
    });

    it("deve permitir transicao valida AWAITING_APPROVAL -> REJECTED", () => {
      expect(canTransitionStatus("AWAITING_APPROVAL", "REJECTED")).toBe(true);
    });

    it("deve permitir retry de pagamento PAYMENT_FAILED -> AWAITING_PAYMENT", () => {
      expect(canTransitionStatus("PAYMENT_FAILED", "AWAITING_PAYMENT")).toBe(
        true,
      );
    });

    it("deve bloquear transicao invalida RECEIVED -> PAID", () => {
      expect(canTransitionStatus("RECEIVED", "PAID")).toBe(false);
    });

    it("deve bloquear transicao invalida DELIVERED -> DIAGNOSIS", () => {
      expect(canTransitionStatus("DELIVERED", "DIAGNOSIS")).toBe(false);
    });

    it("deve bloquear transicao invalida CANCELLED -> RECEIVED", () => {
      expect(canTransitionStatus("CANCELLED", "RECEIVED")).toBe(false);
    });
  });

  describe("assertValidTransition", () => {
    it("nao deve lancar erro em transicao valida", () => {
      expect(() =>
        assertValidTransition("IN_EXECUTION", "COMPLETED"),
      ).not.toThrow();
    });

    it("deve lancar erro em transicao invalida", () => {
      expect(() => assertValidTransition("RECEIVED", "DELIVERED")).toThrow(
        "Invalid status transition: RECEIVED -> DELIVERED",
      );
    });
  });

  describe("consistencia dos estados finais", () => {
    it("DELIVERED nao deve ter saidas validas", () => {
      const allStatuses: OrderStatus[] = [
        "RECEIVED",
        "DIAGNOSIS",
        "AWAITING_APPROVAL",
        "APPROVED",
        "IN_EXECUTION",
        "COMPLETED",
        "AWAITING_PAYMENT",
        "PAID",
        "DELIVERED",
        "REJECTED",
        "CANCELLED",
        "PAYMENT_FAILED",
      ];

      allStatuses.forEach((status) => {
        expect(canTransitionStatus("DELIVERED", status)).toBe(false);
      });
    });

    it("CANCELLED nao deve ter saidas validas", () => {
      const allStatuses: OrderStatus[] = [
        "RECEIVED",
        "DIAGNOSIS",
        "AWAITING_APPROVAL",
        "APPROVED",
        "IN_EXECUTION",
        "COMPLETED",
        "AWAITING_PAYMENT",
        "PAID",
        "DELIVERED",
        "REJECTED",
        "CANCELLED",
        "PAYMENT_FAILED",
      ];

      allStatuses.forEach((status) => {
        expect(canTransitionStatus("CANCELLED", status)).toBe(false);
      });
    });
  });
});
