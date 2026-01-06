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
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { CreateVehicleDto } from '../dtos/vehicle/create-vehicle.dto';
import { UpdateVehicleDto } from '../dtos';
import { VehicleResponseDto } from '../dtos/vehicle/vehicle-response.dto';
import { VehicleService } from '../../2-application/services/vehicle.service';
import { PaginationDto, PaginatedResponseDto } from '../../../shared';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';

@ApiTags('Vehicles')
@ApiBearerAuth('JWT-auth')
@Controller('api/vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo veículo',
    description:
      'Cria um novo veículo vinculado a um cliente com validação de placa',
  })
  @ApiBody({ type: CreateVehicleDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Veículo criado com sucesso',
    type: VehicleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos ou placa já cadastrada',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cliente não encontrado',
  })
  async create(
    @Body() createVehicleDto: CreateVehicleDto,
  ): Promise<VehicleResponseDto> {
    return await this.vehicleService.create(createVehicleDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar veículos com paginação',
    description: 'Retorna lista paginada de veículos cadastrados',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada de veículos retornada com sucesso',
  })
  async findAllPaginated(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<VehicleResponseDto>> {
    return await this.vehicleService.findAllPaginated(paginationDto);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Listar todos os veículos (sem paginação)',
    description:
      'Retorna lista completa de veículos - use com cuidado em produção',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista completa de veículos retornada com sucesso',
    type: [VehicleResponseDto],
  })
  async findAll(): Promise<VehicleResponseDto[]> {
    return await this.vehicleService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar veículo por ID',
    description: 'Retorna um veículo específico pelo seu ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do veículo',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Veículo encontrado com sucesso',
    type: VehicleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Veículo não encontrado',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<VehicleResponseDto> {
    return await this.vehicleService.findById(id);
  }

  @Get('customer/:customerId')
  @ApiOperation({
    summary: 'Buscar veículos por cliente',
    description: 'Retorna todos os veículos de um cliente específico',
  })
  @ApiParam({
    name: 'customerId',
    description: 'ID do cliente',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Veículos do cliente retornados com sucesso',
    type: [VehicleResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cliente não encontrado',
  })
  async findByCustomer(
    @Param('customerId', ParseUUIDPipe) customerId: string,
  ): Promise<VehicleResponseDto[]> {
    return await this.vehicleService.findByCustomerId(customerId);
  }

  @Get('plate/:licensePlate')
  @ApiOperation({
    summary: 'Buscar veículo por placa',
    description: 'Retorna um veículo pela sua placa',
  })
  @ApiParam({
    name: 'licensePlate',
    description: 'Placa do veículo',
    example: 'ABC-1234',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Veículo encontrado com sucesso',
    type: VehicleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Veículo não encontrado',
  })
  async findByPlate(
    @Param('licensePlate') licensePlate: string,
  ): Promise<VehicleResponseDto> {
    return await this.vehicleService.findByLicensePlate(licensePlate);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar veículo',
    description: 'Atualiza dados de um veículo existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do veículo',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateVehicleDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Veículo atualizado com sucesso',
    type: VehicleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos ou placa já cadastrada',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Veículo não encontrado',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ): Promise<VehicleResponseDto> {
    return await this.vehicleService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover veículo',
    description: 'Remove um veículo do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do veículo',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Veículo removido com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Veículo não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Veículo possui ordens de serviço vinculadas',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.vehicleService.remove(id);
  }
}
