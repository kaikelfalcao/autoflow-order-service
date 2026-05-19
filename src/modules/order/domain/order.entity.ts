import { OrderId } from "./value-objects/order-id.vo";
import { OrderItem } from "./value-objects/order-item.vo";
import {
  OrderStatus,
  assertValidTransition,
} from "./value-objects/order-status.vo";

export interface CreateOrderProps {
  id?: string;
  customerCpf: string;
  customerName: string;
  customerPhone: string;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  branchId: string;
  notes?: string | null;
}

export interface RestoreOrderProps {
  id: string;
  customerCpf: string;
  customerName: string;
  customerPhone: string;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  branchId: string;
  status: OrderStatus;
  items: Array<{
    itemId: string;
    type: "SERVICE" | "PART";
    name: string;
    unitPrice: number;
    quantity: number;
  }>;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Order {
  private constructor(
    private readonly _id: OrderId,
    private readonly _customerCpf: string,
    private readonly _customerName: string,
    private readonly _customerPhone: string,
    private readonly _vehiclePlate: string,
    private readonly _vehicleBrand: string,
    private readonly _vehicleModel: string,
    private readonly _vehicleYear: number,
    private readonly _branchId: string,
    private _status: OrderStatus,
    private _items: OrderItem[],
    private _notes: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: CreateOrderProps): Order {
    const now = new Date();
    return new Order(
      props.id ? OrderId.fromString(props.id) : OrderId.generate(),
      props.customerCpf,
      props.customerName,
      props.customerPhone,
      props.vehiclePlate,
      props.vehicleBrand,
      props.vehicleModel,
      props.vehicleYear,
      props.branchId,
      "RECEIVED",
      [],
      props.notes ?? null,
      now,
      now,
    );
  }

  static restore(props: RestoreOrderProps): Order {
    return new Order(
      OrderId.fromString(props.id),
      props.customerCpf,
      props.customerName,
      props.customerPhone,
      props.vehiclePlate,
      props.vehicleBrand,
      props.vehicleModel,
      props.vehicleYear,
      props.branchId,
      props.status,
      props.items.map((item) => OrderItem.restore(item)),
      props.notes,
      props.createdAt,
      props.updatedAt,
    );
  }

  transitionTo(newStatus: OrderStatus): void {
    assertValidTransition(this._status, newStatus);
    this._status = newStatus;
    this.touch();
  }

  addItem(item: OrderItem): void {
    this._items.push(item);
    this.touch();
  }

  removeItem(itemId: string): void {
    this._items = this._items.filter((item) => item.itemId !== itemId);
    this.touch();
  }

  setNotes(notes: string | null): void {
    this._notes = notes;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  get id(): string {
    return this._id.value;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get items(): ReadonlyArray<OrderItem> {
    return this._items;
  }

  get totalAmount(): number {
    return this._items.reduce((acc, item) => acc + item.subtotal, 0);
  }

  toPrimitives() {
    return {
      id: this.id,
      customerCpf: this._customerCpf,
      customerName: this._customerName,
      customerPhone: this._customerPhone,
      vehiclePlate: this._vehiclePlate,
      vehicleBrand: this._vehicleBrand,
      vehicleModel: this._vehicleModel,
      vehicleYear: this._vehicleYear,
      branchId: this._branchId,
      status: this._status,
      items: this._items.map((item) => item.toJSON()),
      totalAmount: this.totalAmount,
      notes: this._notes,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
