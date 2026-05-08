export interface OrderResponseDto {
  id: string;
  customerCpf: string;
  customerName: string;
  customerPhone: string;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  branchId: string | null;
  status: string;
  totalAmount: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: Array<{
    id: string;
    orderId: string;
    itemType: string;
    catalogItemId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    createdAt: Date;
  }>;
}

