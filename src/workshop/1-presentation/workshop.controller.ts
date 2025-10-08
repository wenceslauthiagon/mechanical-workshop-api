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

@ApiTags('customers')
@Controller('customers')
export class WorkshopController {
  constructor(private readonly createOrderService: CreateOrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo cliente' })
  @ApiBody({ type: CreateCustomerDto })
  @ApiResponse({
    status: 201,
    description: 'Cliente criado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Email ou documento já cadastrado',
  })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.createOrderService.create(createCustomerDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes retornada com sucesso',
  })
  findAll() {
    return this.createOrderService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do cliente',
    example: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.createOrderService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar cliente' })
  @ApiParam({
    name: 'id',
    description: 'ID do cliente',
    example: 'uuid',
  })
  @ApiBody({ type: UpdateCustomerDto })
  @ApiResponse({
    status: 200,
    description: 'Cliente atualizado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Email ou documento já cadastrado',
  })
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.createOrderService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover cliente' })
  @ApiParam({
    name: 'id',
    description: 'ID do cliente',
    example: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Cliente removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado',
  })
  remove(@Param('id') id: string) {
    return this.createOrderService.remove(id);
  }
}
