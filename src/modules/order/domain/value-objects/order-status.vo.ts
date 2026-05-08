export type OrderStatus =
  | 'RECEIVED'
  | 'DIAGNOSIS'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'IN_EXECUTION'
  | 'COMPLETED'
  | 'AWAITING_PAYMENT'
  | 'PAID'
  | 'DELIVERED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'PAYMENT_FAILED';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  RECEIVED: 'Recebida',
  DIAGNOSIS: 'Em diagnostico',
  AWAITING_APPROVAL: 'Aguardando aprovacao',
  APPROVED: 'Aprovada',
  IN_EXECUTION: 'Em execucao',
  COMPLETED: 'Concluida',
  AWAITING_PAYMENT: 'Aguardando pagamento',
  PAID: 'Paga',
  DELIVERED: 'Entregue',
  REJECTED: 'Rejeitada',
  CANCELLED: 'Cancelada',
  PAYMENT_FAILED: 'Falha no pagamento',
};

export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  RECEIVED: ['DIAGNOSIS'],
  DIAGNOSIS: ['AWAITING_APPROVAL'],
  AWAITING_APPROVAL: ['APPROVED', 'REJECTED'],
  APPROVED: ['IN_EXECUTION'],
  IN_EXECUTION: ['COMPLETED'],
  COMPLETED: ['AWAITING_PAYMENT'],
  AWAITING_PAYMENT: ['PAID', 'PAYMENT_FAILED'],
  PAYMENT_FAILED: ['AWAITING_PAYMENT'],
  PAID: ['DELIVERED'],
  DELIVERED: [],
  REJECTED: ['CANCELLED'],
  CANCELLED: [],
};

export function canTransitionStatus(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return VALID_STATUS_TRANSITIONS[from].includes(to);
}

export function assertValidTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransitionStatus(from, to)) {
    throw new Error(`Invalid status transition: ${from} -> ${to}`);
  }
}
