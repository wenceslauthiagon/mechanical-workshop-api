import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ServiceOrderService } from '../../2-application/services/service-order.service';
import { ServiceOrderResponseDto } from '../dtos/service-order/service-order-response.dto';

@ApiTags('Public - Service Orders')
@Controller('public/service-orders')
export class PublicServiceOrderController {
  constructor(private readonly serviceOrderService: ServiceOrderService) {}

  @Get('order/:orderNumber')
  @ApiOperation({
    summary: 'Consultar OS por número (API Pública)',
    description:
      'Permite que o cliente consulte o status de sua ordem de serviço usando o número da OS. Não requer autenticação.',
  })
  @ApiParam({
    name: 'orderNumber',
    description: 'Número da ordem de serviço (ex: OS-2025-001)',
    example: 'OS-2025-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados da ordem de serviço',
    type: ServiceOrderResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ordem de serviço não encontrada',
  })
  async findByOrderNumber(
    @Param('orderNumber') orderNumber: string,
  ): Promise<ServiceOrderResponseDto> {
    try {
      return await this.serviceOrderService.findByOrderNumber(orderNumber);
    } catch {
      throw new HttpException(
        'Ordem de serviço não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('customer/:document')
  @ApiOperation({
    summary: 'Consultar OS por CPF/CNPJ (API Pública)',
    description:
      'Permite que o cliente consulte todas as suas ordens de serviço usando CPF ou CNPJ. Não requer autenticação.',
  })
  @ApiParam({
    name: 'document',
    description: 'CPF ou CNPJ do cliente',
    example: '12345678901',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ordens de serviço do cliente',
    type: [ServiceOrderResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado',
  })
  async findByCustomerDocument(
    @Param('document') document: string,
  ): Promise<ServiceOrderResponseDto[]> {
    try {
      return await this.serviceOrderService.findByCustomerDocument(document);
    } catch {
      throw new HttpException(
        'Cliente não encontrado ou sem ordens de serviço',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('vehicle/:licensePlate')
  @ApiOperation({
    summary: 'Consultar OS por placa do veículo (API Pública)',
    description:
      'Permite consultar ordens de serviço usando a placa do veículo. Não requer autenticação.',
  })
  @ApiParam({
    name: 'licensePlate',
    description: 'Placa do veículo',
    example: 'ABC-1234',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ordens de serviço do veículo',
    type: [ServiceOrderResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Veículo não encontrado',
  })
  async findByVehiclePlate(
    @Param('licensePlate') licensePlate: string,
  ): Promise<ServiceOrderResponseDto[]> {
    try {
      return await this.serviceOrderService.findByVehiclePlate(licensePlate);
    } catch {
      throw new HttpException(
        'Veículo não encontrado ou sem ordens de serviço',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
