import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApproveBudgetUseCase } from '../../application/use-cases/approve-budget/approve-budget.use-case';
import { GenerateBudgetUseCase } from '../../application/use-cases/generate-budget/generate-budget.use-case';
import { GetBudgetUseCase } from '../../application/use-cases/get-budget/get-budget.use-case';
import { RejectBudgetUseCase } from '../../application/use-cases/reject-budget/reject-budget.use-case';
import { GenerateBudgetDto } from './dtos/generate-budget.dto';
import { RejectBudgetDto } from './dtos/reject-budget.dto';

@Controller('orders/:id/budget')
@ApiTags('budget')
export class BudgetController {
  constructor(
    private readonly generateBudgetUseCase: GenerateBudgetUseCase,
    private readonly getBudgetUseCase: GetBudgetUseCase,
    private readonly approveBudgetUseCase: ApproveBudgetUseCase,
    private readonly rejectBudgetUseCase: RejectBudgetUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Gera ou atualiza budget da ordem' })
  @ApiResponse({ status: 201, description: 'Budget gerado com sucesso' })
  generate(@Param('id') orderId: string, @Body() body: GenerateBudgetDto) {
    return this.generateBudgetUseCase.execute({
      orderId,
      discount: body.discount,
      validDays: body.validDays,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Consulta budget da ordem' })
  get(@Param('id') orderId: string) {
    return this.getBudgetUseCase.execute(orderId);
  }

  @Post('approve')
  @ApiOperation({ summary: 'Aprova budget da ordem' })
  approve(@Param('id') orderId: string) {
    return this.approveBudgetUseCase.execute(orderId);
  }

  @Post('reject')
  @ApiOperation({ summary: 'Rejeita budget da ordem' })
  reject(@Param('id') orderId: string, @Body() body: RejectBudgetDto) {
    return this.rejectBudgetUseCase.execute({
      orderId,
      reason: body.reason,
    });
  }
}

