import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PartService } from '../../2-application/services/part.service';
import { CreatePartDto } from '../dtos/part/create-part.dto';
import { UpdatePartDto } from '../dtos/part/update-part.dto';
import { PartResponseDto } from '../dtos/part/part-response.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { PaginationDto, PaginatedResponseDto } from '../../../shared';

@ApiTags('Parts')
@ApiBearerAuth('JWT-auth')
@Controller('api/parts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PartController {
  constructor(private readonly partService: PartService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar nova peça',
    description: 'Cadastrar uma nova peça/insumo no sistema',
  })
  @ApiBody({ type: CreatePartDto })
  @ApiResponse({
    status: 201,
    description: 'Peça criada com sucesso',
    type: PartResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Número da peça já existe' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPartDto: CreatePartDto): Promise<PartResponseDto> {
    const part = await this.partService.create(createPartDto);
    return this.mapToResponseDto(part);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar peças com paginação',
    description: 'Listar peças de forma paginada com filtros opcionais',
  })
  @ApiQuery({
    name: 'supplier',
    required: false,
    description: 'Filtrar por fornecedor',
  })
  @ApiQuery({
    name: 'active',
    required: false,
    type: Boolean,
    description: 'Filtrar por status ativo/inativo',
  })
  @ApiQuery({
    name: 'lowStock',
    required: false,
    type: Boolean,
    description: 'Filtrar peças com estoque baixo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de peças',
  })
  async findAllPaginated(
    @Query() paginationDto: PaginationDto,
    @Query('supplier') supplier?: string,
    @Query('active') active?: boolean,
    @Query('lowStock') lowStock?: boolean,
  ): Promise<PaginatedResponseDto<PartResponseDto>> {
    const result = await this.partService.findAllPaginated(paginationDto, {
      supplier,
      active,
      lowStock,
    });

    return {
      data: result.data.map((part) => this.mapToResponseDto(part)),
      pagination: result.pagination,
    };
  }

  @Get('all')
  @ApiOperation({
    summary: 'Listar todas as peças (sem paginação)',
    description:
      'Listar todas as peças com filtros opcionais - use com cuidado em produção',
  })
  @ApiQuery({
    name: 'supplier',
    required: false,
    description: 'Filtrar por fornecedor',
  })
  @ApiQuery({
    name: 'active',
    required: false,
    type: Boolean,
    description: 'Filtrar por status ativo/inativo',
  })
  @ApiQuery({
    name: 'lowStock',
    required: false,
    type: Boolean,
    description: 'Filtrar peças com estoque baixo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de peças',
    type: [PartResponseDto],
  })
  async findAll(
    @Query('supplier') supplier?: string,
    @Query('active') active?: boolean,
    @Query('lowStock') lowStock?: boolean,
  ): Promise<PartResponseDto[]> {
    const parts = await this.partService.findAll({
      supplier,
      active,
      lowStock,
    });
    return parts.map((part) => this.mapToResponseDto(part));
  }

  @Get('low-stock')
  @ApiOperation({
    summary: 'Listar peças com estoque baixo',
    description: 'Listar peças onde estoque atual <= estoque mínimo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de peças com estoque baixo',
    type: [PartResponseDto],
  })
  async findLowStock(): Promise<PartResponseDto[]> {
    const parts = await this.partService.findLowStock();
    return parts.map((part) => this.mapToResponseDto(part));
  }

  @Get('supplier/:supplier')
  @ApiOperation({
    summary: 'Buscar peças por fornecedor',
    description: 'Listar todas as peças de um fornecedor específico',
  })
  @ApiParam({ name: 'supplier', description: 'Nome do fornecedor' })
  @ApiResponse({
    status: 200,
    description: 'Lista de peças do fornecedor',
    type: [PartResponseDto],
  })
  async findBySupplier(
    @Param('supplier') supplier: string,
  ): Promise<PartResponseDto[]> {
    const parts = await this.partService.findBySupplier(supplier);
    return parts.map((part) => this.mapToResponseDto(part));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar peça por ID',
    description: 'Buscar uma peça específica pelo ID',
  })
  @ApiParam({ name: 'id', description: 'ID da peça' })
  @ApiResponse({
    status: 200,
    description: 'Dados da peça',
    type: PartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Peça não encontrada' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PartResponseDto> {
    const part = await this.partService.findById(id);
    return this.mapToResponseDto(part);
  }

  @Get('part-number/:partNumber')
  @ApiOperation({
    summary: 'Buscar peça por número',
    description: 'Buscar uma peça específica pelo número da peça',
  })
  @ApiParam({ name: 'partNumber', description: 'Número da peça' })
  @ApiResponse({
    status: 200,
    description: 'Dados da peça',
    type: PartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Peça não encontrada' })
  async findByPartNumber(
    @Param('partNumber') partNumber: string,
  ): Promise<PartResponseDto> {
    const part = await this.partService.findByPartNumber(partNumber);
    return this.mapToResponseDto(part);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar peça',
    description: 'Atualizar dados de uma peça existente',
  })
  @ApiParam({ name: 'id', description: 'ID da peça' })
  @ApiBody({ type: UpdatePartDto })
  @ApiResponse({
    status: 200,
    description: 'Peça atualizada com sucesso',
    type: PartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Peça não encontrada' })
  @ApiResponse({ status: 409, description: 'Número da peça já existe' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePartDto: UpdatePartDto,
  ): Promise<PartResponseDto> {
    const part = await this.partService.update(id, updatePartDto);
    return this.mapToResponseDto(part);
  }

  @Patch(':id/stock')
  @ApiOperation({
    summary: 'Atualizar estoque',
    description:
      'Atualizar quantidade em estoque (positivo adiciona, negativo remove)',
  })
  @ApiParam({ name: 'id', description: 'ID da peça' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: {
          type: 'number',
          description: 'Quantidade a adicionar/remover',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Estoque atualizado com sucesso',
    type: PartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Peça não encontrada' })
  @ApiResponse({ status: 409, description: 'Estoque insuficiente' })
  async updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('quantity') quantity: number,
  ): Promise<PartResponseDto> {
    const part = await this.partService.updateStock(id, quantity);
    return this.mapToResponseDto(part);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover peça',
    description: 'Desativar uma peça (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'ID da peça' })
  @ApiResponse({ status: 200, description: 'Peça removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Peça não encontrada' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PartResponseDto> {
    const part = await this.partService.remove(id);
    return this.mapToResponseDto(part);
  }

  private mapToResponseDto(part: any): PartResponseDto {
    return {
      id: part.id,
      name: part.name,
      description: part.description,
      partNumber: part.partNumber,
      price: part.price.toString(),
      stock: part.stock,
      minStock: part.minStock,
      supplier: part.supplier,
      isActive: part.isActive,
      createdAt: part.createdAt,
      updatedAt: part.updatedAt,
    };
  }
}
