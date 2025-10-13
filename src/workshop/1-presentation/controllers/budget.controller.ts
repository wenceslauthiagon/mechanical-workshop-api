import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BudgetService } from '../../2-application/services/budget.service';
import { CreateBudgetDto } from '../dtos/budget/create-budget.dto';
import { BudgetResponseDto } from '../dtos/budget/budget-response.dto';

@ApiTags('budgets')
@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo orçamento' })
  @ApiResponse({
    status: 201,
    description: 'Orçamento criado com sucesso',
    type: BudgetResponseDto,
  })
  async create(
    @Body() createBudgetDto: CreateBudgetDto,
  ): Promise<BudgetResponseDto> {
    const budget = await this.budgetService.create(createBudgetDto);
    return new BudgetResponseDto(budget);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os orçamentos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de orçamentos',
    type: [BudgetResponseDto],
  })
  async findAll(): Promise<BudgetResponseDto[]> {
    const budgets = await this.budgetService.findAll();
    return budgets.map((budget) => new BudgetResponseDto(budget));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar orçamento por ID' })
  @ApiParam({ name: 'id', description: 'ID do orçamento' })
  @ApiResponse({
    status: 200,
    description: 'Orçamento encontrado',
    type: BudgetResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<BudgetResponseDto> {
    const budget = await this.budgetService.findById(id);
    return new BudgetResponseDto(budget);
  }

  @Get('service-order/:serviceOrderId')
  @ApiOperation({ summary: 'Buscar orçamentos por ordem de serviço' })
  @ApiParam({ name: 'serviceOrderId', description: 'ID da ordem de serviço' })
  @ApiResponse({
    status: 200,
    description: 'Orçamentos da ordem de serviço',
    type: [BudgetResponseDto],
  })
  async findByServiceOrder(
    @Param('serviceOrderId') serviceOrderId: string,
  ): Promise<BudgetResponseDto[]> {
    const budgets =
      await this.budgetService.findByServiceOrderId(serviceOrderId);
    return budgets.map((budget) => new BudgetResponseDto(budget));
  }

  @Put(':id/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar orçamento para o cliente' })
  @ApiParam({ name: 'id', description: 'ID do orçamento' })
  @ApiResponse({
    status: 200,
    description: 'Orçamento enviado com sucesso',
    type: BudgetResponseDto,
  })
  async sendBudget(@Param('id') id: string): Promise<BudgetResponseDto> {
    const budget = await this.budgetService.sendBudget(id);
    return new BudgetResponseDto(budget);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir orçamento' })
  @ApiParam({ name: 'id', description: 'ID do orçamento' })
  @ApiResponse({
    status: 204,
    description: 'Orçamento excluído com sucesso',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.budgetService.delete(id);
  }
}
