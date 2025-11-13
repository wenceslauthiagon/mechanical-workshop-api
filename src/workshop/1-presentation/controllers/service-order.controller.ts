import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  ParseUUIDPipe,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ServiceOrderService } from '../../2-application/services/service-order.service';
import { CreateServiceOrderDto } from '../dtos/service-order/create-service-order.dto';
import { UpdateServiceOrderStatusDto } from '../dtos/service-order/update-service-order-status.dto';
import { ServiceOrderResponseDto } from '../dtos/service-order/service-order-response.dto';
import { PaginationDto, PaginatedResponseDto } from '../../../shared';

@ApiTags('Service Orders')
@Controller('api/service-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
@ApiBearerAuth('JWT-auth')
export class ServiceOrderController {
  constructor(private readonly serviceOrderService: ServiceOrderService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar nova ordem de serviço',
    description:
      'Cria uma nova ordem de serviço com identificação do cliente, veículo, serviços e peças. Gera orçamento automaticamente.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Ordem de serviço criada com sucesso',
    type: ServiceOrderResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cliente, veículo, serviço ou peça não encontrado',
  })
  async create(
    @Body() createServiceOrderDto: CreateServiceOrderDto,
  ): Promise<ServiceOrderResponseDto> {
    return this.serviceOrderService.create(createServiceOrderDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar ordens de serviço com paginação',
    description: 'Retorna lista paginada de ordens de serviço do sistema',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada de ordens de serviço retornada com sucesso',
  })
  @ApiQuery({
    name: 'customerId',
    required: false,
    description: 'Filtrar por ID do cliente',
  })
  async findAllPaginated(
    @Query() paginationDto: PaginationDto,
    @Query('customerId') customerId?: string,
  ): Promise<PaginatedResponseDto<ServiceOrderResponseDto>> {
    if (customerId) {
      const orders = await this.serviceOrderService.findByCustomer(customerId);
      return new PaginatedResponseDto(orders, 0, orders.length, orders.length);
    }
    return this.serviceOrderService.findAllPaginated(paginationDto);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Listar todas as ordens de serviço (sem paginação)',
    description:
      'Retorna todas as ordens de serviço - use com cuidado em produção',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista completa de ordens de serviço retornada com sucesso',
    type: [ServiceOrderResponseDto],
  })
  async findAll(): Promise<ServiceOrderResponseDto[]> {
    return this.serviceOrderService.findAll();
  }

  @Get('priority')
  @ApiOperation({
    summary: 'Listar ordens de serviço com prioridade',
    description:
      'Lista ordens de serviço ordenadas por prioridade (Em Execução > Aguardando Aprovação > Diagnóstico > Recebida) e data (mais antigas primeiro). Exclui OS finalizadas e entregues.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página',
  })
  @ApiQuery({
    name: 'size',
    required: false,
    type: Number,
    description: 'Tamanho da página',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista ordenada por prioridade retornada com sucesso',
  })
  async findAllWithPriority(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<ServiceOrderResponseDto>> {
    return this.serviceOrderService.findAllPaginatedWithPriority(paginationDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar ordem de serviço por ID',
    description: 'Retorna os detalhes completos de uma ordem de serviço',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da ordem de serviço',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ordem de serviço encontrada',
    type: ServiceOrderResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ordem de serviço não encontrada',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ServiceOrderResponseDto> {
    return this.serviceOrderService.findById(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Atualizar status da ordem de serviço',
    description:
      'Atualiza o status da ordem de serviço seguindo o fluxo: RECEBIDA → EM_DIAGNOSTICO → AGUARDANDO_APROVACAO → EM_EXECUCAO → FINALIZADA → ENTREGUE',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da ordem de serviço',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status atualizado com sucesso',
    type: ServiceOrderResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Transição de status inválida',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ordem de serviço não encontrada',
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateServiceOrderStatusDto,
  ): Promise<ServiceOrderResponseDto> {
    return this.serviceOrderService.updateStatus(id, updateStatusDto);
  }

  @Patch(':id/approve')
  @ApiOperation({
    summary: 'Aprovar orçamento da ordem de serviço',
    description:
      'Aprova o orçamento e move a ordem de serviço para status EM_EXECUCAO',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da ordem de serviço',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Orçamento aprovado com sucesso',
    type: ServiceOrderResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Ordem de serviço não está aguardando aprovação',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ordem de serviço não encontrada',
  })
  async approveOrder(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ServiceOrderResponseDto> {
    return this.serviceOrderService.approveOrder(id);
  }

  @Get(':id/status-history')
  @ApiOperation({
    summary: 'Histórico de status da ordem de serviço',
    description:
      'Retorna o histórico completo de mudanças de status da ordem de serviço',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da ordem de serviço',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Histórico de status retornado com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string' },
          notes: { type: 'string' },
          changedBy: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ordem de serviço não encontrada',
  })
  async getStatusHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceOrderService.getStatusHistory(id);
  }

  @Get('customer/:customerId')
  @ApiOperation({
    summary: 'Buscar ordens de serviço por cliente',
    description: 'Retorna todas as ordens de serviço de um cliente específico',
  })
  @ApiParam({
    name: 'customerId',
    description: 'ID único do cliente',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ordens de serviço do cliente retornadas com sucesso',
    type: [ServiceOrderResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cliente não encontrado',
  })
  async findByCustomer(
    @Param('customerId', ParseUUIDPipe) customerId: string,
  ): Promise<ServiceOrderResponseDto[]> {
    return this.serviceOrderService.findByCustomer(customerId);
  }
}
