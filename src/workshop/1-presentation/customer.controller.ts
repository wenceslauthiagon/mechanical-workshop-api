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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateOrderService } from '../2-application/create-order.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dtos';

@ApiTags('Customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CreateOrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo cliente',
    description: 'Cria um novo cliente no sistema com validação de CPF/CNPJ',
  })
  @ApiBody({ type: CreateCustomerDto })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Email ou documento já cadastrado' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os clientes',
    description: 'Retorna lista completa de clientes cadastrados',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes retornada com sucesso',
  })
  findAll() {
    return this.customerService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar cliente por ID',
    description: 'Retorna um cliente específico pelo seu ID',
  })
  @ApiParam({ name: 'id', description: 'ID do cliente', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar cliente',
    description: 'Atualiza dados de um cliente existente',
  })
  @ApiParam({ name: 'id', description: 'ID do cliente', example: 'uuid' })
  @ApiBody({ type: UpdateCustomerDto })
  @ApiResponse({ status: 200, description: 'Cliente atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  @ApiResponse({ status: 409, description: 'Email ou documento já cadastrado' })
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover cliente',
    description: 'Remove um cliente do sistema',
  })
  @ApiParam({ name: 'id', description: 'ID do cliente', example: 'uuid' })
  @ApiResponse({ status: 204, description: 'Cliente removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }
}
