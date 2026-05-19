import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class UpdateVehicleDto {
  @ApiPropertyOptional({ example: "Black" })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: 20000 })
  @IsInt()
  @Min(0)
  @IsOptional()
  mileageKm?: number;

  @ApiPropertyOptional({ example: "Toyota" })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ example: "Corolla Cross" })
  @IsString()
  @IsOptional()
  model?: string;
}
