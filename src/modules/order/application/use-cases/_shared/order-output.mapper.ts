import { OrderItemOrmEntity } from "../../../infrastructure/persistence/order-item.orm-entity";
import { OrderOrmEntity } from "../../../infrastructure/persistence/order.orm-entity";

export function toOrderOutput(order: OrderOrmEntity) {
  return {
    id: order.id,
    customerCpf: order.customerCpf,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    vehiclePlate: order.vehiclePlate,
    vehicleBrand: order.vehicleBrand,
    vehicleModel: order.vehicleModel,
    vehicleYear: order.vehicleYear,
    branchId: order.branchId,
    status: order.status,
    totalAmount: Number(order.totalAmount),
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export function toOrderItemOutput(item: OrderItemOrmEntity) {
  return {
    id: item.id,
    orderId: item.orderId,
    itemType: item.itemType,
    catalogItemId: item.catalogItemId,
    name: item.name,
    unitPrice: Number(item.unitPrice),
    quantity: item.quantity,
    subtotal: Number(item.subtotal),
    createdAt: item.createdAt,
  };
}
