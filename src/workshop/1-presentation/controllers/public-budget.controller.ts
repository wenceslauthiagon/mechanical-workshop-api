import {
  Controller,
  Get,
  Put,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BudgetService } from '../../2-application/services/budget.service';
import { BudgetResponseDto } from '../dtos/budget/budget-response.dto';
import { BUDGET_CONSTANTS } from '../../../shared/constants/budget.constants';
import { BudgetStatus } from '../../3-domain/entities/budget.entity';

@ApiTags('Public - Budgets')
@Controller('public/budgets')
export class PublicBudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Visualizar orçamento público',
    description: 'Endpoint público para cliente visualizar orçamento enviado',
  })
  @ApiParam({ name: 'id', description: 'ID do orçamento' })
  @ApiResponse({
    status: 200,
    description: 'Orçamento encontrado',
    type: BudgetResponseDto,
  })
  async viewBudget(@Param('id') id: string): Promise<BudgetResponseDto> {
    const budget = await this.budgetService.findById(id);
    return new BudgetResponseDto(budget);
  }

  @Put(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Aprovar orçamento',
    description: 'Endpoint público para cliente aprovar orçamento',
  })
  @ApiParam({ name: 'id', description: 'ID do orçamento' })
  @ApiResponse({
    status: 200,
    description: 'Orçamento aprovado com sucesso',
    type: BudgetResponseDto,
  })
  async approveBudget(@Param('id') id: string): Promise<{
    budget: BudgetResponseDto;
    message: string;
  }> {
    const budget = await this.budgetService.approveBudget(id);
    return {
      budget: new BudgetResponseDto(budget),
      message: BUDGET_CONSTANTS.MESSAGES.APPROVED_SUCCESS,
    };
  }

  @Put(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rejeitar orçamento',
    description: 'Endpoint público para cliente rejeitar orçamento',
  })
  @ApiParam({ name: 'id', description: 'ID do orçamento' })
  @ApiResponse({
    status: 200,
    description: 'Orçamento rejeitado com sucesso',
    type: BudgetResponseDto,
  })
  async rejectBudget(@Param('id') id: string): Promise<{
    budget: BudgetResponseDto;
    message: string;
  }> {
    const budget = await this.budgetService.rejectBudget(id);
    return {
      budget: new BudgetResponseDto(budget),
      message: BUDGET_CONSTANTS.MESSAGES.REJECTED_SUCCESS,
    };
  }

  @Get(':id/status')
  @ApiOperation({
    summary: 'Verificar status do orçamento',
    description: 'Endpoint público para verificar status atual do orçamento',
  })
  @ApiParam({ name: 'id', description: 'ID do orçamento' })
  @ApiResponse({
    status: 200,
    description: 'Status do orçamento',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string' },
        validUntil: { type: 'string', format: 'date-time' },
        isExpired: { type: 'boolean' },
        canApprove: { type: 'boolean' },
        canReject: { type: 'boolean' },
      },
    },
  })
  async getBudgetStatus(@Param('id') id: string): Promise<{
    id: string;
    status: string;
    validUntil: Date;
    isExpired: boolean;
    canApprove: boolean;
    canReject: boolean;
  }> {
    const budget = await this.budgetService.findById(id);
    const isExpired = new Date() > budget.validUntil;
    const canInteract = budget.status === BudgetStatus.ENVIADO && !isExpired;

    return {
      id: budget.id,
      status: budget.status,
      validUntil: budget.validUntil,
      isExpired,
      canApprove: canInteract,
      canReject: canInteract,
    };
  }
}
