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
import {
  API_SUMMARY,
  API_DESCRIPTIONS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from '../../shared/constants/messages.constants';

@ApiTags('Customers')
@Controller('api')
export class WorkshopController {
  constructor(private readonly customerService: CreateOrderService) {}

  // ================================
  // CUSTOMER CRUD
  // ================================
  @Post('customers')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: API_SUMMARY.CREATE_CLIENT,
    description: API_DESCRIPTIONS.CREATE_CLIENT,
  })
  @ApiBody({ type: CreateCustomerDto })
  @ApiResponse({ status: 201, description: SUCCESS_MESSAGES.CLIENT_CREATED })
  @ApiResponse({ status: 400, description: ERROR_MESSAGES.INVALID_DATA })
  @ApiResponse({
    status: 409,
    description: ERROR_MESSAGES.EMAIL_OR_DOCUMENT_ALREADY_EXISTS,
  })
  createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Get('customers')
  @ApiOperation({
    summary: API_SUMMARY.LIST_CLIENTS,
    description: API_DESCRIPTIONS.LIST_CLIENTS,
  })
  @ApiResponse({
    status: 200,
    description: SUCCESS_MESSAGES.CLIENTS_LISTED,
  })
  findAllCustomers() {
    return this.customerService.findAll();
  }

  @Get('customers/:id')
  @ApiOperation({
    summary: API_SUMMARY.FIND_CLIENT_BY_ID,
    description: API_DESCRIPTIONS.FIND_CLIENT_BY_ID,
  })
  @ApiParam({ name: 'id', description: 'ID do cliente', example: 'uuid' })
  @ApiResponse({ status: 200, description: SUCCESS_MESSAGES.CLIENT_FOUND })
  @ApiResponse({ status: 404, description: ERROR_MESSAGES.CLIENT_NOT_FOUND })
  findOneCustomer(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Patch('customers/:id')
  @ApiOperation({
    summary: API_SUMMARY.UPDATE_CLIENT,
    description: API_DESCRIPTIONS.UPDATE_CLIENT,
  })
  @ApiParam({ name: 'id', description: 'ID do cliente', example: 'uuid' })
  @ApiBody({ type: UpdateCustomerDto })
  @ApiResponse({ status: 200, description: SUCCESS_MESSAGES.CLIENT_UPDATED })
  @ApiResponse({ status: 400, description: ERROR_MESSAGES.INVALID_DATA })
  @ApiResponse({ status: 404, description: ERROR_MESSAGES.CLIENT_NOT_FOUND })
  @ApiResponse({
    status: 409,
    description: ERROR_MESSAGES.EMAIL_OR_DOCUMENT_ALREADY_EXISTS,
  })
  updateCustomer(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete('customers/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: API_SUMMARY.DELETE_CLIENT,
    description: API_DESCRIPTIONS.DELETE_CLIENT,
  })
  @ApiParam({ name: 'id', description: 'ID do cliente', example: 'uuid' })
  @ApiResponse({ status: 204, description: SUCCESS_MESSAGES.CLIENT_DELETED })
  @ApiResponse({ status: 404, description: ERROR_MESSAGES.CLIENT_NOT_FOUND })
  removeCustomer(@Param('id') id: string) {
    return this.customerService.remove(id);
  }
}
