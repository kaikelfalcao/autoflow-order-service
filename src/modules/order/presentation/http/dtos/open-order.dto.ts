import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class OpenOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(14)
  customerCpf: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  customerName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  customerPhone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  vehiclePlate: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  vehicleBrand: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  vehicleModel: string;

  @IsInt()
  @Min(1900)
  vehicleYear: number;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

