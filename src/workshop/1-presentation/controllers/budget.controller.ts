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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BudgetService } from '../../2-application/services/budget.service';
import { CreateBudgetDto } from '../dtos/budget/create-budget.dto';
import { BudgetResponseDto } from '../dtos/budget/budget-response.dto';
import { BudgetWithRelationsResponseDto } from '../dtos/budget/budget-with-relations-response.dto';
import { PaginationDto, PaginatedResponseDto } from '../../../shared';

@ApiTags('Budgets')
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
  @ApiOperation({ summary: 'Listar orçamentos com paginação' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de orçamentos',
  })
  async findAllPaginated(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<BudgetResponseDto>> {
    const result = await this.budgetService.findAllPaginated(paginationDto);
    return {
      data: result.data.map((budget) => new BudgetResponseDto(budget)),
      pagination: result.pagination,
    };
  }

  @Get('all')
  @ApiOperation({ summary: 'Listar todos os orçamentos (sem paginação)' })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de orçamentos - use com cuidado em produção',
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

  // Endpoints with fresh data for related entities
  @Get('enriched')
  @ApiOperation({
    summary: 'Listar todos os orçamentos com dados relacionados atualizados',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de orçamentos com dados frescos de clientes, OS e itens',
    type: [BudgetWithRelationsResponseDto],
  })
  async findAllEnriched(): Promise<BudgetWithRelationsResponseDto[]> {
    return await this.budgetService.findAllWithRelations();
  }

  @Get(':id/enriched')
  @ApiOperation({
    summary: 'Buscar orçamento por ID com dados relacionados atualizados',
  })
  @ApiParam({ name: 'id', description: 'ID do orçamento' })
  @ApiResponse({
    status: 200,
    description: 'Orçamento com dados frescos de cliente, OS e itens',
    type: BudgetWithRelationsResponseDto,
  })
  async findOneEnriched(
    @Param('id') id: string,
  ): Promise<BudgetWithRelationsResponseDto> {
    return await this.budgetService.findByIdWithRelations(id);
  }

  @Get('customer/:customerId/enriched')
  @ApiOperation({
    summary: 'Buscar orçamentos por cliente com dados relacionados atualizados',
  })
  @ApiParam({ name: 'customerId', description: 'ID do cliente' })
  @ApiResponse({
    status: 200,
    description: 'Orçamentos do cliente com dados frescos',
    type: [BudgetWithRelationsResponseDto],
  })
  async findByCustomerEnriched(
    @Param('customerId') customerId: string,
  ): Promise<BudgetWithRelationsResponseDto[]> {
    return await this.budgetService.findByCustomerIdWithRelations(customerId);
  }

  @Get('service-order/:serviceOrderId/enriched')
  @ApiOperation({
    summary: 'Buscar orçamentos por OS com dados relacionados atualizados',
  })
  @ApiParam({ name: 'serviceOrderId', description: 'ID da ordem de serviço' })
  @ApiResponse({
    status: 200,
    description: 'Orçamentos da OS com dados frescos',
    type: [BudgetWithRelationsResponseDto],
  })
  async findByServiceOrderEnriched(
    @Param('serviceOrderId') serviceOrderId: string,
  ): Promise<BudgetWithRelationsResponseDto[]> {
    return await this.budgetService.findByServiceOrderIdWithRelations(
      serviceOrderId,
    );
  }
}
