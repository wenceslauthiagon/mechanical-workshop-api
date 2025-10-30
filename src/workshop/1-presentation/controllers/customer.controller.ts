import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CustomerService } from '../../2-application/services/customer.service';
import { CreateCustomerDto } from '../dtos/customer/create-customer.dto';
import { UpdateCustomerDto } from '../dtos/customer/update-customer.dto';
import { CustomerResponseDto } from '../dtos/customer/customer-response.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PaginationDto, PaginatedResponseDto } from '../../../shared';

@ApiTags('Customers')
@Controller('api/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
@ApiBearerAuth('JWT-auth')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo cliente',
    description: 'Cria um novo cliente no sistema com validação de CPF/CNPJ',
  })
  @ApiBody({ type: CreateCustomerDto })
  @ApiResponse({
    status: 201,
    description: 'Cliente criado com sucesso',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Email ou documento já cadastrado' })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customerService.create(createCustomerDto);
    return this.mapToResponseDto(customer);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar clientes com paginação',
    description: 'Retorna lista paginada de clientes cadastrados',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de clientes retornada com sucesso',
  })
  async findAllPaginated(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<CustomerResponseDto>> {
    const result = await this.customerService.findAllPaginated(paginationDto);

    return {
      data: result.data.map((customer) => this.mapToResponseDto(customer)),
      pagination: result.pagination,
    };
  }

  @Get('all')
  @ApiOperation({
    summary: 'Listar todos os clientes (sem paginação)',
    description:
      'Retorna lista completa de clientes cadastrados - use com cuidado em produção',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de clientes retornada com sucesso',
    type: [CustomerResponseDto],
  })
  async findAll(): Promise<CustomerResponseDto[]> {
    const customers = await this.customerService.findAll();
    return customers.map((customer) => this.mapToResponseDto(customer));
  }

  @Get('document/:document')
  @ApiOperation({
    summary: 'Buscar cliente por CPF/CNPJ',
    description: 'Busca um cliente específico pelo CPF ou CNPJ',
  })
  @ApiParam({ name: 'document', description: 'CPF ou CNPJ do cliente' })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado com sucesso',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async findByDocument(
    @Param('document') document: string,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customerService.findByDocument(document);
    return this.mapToResponseDto(customer);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar cliente por ID',
    description: 'Retorna um cliente específico pelo seu ID',
  })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado com sucesso',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customerService.findById(id);
    return this.mapToResponseDto(customer);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar cliente',
    description: 'Atualiza dados de um cliente existente',
  })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiBody({ type: UpdateCustomerDto })
  @ApiResponse({
    status: 200,
    description: 'Cliente atualizado com sucesso',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  @ApiResponse({ status: 409, description: 'Email ou documento já cadastrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customerService.update(id, updateCustomerDto);
    return this.mapToResponseDto(customer);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover cliente',
    description: 'Remove um cliente do sistema',
  })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Cliente removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Cliente possui veículos cadastrados',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.customerService.remove(id);
  }

  private mapToResponseDto(customer: any): CustomerResponseDto {
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      type: customer.type,
      document: customer.document,
      additionalInfo: customer.additionalInfo,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      vehicles: customer.vehicles?.map((vehicle) => ({
        id: vehicle.id,
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
      })),
    };
  }
}
