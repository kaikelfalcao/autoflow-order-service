export interface BudgetResponseDto {
  id: string;
  orderId: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  sentAt: Date;
  respondedAt: Date | null;
  validUntil: Date;
}

