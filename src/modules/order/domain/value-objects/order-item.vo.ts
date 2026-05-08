export type OrderItemType = 'SERVICE' | 'PART';

export interface OrderItemProps {
  itemId: string;
  type: OrderItemType;
  name: string;
  unitPrice: number;
  quantity: number;
}

export class OrderItem {
  private constructor(private readonly props: OrderItemProps) {}

  static create(props: OrderItemProps): OrderItem {
    if (!props.itemId?.trim()) {
      throw new Error('Order itemId is required');
    }
    if (!props.name?.trim()) {
      throw new Error('Order item name is required');
    }
    if (props.quantity <= 0) {
      throw new Error('Order item quantity must be positive');
    }
    if (props.unitPrice < 0) {
      throw new Error('Order item unitPrice must be non-negative');
    }

    return new OrderItem({ ...props });
  }

  static restore(props: OrderItemProps): OrderItem {
    return new OrderItem({ ...props });
  }

  get itemId(): string {
    return this.props.itemId;
  }

  get type(): OrderItemType {
    return this.props.type;
  }

  get name(): string {
    return this.props.name;
  }

  get unitPrice(): number {
    return this.props.unitPrice;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get subtotal(): number {
    return this.props.unitPrice * this.props.quantity;
  }

  toJSON() {
    return {
      itemId: this.itemId,
      type: this.type,
      name: this.name,
      unitPrice: this.unitPrice,
      quantity: this.quantity,
      subtotal: this.subtotal,
    };
  }
}
