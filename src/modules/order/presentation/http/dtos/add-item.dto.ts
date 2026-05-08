import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export enum OrderItemTypeDtoEnum {
  SERVICE = 'SERVICE',
  PART = 'PART',
}

export class AddItemDto {
  @IsEnum(OrderItemTypeDtoEnum)
  itemType: OrderItemTypeDtoEnum;

  @IsUUID()
  catalogItemId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsInt()
  @Min(0)
  unitPrice: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}

