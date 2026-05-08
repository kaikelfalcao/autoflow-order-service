import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum OrderStatusDtoEnum {
  RECEIVED = 'RECEIVED',
  DIAGNOSIS = 'DIAGNOSIS',
  AWAITING_APPROVAL = 'AWAITING_APPROVAL',
  APPROVED = 'APPROVED',
  IN_EXECUTION = 'IN_EXECUTION',
  COMPLETED = 'COMPLETED',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  PAID = 'PAID',
  DELIVERED = 'DELIVERED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatusDtoEnum)
  status: OrderStatusDtoEnum;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  changedBy?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

