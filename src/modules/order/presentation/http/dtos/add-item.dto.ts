import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export enum OrderItemTypeDtoEnum {
  SERVICE = 'SERVICE',
  PART = 'PART',
}

export class AddItemDto {
  @IsEnum(OrderItemTypeDtoEnum)
  itemType: OrderItemTypeDtoEnum;

  @IsString()
  @IsNotEmpty()
  catalogItemId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
