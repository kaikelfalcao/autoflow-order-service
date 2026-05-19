export interface BudgetProps {
  id: string;
  orderId: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  sentAt: Date;
  respondedAt: Date | null;
  validUntil: Date;
}

export class Budget {
  private constructor(private readonly props: BudgetProps) {}

  static restore(props: BudgetProps): Budget {
    return new Budget(props);
  }

  toPrimitives(): BudgetProps {
    return { ...this.props };
  }
}
