import { IsEnum, IsOptional, IsString } from "class-validator";

export enum ExecutionStageDtoEnum {
  IN_EXECUTION = "IN_EXECUTION",
  COMPLETED = "COMPLETED",
}

export class UpdateExecutionStageDto {
  @IsEnum(ExecutionStageDtoEnum)
  stage: ExecutionStageDtoEnum;

  @IsOptional()
  @IsString()
  notes?: string;
}
