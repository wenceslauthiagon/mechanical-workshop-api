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

import { CreateServiceDto } from '../dtos/service/create-service.dto';
import { UpdateServiceDto } from '../dtos/service/update-service.dto';
import { ServiceService } from '../../2-application/services/service.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { PaginationDto } from '../../../shared';

@ApiTags('Services')
@ApiBearerAuth('JWT-auth')
@Controller('api/services')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo serviço',
    description: 'Cria um novo serviço com preço, tempo estimado e categoria',
  })
  @ApiBody({ type: CreateServiceDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Serviço criado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Serviço já cadastrado',
  })
  async create(@Body() createServiceDto: CreateServiceDto) {
    return await this.serviceService.create(createServiceDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar serviços com paginação',
    description: 'Retorna lista paginada de serviços com filtros opcionais',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filtrar por categoria',
  })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Filtrar por status ativo/inativo',
    type: Boolean,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada de serviços retornada com sucesso',
  })
  async findAllPaginated(
    @Query() paginationDto: PaginationDto,
    @Query('category') category?: string,
    @Query('active') active?: boolean,
  ) {
    return await this.serviceService.findAllPaginated(paginationDto, {
      category,
      active,
    });
  }

  @Get('all')
  @ApiOperation({
    summary: 'Listar todos os serviços (sem paginação)',
    description:
      'Retorna lista completa de serviços - use com cuidado em produção',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filtrar por categoria',
  })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Filtrar por status ativo/inativo',
    type: Boolean,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista completa de serviços retornada com sucesso',
  })
  async findAll(
    @Query('category') category?: string,
    @Query('active') active?: boolean,
  ) {
    return await this.serviceService.findAll({ category, active });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar serviço por ID',
    description: 'Retorna um serviço específico pelo seu ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do serviço',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Serviço encontrado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Serviço não encontrado',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.serviceService.findById(id);
  }

  @Get('category/:category')
  @ApiOperation({
    summary: 'Buscar serviços por categoria',
    description: 'Retorna todos os serviços de uma categoria específica',
  })
  @ApiParam({
    name: 'category',
    description: 'Categoria do serviço',
    example: 'Manutenção Preventiva',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Serviços da categoria retornados com sucesso',
  })
  async findByCategory(@Param('category') category: string) {
    return await this.serviceService.findByCategory(category);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar serviço',
    description: 'Atualiza dados de um serviço existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do serviço',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateServiceDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Serviço atualizado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Serviço não encontrado',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return await this.serviceService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover serviço',
    description: 'Remove um serviço do sistema (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do serviço',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Serviço removido com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Serviço não encontrado',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceService.remove(id);
  }
}
