import { OrderOrmEntity } from "./order.orm-entity";
// Ajuste estes imports para seus nomes reais de domínio:
import { Order } from "../../domain/order.entity";
import { OrderId } from "../../domain/value-objects/order-id.vo";

export class OrderMapper {
  static toDomain(orm: OrderOrmEntity): Order {
    return Order.restore({
      id: orm.id,
      customerCpf: orm.customerCpf,
      customerName: orm.customerName,
      customerPhone: orm.customerPhone,
      vehiclePlate: orm.vehiclePlate,
      vehicleBrand: orm.vehicleBrand,
      vehicleModel: orm.vehicleModel,
      vehicleYear: orm.vehicleYear,
      branchId: orm.branchId ?? "",
      status: orm.status as any,
      items: (orm.items ?? []).map((item) => ({
        itemId: item.catalogItemId,
        type: item.itemType,
        name: item.name,
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
      })),
      notes: orm.notes,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(order: Order): OrderOrmEntity {
    const snapshot = order.toPrimitives();
    const orm = new OrderOrmEntity();

    orm.id = snapshot.id;
    orm.customerCpf = snapshot.customerCpf;
    orm.customerName = snapshot.customerName;
    orm.customerPhone = snapshot.customerPhone;
    orm.vehiclePlate = snapshot.vehiclePlate;
    orm.vehicleBrand = snapshot.vehicleBrand;
    orm.vehicleModel = snapshot.vehicleModel;
    orm.vehicleYear = snapshot.vehicleYear;
    orm.branchId = snapshot.branchId || null;
    orm.status = snapshot.status;
    orm.totalAmount = snapshot.totalAmount.toFixed(2);
    orm.notes = snapshot.notes ?? null;
    orm.createdAt = snapshot.createdAt;
    orm.updatedAt = snapshot.updatedAt;

    return orm;
  }

  static toOrderId(id: string): OrderId {
    return OrderId.fromString(id);
  }
}
