import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { CreateCustomerUseCase } from '../../application/use-cases/customer/create-customer.use-case';
import {
  CreateCustomerDto,
  CustomerResponseDto,
  UpdateCustomerDto,
} from '../../application/dtos/customer.dto';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly createCustomerUseCase: CreateCustomerUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Customer already exists' })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    return this.createCustomerUseCase.execute(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({
    status: 200,
    description: 'List of customers',
    type: [CustomerResponseDto],
  })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{ customers: CustomerResponseDto[]; total: number }> {
    // TODO: Implement findAll use case with pagination
    console.log(`Finding customers: page ${page}, limit ${limit}`);
    return Promise.resolve({ customers: [], total: 0 });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer found',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  findOne(@Param('id') id: string): Promise<CustomerResponseDto> {
    // TODO: Implement findOne use case
    console.log(`Finding customer with id: ${id}`);
    return Promise.reject(new Error('Not implemented'));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiResponse({
    status: 200,
    description: 'Customer updated successfully',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    // TODO: Implement update use case
    console.log(`Updating customer ${id} with data:`, updateCustomerDto);
    return Promise.reject(new Error('Not implemented'));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer' })
  @ApiResponse({ status: 204, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  remove(@Param('id') id: string): Promise<void> {
    // TODO: Implement delete use case
    console.log(`Removing customer with id: ${id}`);
    return Promise.reject(new Error('Not implemented'));
  }
}
