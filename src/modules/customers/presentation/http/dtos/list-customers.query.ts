import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString, Min } from "class-validator";

export class ListCustomersQuery {
  @ApiPropertyOptional({ example: "João" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  active?: boolean;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value as string, 10))
  page: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value as string, 10))
  limit: number = 20;
}
