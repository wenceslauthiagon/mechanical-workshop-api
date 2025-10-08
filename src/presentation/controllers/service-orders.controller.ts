import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { CreateServiceOrderUseCase } from '../../application/use-cases/service-order/create-service-order.use-case';
import {
  CreateServiceOrderDto,
  ServiceOrderResponseDto,
  UpdateServiceOrderStatusDto,
} from '../../application/dtos/service-order.dto';

@ApiTags('service-orders')
@Controller('service-orders')
export class ServiceOrdersController {
  constructor(
    private readonly createServiceOrderUseCase: CreateServiceOrderUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service order' })
  @ApiResponse({
    status: 201,
    description: 'Service order created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Body() createOrderDto: CreateServiceOrderDto,
  ): Promise<ServiceOrderResponseDto> {
    return this.createServiceOrderUseCase.execute(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all service orders' })
  @ApiResponse({ status: 200, description: 'List of service orders' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
  ): Promise<{ orders: ServiceOrderResponseDto[]; total: number }> {
    // TODO: Implement findAll use case
    console.log(
      `Finding orders: page ${page}, limit ${limit}, status ${status || 'all'}`,
    );
    return Promise.resolve({ orders: [], total: 0 });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service order by ID' })
  @ApiResponse({ status: 200, description: 'Service order found' })
  @ApiResponse({ status: 404, description: 'Service order not found' })
  findOne(@Param('id') id: string): Promise<ServiceOrderResponseDto> {
    // TODO: Implement findOne use case
    console.log(`Finding service order with id: ${id}`);
    return Promise.reject(new Error('Not implemented'));
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update service order status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Service order not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateServiceOrderStatusDto,
  ): Promise<ServiceOrderResponseDto> {
    // TODO: Implement updateStatus use case
    console.log(`Updating status for order ${id}:`, updateStatusDto);
    return Promise.reject(new Error('Not implemented'));
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve service order' })
  @ApiResponse({
    status: 200,
    description: 'Service order approved successfully',
  })
  @ApiResponse({ status: 404, description: 'Service order not found' })
  approve(@Param('id') id: string): Promise<ServiceOrderResponseDto> {
    // TODO: Implement approve use case
    console.log(`Approving service order with id: ${id}`);
    return Promise.reject(new Error('Not implemented'));
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get service orders by customer ID for tracking' })
  @ApiResponse({ status: 200, description: 'Customer service orders' })
  getByCustomerForTracking(
    @Param('customerId') customerId: string,
  ): Promise<ServiceOrderResponseDto[]> {
    // TODO: Implement customer tracking use case
    console.log(`Getting orders for customer: ${customerId}`);
    return Promise.reject(new Error('Not implemented'));
  }
}
