import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { CompleteExecutionUseCase } from "../../application/use-cases/complete-execution/complete-execution.use-case";
import { GetExecutionQueueUseCase } from "../../application/use-cases/get-execution-queue/get-execution-queue.use-case";
import { UpdateExecutionStageUseCase } from "../../application/use-cases/update-execution-stage/update-execution-stage.use-case";
import { UpdateExecutionStageDto } from "./dtos/update-execution-stage.dto";

@Controller("orders")
@ApiTags("execution")
export class ExecutionController {
  constructor(
    private readonly getExecutionQueueUseCase: GetExecutionQueueUseCase,
    private readonly updateExecutionStageUseCase: UpdateExecutionStageUseCase,
    private readonly completeExecutionUseCase: CompleteExecutionUseCase,
  ) {}

  @Get("queue")
  @ApiOperation({ summary: "Lista fila de execucao das ordens" })
  getQueue() {
    return this.getExecutionQueueUseCase.execute();
  }

  @Patch(":id/execution")
  @ApiOperation({ summary: "Atualiza etapa de execucao da ordem" })
  updateStage(@Param("id") id: string, @Body() body: UpdateExecutionStageDto) {
    return this.updateExecutionStageUseCase.execute({
      orderId: id,
      stage: body.stage,
      notes: body.notes,
    });
  }

  @Post(":id/execution/complete")
  @ApiOperation({ summary: "Conclui execucao da ordem e move para pagamento" })
  complete(@Param("id") id: string) {
    return this.completeExecutionUseCase.execute(id);
  }
}
