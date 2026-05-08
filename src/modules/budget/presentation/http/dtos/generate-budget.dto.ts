import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class GenerateBudgetDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  validDays?: number;
}

